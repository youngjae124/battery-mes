package com.battery.mes.service.lot;

import com.battery.mes.common.response.PagedResponse;
import com.battery.mes.dto.lot.LotDto;
import com.battery.mes.dto.lot.LotSaveRequestDto;

public interface LotService {

    PagedResponse<LotDto> getLots(int page, int limit);

    LotDto getLot(String lotId);

    LotDto createLot(LotSaveRequestDto request);

    LotDto updateLot(String lotId, LotSaveRequestDto request);
}
