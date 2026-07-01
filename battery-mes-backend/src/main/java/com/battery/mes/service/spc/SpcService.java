package com.battery.mes.service.spc;

import java.util.List;

import com.battery.mes.common.response.PagedResponse;
import com.battery.mes.dto.spc.SpcChartPointDto;
import com.battery.mes.dto.spc.SpcDataDto;
import com.battery.mes.dto.spc.SpcDataSaveRequestDto;

public interface SpcService {

    PagedResponse<SpcDataDto> getSpcData(int page, int limit, String lotId, String workOrderId, String parameterName);

    SpcDataDto getSpcData(String spcId);

    SpcDataDto createSpcData(SpcDataSaveRequestDto request);

    List<SpcChartPointDto> getSpcChart(String parameterName, String lotId, String workOrderId);
}
