package com.battery.mes.service.defect;

import com.battery.mes.common.response.PagedResponse;
import com.battery.mes.dto.defect.DefectTypeDto;
import com.battery.mes.dto.defect.DefectTypeSaveRequestDto;

public interface DefectTypeService {

    PagedResponse<DefectTypeDto> getDefectTypes(int page, int limit);

    DefectTypeDto getDefectType(String defectTypeId);

    DefectTypeDto createDefectType(DefectTypeSaveRequestDto request);

    DefectTypeDto updateDefectType(String defectTypeId, DefectTypeSaveRequestDto request);
}
