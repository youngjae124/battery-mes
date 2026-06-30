package com.battery.mes.service.defect;

import com.battery.mes.common.response.PagedResponse;
import com.battery.mes.dto.defect.DefectDto;
import com.battery.mes.dto.defect.DefectSaveRequestDto;
import com.battery.mes.dto.defect.DefectSummaryDto;

public interface DefectService {

    PagedResponse<DefectDto> getDefects(int page, int limit);

    DefectDto getDefect(String defectId);

    DefectSummaryDto getDefectSummary();

    DefectDto createDefect(DefectSaveRequestDto request);

    DefectDto updateDefect(String defectId, DefectSaveRequestDto request);
}
