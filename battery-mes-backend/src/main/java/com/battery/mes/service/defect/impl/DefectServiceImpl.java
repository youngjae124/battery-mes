package com.battery.mes.service.defect.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.battery.mes.common.exception.BadRequestException;
import com.battery.mes.common.exception.NotFoundException;
import com.battery.mes.common.response.PagedResponse;
import com.battery.mes.domain.defect.Defect;
import com.battery.mes.domain.inspection.Inspection;
import com.battery.mes.domain.lot.Lot;
import com.battery.mes.dto.defect.DefectDto;
import com.battery.mes.dto.defect.DefectSaveRequestDto;
import com.battery.mes.dto.defect.DefectSummaryDto;
import com.battery.mes.dto.defect.DefectTrendDto;
import com.battery.mes.mapper.defect.DefectMapper;
import com.battery.mes.mapper.inspection.InspectionMapper;
import com.battery.mes.mapper.lot.LotMapper;
import com.battery.mes.service.defect.DefectService;

@Service
public class DefectServiceImpl implements DefectService {

    private static final List<String> SEVERITY_FLOW = List.of("MINOR", "MAJOR", "CRITICAL");

    private final DefectMapper defectMapper;
    private final InspectionMapper inspectionMapper;
    private final LotMapper lotMapper;

    public DefectServiceImpl(DefectMapper defectMapper,
                             InspectionMapper inspectionMapper,
                             LotMapper lotMapper) {
        this.defectMapper = defectMapper;
        this.inspectionMapper = inspectionMapper;
        this.lotMapper = lotMapper;
    }

    @Override
    public PagedResponse<DefectDto> getDefects(int page, int limit) {
        validatePage(page, limit);
        int offset = (page - 1) * limit;
        List<DefectDto> items = defectMapper.findPaged(offset, limit).stream().map(this::toDto).toList();
        return new PagedResponse<>(items, page, limit, defectMapper.countAll());
    }

    @Override
    public DefectDto getDefect(String defectId) {
        return toDto(getDefectEntity(defectId));
    }

    @Override
    public DefectSummaryDto getDefectSummary() {
        DefectSummaryDto summary = defectMapper.selectSummary();
        return summary == null ? new DefectSummaryDto() : summary;
    }

    @Override
    @Transactional
    public DefectDto createDefect(DefectSaveRequestDto request) {
        Inspection inspection = getInspectionEntity(request.getInspectionId());
        String defectCode = normalizeRequiredUpper(request.getDefectCode(), "defectCode");
        String defectTypeId = defectMapper.findActiveDefectTypeIdByCode(defectCode);
        if (defectTypeId == null) {
            throw new BadRequestException("defectCode does not exist in active defect types.");
        }

        LocalDateTime now = LocalDateTime.now();
        Defect defect = new Defect();
        defect.setId(UUID.randomUUID().toString());
        defect.setInspectionId(inspection.getId());
        defect.setDefectTypeId(defectTypeId);
        defect.setDefectCode(defectCode);
        defect.setSeverity(normalizeSeverity(request.getSeverity()));
        defect.setDescription(normalizeOptional(request.getDescription()));
        defect.setCreatedAt(now);
        defect.setUpdatedAt(now);

        defectMapper.insert(defect);
        syncLotHold(inspection.getLotId());
        return toDto(defectMapper.findById(defect.getId()));
    }

    @Override
    public List<DefectTrendDto> getDefectTrend(int days) {
        if (days < 1 || days > 30) {
            throw new BadRequestException("days must be between 1 and 30.");
        }
        return defectMapper.selectTrend(days);
    }

    @Override
    @Transactional
    public DefectDto updateDefect(String defectId, DefectSaveRequestDto request) {
        Defect existing = getDefectEntity(defectId);
        Inspection inspection = getInspectionEntity(request.getInspectionId());
        String defectCode = normalizeRequiredUpper(request.getDefectCode(), "defectCode");
        String defectTypeId = defectMapper.findActiveDefectTypeIdByCode(defectCode);
        if (defectTypeId == null) {
            throw new BadRequestException("defectCode does not exist in active defect types.");
        }

        existing.setInspectionId(inspection.getId());
        existing.setDefectTypeId(defectTypeId);
        existing.setDefectCode(defectCode);
        existing.setSeverity(normalizeSeverity(request.getSeverity()));
        existing.setDescription(normalizeOptional(request.getDescription()));
        existing.setUpdatedAt(LocalDateTime.now());

        defectMapper.update(existing);
        syncLotHold(inspection.getLotId());
        return toDto(defectMapper.findById(defectId));
    }

    private Defect getDefectEntity(String defectId) {
        String normalizedId = normalizeRequiredText(defectId, "defectId");
        Defect defect = defectMapper.findById(normalizedId);
        if (defect == null) {
            throw new NotFoundException("Defect not found.");
        }
        return defect;
    }

    private Inspection getInspectionEntity(String inspectionId) {
        Inspection inspection = inspectionMapper.findById(normalizeRequiredText(inspectionId, "inspectionId"));
        if (inspection == null) {
            throw new BadRequestException("inspectionId does not exist.");
        }
        if (!"FAIL".equalsIgnoreCase(inspection.getResult())) {
            throw new BadRequestException("Defects can only be registered for FAIL inspections.");
        }
        return inspection;
    }

    private void syncLotHold(String lotId) {
        Lot lot = lotMapper.findById(lotId);
        if (lot == null) {
            throw new BadRequestException("Inspection lot does not exist.");
        }
        lot.setStatus("HOLD");
        lot.setUpdatedAt(LocalDateTime.now());
        lotMapper.update(lot);
    }

    private void validatePage(int page, int limit) {
        if (page < 1 || limit < 1) {
            throw new BadRequestException("page and limit must be greater than 0.");
        }
    }

    private String normalizeRequiredText(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new BadRequestException(fieldName + " is required.");
        }
        return value.trim();
    }

    private String normalizeRequiredUpper(String value, String fieldName) {
        return normalizeRequiredText(value, fieldName).toUpperCase();
    }

    private String normalizeOptional(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private String normalizeSeverity(String value) {
        String normalized = normalizeRequiredUpper(value, "severity");
        if (!SEVERITY_FLOW.contains(normalized)) {
            throw new BadRequestException("severity must be MINOR, MAJOR, or CRITICAL.");
        }
        return normalized;
    }

    private DefectDto toDto(Defect defect) {
        DefectDto dto = new DefectDto();
        dto.setId(defect.getId());
        dto.setInspectionId(defect.getInspectionId());
        dto.setDefectTypeId(defect.getDefectTypeId());
        dto.setDefectCode(defect.getDefectCode());
        dto.setDefectTypeName(defect.getDefectTypeName());
        dto.setDefectCategory(defect.getDefectCategory());
        dto.setSeverity(defect.getSeverity());
        dto.setDescription(defect.getDescription());
        dto.setInspectionItem(defect.getInspectionItem());
        dto.setLotId(defect.getLotId());
        dto.setLotNumber(defect.getLotNumber());
        dto.setCreatedAt(defect.getCreatedAt());
        dto.setUpdatedAt(defect.getUpdatedAt());
        return dto;
    }
}
