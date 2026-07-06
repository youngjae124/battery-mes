package com.battery.mes.service.spc.impl;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.battery.mes.common.exception.BadRequestException;
import com.battery.mes.common.exception.NotFoundException;
import com.battery.mes.common.response.PagedResponse;
import com.battery.mes.domain.lot.Lot;
import com.battery.mes.domain.spc.SpcData;
import com.battery.mes.domain.workorder.WorkOrder;
import com.battery.mes.dto.spc.SpcChartPointDto;
import com.battery.mes.dto.spc.SpcDataDto;
import com.battery.mes.dto.spc.SpcDataSaveRequestDto;
import com.battery.mes.mapper.lot.LotMapper;
import com.battery.mes.mapper.spc.SpcMapper;
import com.battery.mes.mapper.workorder.WorkOrderMapper;
import com.battery.mes.service.spc.SpcService;

@Service
public class SpcServiceImpl implements SpcService {

    private final SpcMapper spcMapper;
    private final LotMapper lotMapper;
    private final WorkOrderMapper workOrderMapper;

    public SpcServiceImpl(SpcMapper spcMapper, LotMapper lotMapper, WorkOrderMapper workOrderMapper) {
        this.spcMapper = spcMapper;
        this.lotMapper = lotMapper;
        this.workOrderMapper = workOrderMapper;
    }

    @Override
    public PagedResponse<SpcDataDto> getSpcData(int page,
                                                int limit,
                                                String lotId,
                                                String workOrderId,
                                                String parameterName) {
        validatePage(page, limit);
        String normalizedLotId = normalizeOptionalTrim(lotId);
        String normalizedWorkOrderId = normalizeOptionalTrim(workOrderId);
        String normalizedParameterName = normalizeOptionalUpper(parameterName);

        if (normalizedLotId != null && lotMapper.findById(normalizedLotId) == null) {
            throw new BadRequestException("lotId does not exist.");
        }
        if (normalizedWorkOrderId != null && workOrderMapper.findById(normalizedWorkOrderId) == null) {
            throw new BadRequestException("workOrderId does not exist.");
        }

        int offset = (page - 1) * limit;
        List<SpcDataDto> items = spcMapper.findPaged(
            offset,
            limit,
            normalizedLotId,
            normalizedWorkOrderId,
            normalizedParameterName
        ).stream().map(this::toDto).toList();
        long totalCount = spcMapper.countAll(normalizedLotId, normalizedWorkOrderId, normalizedParameterName);
        return new PagedResponse<>(items, page, limit, totalCount);
    }

    @Override
    public SpcDataDto getSpcData(String spcId) {
        return toDto(getSpcEntity(spcId));
    }

    @Override
    @Transactional
    public SpcDataDto createSpcData(SpcDataSaveRequestDto request) {
        Lot lot = getLotEntity(request.getLotId());
        WorkOrder workOrder = getWorkOrderEntity(request.getWorkOrderId(), lot.getId());

        SpcData spcData = new SpcData();
        spcData.setId(UUID.randomUUID().toString());
        spcData.setLotId(lot.getId());
        spcData.setWorkOrderId(workOrder == null ? null : workOrder.getId());
        spcData.setParameterName(normalizeRequiredText(request.getParameterName(), "parameterName"));
        spcData.setSubgroupNo(request.getSubgroupNo());
        spcData.setSampleValues(normalizeRequiredText(request.getSampleValues(), "sampleValues"));
        List<BigDecimal> parsedSamples = parseSampleValues(normalizeRequiredText(request.getSampleValues(), "sampleValues"));
        if (!parsedSamples.isEmpty()) {
            BigDecimal sum = parsedSamples.stream().reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal xBar = sum.divide(BigDecimal.valueOf(parsedSamples.size()), 4, RoundingMode.HALF_UP);
            BigDecimal max = parsedSamples.stream().max(Comparator.naturalOrder()).orElse(BigDecimal.ZERO);
            BigDecimal min = parsedSamples.stream().min(Comparator.naturalOrder()).orElse(BigDecimal.ZERO);
            spcData.setXBar(xBar);
            spcData.setRangeValue(max.subtract(min).setScale(4, RoundingMode.HALF_UP));
        } else {
            spcData.setXBar(request.getXBar());
            spcData.setRangeValue(request.getRangeValue());
        }
        spcData.setUcl(request.getUcl());
        spcData.setCl(request.getCl());
        spcData.setLcl(request.getLcl());
        spcData.setUsl(request.getUsl());
        spcData.setLsl(request.getLsl());
        spcData.setCp(request.getCp());
        spcData.setCpk(request.getCpk());
        spcData.setMeasuredAt(LocalDateTime.now());

        spcMapper.insert(spcData);
        return toDto(spcMapper.findById(spcData.getId()));
    }

    @Override
    public List<SpcChartPointDto> getSpcChart(String parameterName, String lotId, String workOrderId) {
        return spcMapper.findChart(
            normalizeOptionalUpper(parameterName),
            normalizeOptionalTrim(lotId),
            normalizeOptionalTrim(workOrderId)
        );
    }

    private SpcData getSpcEntity(String spcId) {
        SpcData spcData = spcMapper.findById(normalizeRequiredText(spcId, "spcId"));
        if (spcData == null) {
            throw new NotFoundException("SPC data not found.");
        }
        return spcData;
    }

    private Lot getLotEntity(String lotId) {
        Lot lot = lotMapper.findById(normalizeRequiredText(lotId, "lotId"));
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

    private List<BigDecimal> parseSampleValues(String raw) {
        String cleaned = raw.trim().replaceAll("^\\[|\\]$", "");
        List<BigDecimal> result = new ArrayList<>();
        for (String part : cleaned.split("[,\\n]")) {
            String trimmed = part.trim();
            if (trimmed.isEmpty()) continue;
            try { result.add(new BigDecimal(trimmed)); } catch (NumberFormatException ignored) {}
        }
        return result;
    }

    private String normalizeOptionalTrim(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private String normalizeOptionalUpper(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim().toUpperCase();
    }

    private SpcDataDto toDto(SpcData spcData) {
        SpcDataDto dto = new SpcDataDto();
        dto.setId(spcData.getId());
        dto.setLotId(spcData.getLotId());
        dto.setWorkOrderId(spcData.getWorkOrderId());
        dto.setLotNumber(spcData.getLotNumber());
        dto.setWoNumber(spcData.getWoNumber());
        dto.setParameterName(spcData.getParameterName());
        dto.setSubgroupNo(spcData.getSubgroupNo());
        dto.setSampleValues(spcData.getSampleValues());
        dto.setXBar(spcData.getXBar());
        dto.setRangeValue(spcData.getRangeValue());
        dto.setUcl(spcData.getUcl());
        dto.setCl(spcData.getCl());
        dto.setLcl(spcData.getLcl());
        dto.setUsl(spcData.getUsl());
        dto.setLsl(spcData.getLsl());
        dto.setCp(spcData.getCp());
        dto.setCpk(spcData.getCpk());
        dto.setMeasuredAt(spcData.getMeasuredAt());
        return dto;
    }
}
