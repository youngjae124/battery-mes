package com.battery.mes.service.inspection.impl;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.battery.mes.common.exception.BadRequestException;
import com.battery.mes.common.exception.NotFoundException;
import com.battery.mes.common.exception.UnauthorizedException;
import com.battery.mes.common.response.PagedResponse;
import com.battery.mes.domain.inspection.Inspection;
import com.battery.mes.domain.lot.Lot;
import com.battery.mes.domain.user.User;
import com.battery.mes.domain.workorder.WorkOrder;
import com.battery.mes.dto.inspection.InspectionDto;
import com.battery.mes.dto.inspection.InspectionSaveRequestDto;
import com.battery.mes.dto.inspection.InspectionSummaryDto;
import com.battery.mes.mapper.inspection.InspectionMapper;
import com.battery.mes.mapper.lot.LotMapper;
import com.battery.mes.mapper.user.UserMapper;
import com.battery.mes.mapper.workorder.WorkOrderMapper;
import com.battery.mes.service.inspection.InspectionService;

@Service
public class InspectionServiceImpl implements InspectionService {

    private static final List<String> PROCESS_TYPES = List.of("IQC", "IPQC", "OQC");
    private static final List<String> AGING_STATUSES = List.of("PASS", "FAIL", "PENDING");
    private static final BigDecimal GRADE_A_RATIO = new BigDecimal("0.33");
    private static final BigDecimal GRADE_B_RATIO = new BigDecimal("0.66");

    private final InspectionMapper inspectionMapper;
    private final LotMapper lotMapper;
    private final WorkOrderMapper workOrderMapper;
    private final UserMapper userMapper;

    public InspectionServiceImpl(InspectionMapper inspectionMapper,
                                 LotMapper lotMapper,
                                 WorkOrderMapper workOrderMapper,
                                 UserMapper userMapper) {
        this.inspectionMapper = inspectionMapper;
        this.lotMapper = lotMapper;
        this.workOrderMapper = workOrderMapper;
        this.userMapper = userMapper;
    }

    @Override
    public PagedResponse<InspectionDto> getInspections(int page, int limit) {
        validatePage(page, limit);
        int offset = (page - 1) * limit;
        List<InspectionDto> items = inspectionMapper.findPaged(offset, limit).stream().map(this::toDto).toList();
        return new PagedResponse<>(items, page, limit, inspectionMapper.countAll());
    }

    @Override
    public InspectionDto getInspection(String inspectionId) {
        return toDto(getInspectionEntity(inspectionId));
    }

    @Override
    public InspectionSummaryDto getInspectionSummary() {
        InspectionSummaryDto summary = inspectionMapper.selectSummary();
        return summary == null ? new InspectionSummaryDto() : summary;
    }

    @Override
    @Transactional
    public InspectionDto createInspection(InspectionSaveRequestDto request, String actorEmail) {
        User inspector = getAuthenticatedUser(actorEmail);
        Lot lot = getLotEntity(request.getLotId());
        WorkOrder workOrder = getWorkOrderEntity(request.getWorkOrderId(), lot.getId());
        InspectionEvaluation evaluation = evaluateMeasurement(
            request.getSpecMin(),
            request.getSpecMax(),
            request.getMeasuredValue()
        );
        LocalDateTime now = LocalDateTime.now();

        Inspection inspection = new Inspection();
        inspection.setId(UUID.randomUUID().toString());
        inspection.setLotId(lot.getId());
        inspection.setWorkOrderId(workOrder == null ? null : workOrder.getId());
        inspection.setInspectorId(inspector.getId());
        inspection.setProcessType(normalizeProcessType(request.getProcessType()));
        inspection.setInspectionItem(normalizeText(request.getInspectionItem(), "inspectionItem"));
        inspection.setSpecMin(request.getSpecMin());
        inspection.setSpecMax(request.getSpecMax());
        inspection.setMeasuredValue(request.getMeasuredValue());
        inspection.setResult(evaluation.result());
        inspection.setGrade(evaluation.grade());
        inspection.setAgingStatus(normalizeAgingStatus(request.getAgingStatus()));
        inspection.setInspectedAt(now);
        inspection.setRemarks(normalizeOptional(request.getRemarks()));
        inspection.setIsDeleted("N");
        inspection.setCreatedAt(now);
        inspection.setUpdatedAt(now);

        inspectionMapper.insert(inspection);
        return toDto(inspectionMapper.findById(inspection.getId()));
    }

    @Override
    @Transactional
    public InspectionDto updateInspection(String inspectionId, InspectionSaveRequestDto request, String actorEmail) {
        Inspection existing = getInspectionEntity(inspectionId);
        User inspector = getAuthenticatedUser(actorEmail);
        Lot lot = getLotEntity(request.getLotId());
        WorkOrder workOrder = getWorkOrderEntity(request.getWorkOrderId(), lot.getId());
        InspectionEvaluation evaluation = evaluateMeasurement(
            request.getSpecMin(),
            request.getSpecMax(),
            request.getMeasuredValue()
        );

        existing.setLotId(lot.getId());
        existing.setWorkOrderId(workOrder == null ? null : workOrder.getId());
        existing.setInspectorId(inspector.getId());
        existing.setProcessType(normalizeProcessType(request.getProcessType()));
        existing.setInspectionItem(normalizeText(request.getInspectionItem(), "inspectionItem"));
        existing.setSpecMin(request.getSpecMin());
        existing.setSpecMax(request.getSpecMax());
        existing.setMeasuredValue(request.getMeasuredValue());
        existing.setResult(evaluation.result());
        existing.setGrade(evaluation.grade());
        existing.setAgingStatus(normalizeAgingStatus(request.getAgingStatus()));
        existing.setRemarks(normalizeOptional(request.getRemarks()));
        existing.setUpdatedAt(LocalDateTime.now());

        inspectionMapper.update(existing);
        return toDto(inspectionMapper.findById(inspectionId));
    }

    @Override
    @Transactional
    public InspectionDto deleteInspection(String inspectionId) {
        Inspection existing = getInspectionEntity(inspectionId);
        inspectionMapper.softDelete(existing.getId(), LocalDateTime.now());
        return toDto(existing);
    }

    private Inspection getInspectionEntity(String inspectionId) {
        String normalizedId = normalizeText(inspectionId, "inspectionId");
        Inspection inspection = inspectionMapper.findById(normalizedId);
        if (inspection == null) {
            throw new NotFoundException("Inspection not found.");
        }
        return inspection;
    }

    private User getAuthenticatedUser(String actorEmail) {
        if (actorEmail == null || actorEmail.isBlank()) {
            throw new UnauthorizedException("Authenticated user not found.");
        }

        User user = userMapper.findByEmail(actorEmail);
        if (user == null) {
            throw new UnauthorizedException("Authenticated user not found.");
        }
        return user;
    }

    private Lot getLotEntity(String lotId) {
        Lot lot = lotMapper.findById(normalizeText(lotId, "lotId"));
        if (lot == null) {
            throw new BadRequestException("lotId does not exist.");
        }
        return lot;
    }

    private WorkOrder getWorkOrderEntity(String workOrderId, String lotId) {
        if (workOrderId == null || workOrderId.isBlank()) {
            return null;
        }

        WorkOrder workOrder = workOrderMapper.findById(workOrderId.trim());
        if (workOrder == null) {
            throw new BadRequestException("workOrderId does not exist.");
        }
        if (!lotId.equals(workOrder.getLotId())) {
            throw new BadRequestException("workOrderId does not belong to the specified lot.");
        }
        return workOrder;
    }

    private InspectionEvaluation evaluateMeasurement(BigDecimal specMin, BigDecimal specMax, BigDecimal measuredValue) {
        validateSpecRange(specMin, specMax);
        if (measuredValue == null) {
            throw new BadRequestException("measuredValue is required.");
        }
        if (measuredValue.compareTo(BigDecimal.ZERO) < 0) {
            throw new BadRequestException("measuredValue must be greater than or equal to 0.");
        }

        boolean meetsMin = specMin == null || measuredValue.compareTo(specMin) >= 0;
        boolean meetsMax = specMax == null || measuredValue.compareTo(specMax) <= 0;
        String result = meetsMin && meetsMax ? "PASS" : "FAIL";
        return new InspectionEvaluation(result, calculateGrade(specMin, specMax, measuredValue, result));
    }

    private void validateSpecRange(BigDecimal specMin, BigDecimal specMax) {
        if (specMin != null && specMax != null && specMin.compareTo(specMax) > 0) {
            throw new BadRequestException("specMin must be less than or equal to specMax.");
        }
    }

    private String calculateGrade(BigDecimal specMin, BigDecimal specMax, BigDecimal measuredValue, String result) {
        if (!"PASS".equals(result)) {
            return "C";
        }
        if (specMin == null || specMax == null) {
            return "A";
        }

        BigDecimal width = specMax.subtract(specMin);
        if (width.compareTo(BigDecimal.ZERO) == 0) {
            return measuredValue.compareTo(specMin) == 0 ? "A" : "C";
        }

        BigDecimal center = specMin.add(specMax).divide(new BigDecimal("2"), 4, RoundingMode.HALF_UP);
        BigDecimal halfWidth = width.divide(new BigDecimal("2"), 4, RoundingMode.HALF_UP);
        BigDecimal deviationRatio = measuredValue.subtract(center).abs().divide(halfWidth, 4, RoundingMode.HALF_UP);

        if (deviationRatio.compareTo(GRADE_A_RATIO) <= 0) {
            return "A";
        }
        if (deviationRatio.compareTo(GRADE_B_RATIO) <= 0) {
            return "B";
        }
        return "C";
    }

    private void validatePage(int page, int limit) {
        if (page < 1 || limit < 1) {
            throw new BadRequestException("page and limit must be greater than 0.");
        }
    }

    private String normalizeProcessType(String value) {
        String normalized = normalizeUpper(value, "processType");
        if (!PROCESS_TYPES.contains(normalized)) {
            throw new BadRequestException("processType must be IQC, IPQC, or OQC.");
        }
        return normalized;
    }

    private String normalizeAgingStatus(String value) {
        if (value == null || value.isBlank()) {
            return "PENDING";
        }
        String normalized = value.trim().toUpperCase();
        if (!AGING_STATUSES.contains(normalized)) {
            throw new BadRequestException("agingStatus must be PASS, FAIL, or PENDING.");
        }
        return normalized;
    }

    private String normalizeUpper(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new BadRequestException(fieldName + " is required.");
        }
        return value.trim().toUpperCase();
    }

    private String normalizeText(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new BadRequestException(fieldName + " is required.");
        }
        return value.trim();
    }

    private String normalizeOptional(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private InspectionDto toDto(Inspection inspection) {
        InspectionDto dto = new InspectionDto();
        dto.setId(inspection.getId());
        dto.setLotId(inspection.getLotId());
        dto.setWorkOrderId(inspection.getWorkOrderId());
        dto.setInspectorId(inspection.getInspectorId());
        dto.setLotNumber(inspection.getLotNumber());
        dto.setWoNumber(inspection.getWoNumber());
        dto.setInspectorName(inspection.getInspectorName());
        dto.setProcessType(inspection.getProcessType());
        dto.setInspectionItem(inspection.getInspectionItem());
        dto.setSpecMin(inspection.getSpecMin());
        dto.setSpecMax(inspection.getSpecMax());
        dto.setMeasuredValue(inspection.getMeasuredValue());
        dto.setResult(inspection.getResult());
        dto.setGrade(inspection.getGrade());
        dto.setAgingStatus(inspection.getAgingStatus());
        dto.setInspectedAt(inspection.getInspectedAt());
        dto.setRemarks(inspection.getRemarks());
        dto.setCreatedAt(inspection.getCreatedAt());
        dto.setUpdatedAt(inspection.getUpdatedAt());
        return dto;
    }

    private record InspectionEvaluation(String result, String grade) {
    }
}
