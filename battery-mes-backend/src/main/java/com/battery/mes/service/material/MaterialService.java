package com.battery.mes.service.material;

import com.battery.mes.common.response.PagedResponse;
import com.battery.mes.dto.material.BomDto;
import com.battery.mes.dto.material.BomSaveRequestDto;
import com.battery.mes.dto.material.MaterialDto;
import com.battery.mes.dto.material.MaterialSaveRequestDto;

public interface MaterialService {

    String getNextMatCode(String matType);

    PagedResponse<MaterialDto> getMaterials(int page, int limit);

    MaterialDto getMaterial(String materialId);

    MaterialDto createMaterial(MaterialSaveRequestDto request);

    MaterialDto updateMaterial(String materialId, MaterialSaveRequestDto request);

    PagedResponse<BomDto> getBoms(int page, int limit, String productCode);

    BomDto getBom(String bomId);

    BomDto createBom(BomSaveRequestDto request);

    BomDto updateBom(String bomId, BomSaveRequestDto request);
}
