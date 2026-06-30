package com.battery.mes.service.defect.impl;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.battery.mes.common.exception.BadRequestException;
import com.battery.mes.common.exception.ConflictException;
import com.battery.mes.common.exception.NotFoundException;
import com.battery.mes.common.response.PagedResponse;
import com.battery.mes.domain.defect.DefectType;
import com.battery.mes.dto.defect.DefectTypeDto;
import com.battery.mes.dto.defect.DefectTypeSaveRequestDto;
import com.battery.mes.mapper.defect.DefectTypeMapper;
import com.battery.mes.service.defect.DefectTypeService;

@Service
public class DefectTypeServiceImpl implements DefectTypeService {

    private static final List<String> DEFECT_CATEGORIES = List.of("ELECTRODE", "ASSEMBLY", "ACTIVATION", "OQC");
    private static final List<String> ACTIVE_FLAGS = List.of("Y", "N");

    private final DefectTypeMapper defectTypeMapper;

    public DefectTypeServiceImpl(DefectTypeMapper defectTypeMapper) {
        this.defectTypeMapper = defectTypeMapper;
    }

    @Override
    public PagedResponse<DefectTypeDto> getDefectTypes(int page, int limit) {
        validatePage(page, limit);
        int offset = (page - 1) * limit;
        List<DefectTypeDto> items = defectTypeMapper.findPaged(offset, limit).stream().map(this::toDto).toList();
        return new PagedResponse<>(items, page, limit, defectTypeMapper.countAll());
    }

    @Override
    public DefectTypeDto getDefectType(String defectTypeId) {
        return toDto(getDefectTypeEntity(defectTypeId));
    }

    @Override
    @Transactional
    public DefectTypeDto createDefectType(DefectTypeSaveRequestDto request) {
        String code = normalizeRequiredUpper(request.getCode(), "code");
        if (defectTypeMapper.existsByCode(code, null) > 0) {
            throw new ConflictException("code already exists.");
        }

        DefectType defectType = new DefectType();
        defectType.setId(UUID.randomUUID().toString());
        defectType.setCode(code);
        defectType.setName(normalizeRequiredText(request.getName(), "name"));
        defectType.setCategory(normalizeCategory(request.getCategory()));
        defectType.setDescription(normalizeOptional(request.getDescription()));
        defectType.setIsActive(normalizeIsActive(request.getIsActive()));
        defectTypeMapper.insert(defectType);
        return toDto(defectTypeMapper.findById(defectType.getId()));
    }

    @Override
    @Transactional
    public DefectTypeDto updateDefectType(String defectTypeId, DefectTypeSaveRequestDto request) {
        DefectType existing = getDefectTypeEntity(defectTypeId);
        String code = normalizeRequiredUpper(request.getCode(), "code");
        if (defectTypeMapper.existsByCode(code, defectTypeId) > 0) {
            throw new ConflictException("code already exists.");
        }

        existing.setCode(code);
        existing.setName(normalizeRequiredText(request.getName(), "name"));
        existing.setCategory(normalizeCategory(request.getCategory()));
        existing.setDescription(normalizeOptional(request.getDescription()));
        existing.setIsActive(normalizeIsActive(request.getIsActive()));
        defectTypeMapper.update(existing);
        return toDto(defectTypeMapper.findById(defectTypeId));
    }

    private DefectType getDefectTypeEntity(String defectTypeId) {
        DefectType defectType = defectTypeMapper.findById(normalizeRequiredText(defectTypeId, "defectTypeId"));
        if (defectType == null) {
            throw new NotFoundException("Defect type not found.");
        }
        return defectType;
    }

    private void validatePage(int page, int limit) {
        if (page < 1 || limit < 1) {
            throw new BadRequestException("page and limit must be greater than 0.");
        }
    }

    private String normalizeCategory(String value) {
        String normalized = normalizeRequiredUpper(value, "category");
        if (!DEFECT_CATEGORIES.contains(normalized)) {
            throw new BadRequestException("category must be ELECTRODE, ASSEMBLY, ACTIVATION, or OQC.");
        }
        return normalized;
    }

    private String normalizeIsActive(String value) {
        if (value == null || value.isBlank()) {
            return "Y";
        }
        String normalized = value.trim().toUpperCase();
        if (!ACTIVE_FLAGS.contains(normalized)) {
            throw new BadRequestException("isActive must be Y or N.");
        }
        return normalized;
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

    private DefectTypeDto toDto(DefectType defectType) {
        DefectTypeDto dto = new DefectTypeDto();
        dto.setId(defectType.getId());
        dto.setCode(defectType.getCode());
        dto.setName(defectType.getName());
        dto.setCategory(defectType.getCategory());
        dto.setDescription(defectType.getDescription());
        dto.setIsActive(defectType.getIsActive());
        return dto;
    }
}
