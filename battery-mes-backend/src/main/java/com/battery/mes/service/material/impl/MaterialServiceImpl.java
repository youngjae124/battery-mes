package com.battery.mes.service.material.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.battery.mes.common.exception.BadRequestException;
import com.battery.mes.common.exception.ConflictException;
import com.battery.mes.common.exception.NotFoundException;
import com.battery.mes.common.response.PagedResponse;
import com.battery.mes.domain.material.Bom;
import com.battery.mes.domain.material.Material;
import com.battery.mes.dto.material.BomDto;
import com.battery.mes.dto.material.BomSaveRequestDto;
import com.battery.mes.dto.material.MaterialDto;
import com.battery.mes.dto.material.MaterialSaveRequestDto;
import com.battery.mes.mapper.material.MaterialMapper;
import com.battery.mes.service.material.MaterialService;

@Service
public class MaterialServiceImpl implements MaterialService {

    private static final List<String> MATERIAL_TYPES = List.of("RAW", "SEMI", "CONSUMABLE");

    private static final java.util.Map<String, String> TYPE_PREFIX = java.util.Map.of(
        "RAW",        "MAT-RAW-",
        "SEMI",       "MAT-SEMI-",
        "CONSUMABLE", "MAT-CON-"
    );

    private final MaterialMapper materialMapper;

    public MaterialServiceImpl(MaterialMapper materialMapper) {
        this.materialMapper = materialMapper;
    }

    @Override
    public String getNextMatCode(String matType) {
        String prefix = TYPE_PREFIX.get(normalizeMaterialType(matType));
        int nextSeq = materialMapper.findMaxSeqByPrefix(prefix) + 1;
        return String.format("%s%03d", prefix, nextSeq);
    }

    @Override
    public PagedResponse<MaterialDto> getMaterials(int page, int limit) {
        validatePage(page, limit);
        int offset = (page - 1) * limit;
        List<MaterialDto> items = materialMapper.findMaterialsPaged(offset, limit).stream().map(this::toMaterialDto).toList();
        return new PagedResponse<>(items, page, limit, materialMapper.countMaterials());
    }

    @Override
    public MaterialDto getMaterial(String materialId) {
        return toMaterialDto(getMaterialEntity(materialId));
    }

    @Override
    @Transactional
    public MaterialDto createMaterial(MaterialSaveRequestDto request) {
        String matCode = normalizeRequiredUpper(request.getMatCode(), "matCode");
        if (materialMapper.existsMaterialByCode(matCode, null) > 0) {
            throw new ConflictException("matCode already exists.");
        }

        Material material = new Material();
        material.setId(UUID.randomUUID().toString());
        material.setMatCode(matCode);
        material.setMatName(normalizeRequiredText(request.getMatName(), "matName"));
        material.setMatType(normalizeMaterialType(request.getMatType()));
        material.setStockQty(request.getStockQty());
        material.setUnit(normalizeRequiredText(request.getUnit(), "unit"));
        material.setCreatedAt(LocalDateTime.now());
        materialMapper.insertMaterial(material);
        return toMaterialDto(materialMapper.findMaterialById(material.getId()));
    }

    @Override
    @Transactional
    public MaterialDto updateMaterial(String materialId, MaterialSaveRequestDto request) {
        Material existing = getMaterialEntity(materialId);
        String matCode = normalizeRequiredUpper(request.getMatCode(), "matCode");
        if (materialMapper.existsMaterialByCode(matCode, materialId) > 0) {
            throw new ConflictException("matCode already exists.");
        }

        existing.setMatCode(matCode);
        existing.setMatName(normalizeRequiredText(request.getMatName(), "matName"));
        existing.setMatType(normalizeMaterialType(request.getMatType()));
        existing.setStockQty(request.getStockQty());
        existing.setUnit(normalizeRequiredText(request.getUnit(), "unit"));
        materialMapper.updateMaterial(existing);
        return toMaterialDto(materialMapper.findMaterialById(materialId));
    }

    @Override
    public PagedResponse<BomDto> getBoms(int page, int limit, String productCode) {
        validatePage(page, limit);
        int offset = (page - 1) * limit;
        String normalizedProductCode = normalizeOptionalUpper(productCode);
        List<BomDto> items = materialMapper.findBomsPaged(offset, limit, normalizedProductCode).stream().map(this::toBomDto).toList();
        return new PagedResponse<>(items, page, limit, materialMapper.countBoms(normalizedProductCode));
    }

    @Override
    public BomDto getBom(String bomId) {
        return toBomDto(getBomEntity(bomId));
    }

    @Override
    @Transactional
    public BomDto createBom(BomSaveRequestDto request) {
        String productCode = normalizeRequiredUpper(request.getProductCode(), "productCode");
        String materialId = normalizeRequiredText(request.getMaterialId(), "materialId");
        validateBomRequest(productCode, materialId, null);

        Bom bom = new Bom();
        bom.setId(UUID.randomUUID().toString());
        bom.setProductCode(productCode);
        bom.setMaterialId(materialId);
        bom.setQtyPerUnit(request.getQtyPerUnit());
        bom.setUnit(normalizeRequiredText(request.getUnit(), "unit"));
        materialMapper.insertBom(bom);
        return toBomDto(materialMapper.findBomById(bom.getId()));
    }

    @Override
    @Transactional
    public BomDto updateBom(String bomId, BomSaveRequestDto request) {
        Bom existing = getBomEntity(bomId);
        String productCode = normalizeRequiredUpper(request.getProductCode(), "productCode");
        String materialId = normalizeRequiredText(request.getMaterialId(), "materialId");
        validateBomRequest(productCode, materialId, bomId);

        existing.setProductCode(productCode);
        existing.setMaterialId(materialId);
        existing.setQtyPerUnit(request.getQtyPerUnit());
        existing.setUnit(normalizeRequiredText(request.getUnit(), "unit"));
        materialMapper.updateBom(existing);
        return toBomDto(materialMapper.findBomById(bomId));
    }

    private Material getMaterialEntity(String materialId) {
        Material material = materialMapper.findMaterialById(normalizeRequiredText(materialId, "materialId"));
        if (material == null) {
            throw new NotFoundException("Material not found.");
        }
        return material;
    }

    private Bom getBomEntity(String bomId) {
        Bom bom = materialMapper.findBomById(normalizeRequiredText(bomId, "bomId"));
        if (bom == null) {
            throw new NotFoundException("BOM not found.");
        }
        return bom;
    }

    private void validateBomRequest(String productCode, String materialId, String excludeId) {
        if (materialMapper.existsMaterialById(materialId) == 0) {
            throw new BadRequestException("materialId does not exist.");
        }
        if (materialMapper.existsBom(productCode, materialId, excludeId) > 0) {
            throw new ConflictException("The material is already registered in the BOM for this product.");
        }
    }

    private void validatePage(int page, int limit) {
        if (page < 1 || limit < 1) {
            throw new BadRequestException("page and limit must be greater than 0.");
        }
    }

    private String normalizeMaterialType(String value) {
        String normalized = normalizeRequiredUpper(value, "matType");
        if (!MATERIAL_TYPES.contains(normalized)) {
            throw new BadRequestException("matType must be RAW, SEMI, or CONSUMABLE.");
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

    private String normalizeOptionalUpper(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim().toUpperCase();
    }

    private MaterialDto toMaterialDto(Material material) {
        MaterialDto dto = new MaterialDto();
        dto.setId(material.getId());
        dto.setMatCode(material.getMatCode());
        dto.setMatName(material.getMatName());
        dto.setMatType(material.getMatType());
        dto.setStockQty(material.getStockQty());
        dto.setUnit(material.getUnit());
        return dto;
    }

    private BomDto toBomDto(Bom bom) {
        BomDto dto = new BomDto();
        dto.setId(bom.getId());
        dto.setProductCode(bom.getProductCode());
        dto.setMaterialId(bom.getMaterialId());
        dto.setMatCode(bom.getMatCode());
        dto.setMatName(bom.getMatName());
        dto.setMatType(bom.getMatType());
        dto.setQtyPerUnit(bom.getQtyPerUnit());
        dto.setUnit(bom.getUnit());
        return dto;
    }
}
