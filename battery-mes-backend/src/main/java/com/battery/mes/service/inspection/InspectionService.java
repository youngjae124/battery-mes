package com.battery.mes.service.inspection;

import com.battery.mes.common.response.PagedResponse;
import com.battery.mes.dto.inspection.InspectionDto;
import com.battery.mes.dto.inspection.InspectionSaveRequestDto;
import com.battery.mes.dto.inspection.InspectionSummaryDto;

public interface InspectionService {

    PagedResponse<InspectionDto> getInspections(int page, int limit);

    InspectionDto getInspection(String inspectionId);

    InspectionSummaryDto getInspectionSummary();

    InspectionDto createInspection(InspectionSaveRequestDto request, String actorEmail);

    InspectionDto updateInspection(String inspectionId, InspectionSaveRequestDto request, String actorEmail);

    InspectionDto deleteInspection(String inspectionId);
}
