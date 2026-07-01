package com.battery.mes.controller.lot;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.battery.mes.common.response.ApiResponse;
import com.battery.mes.common.response.PagedResponse;
import com.battery.mes.dto.lot.LotDto;
import com.battery.mes.dto.lot.LotSaveRequestDto;
import com.battery.mes.service.lot.LotService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/lots")
public class LotController {

    private final LotService lotService;

    public LotController(LotService lotService) {
        this.lotService = lotService;
    }

    @GetMapping
    public ApiResponse<PagedResponse<LotDto>> getLots(@RequestParam(defaultValue = "1") int page,
                                                      @RequestParam(defaultValue = "10") int limit) {
        return ApiResponse.ok("LOT list retrieved.", lotService.getLots(page, limit));
    }

    @GetMapping("/{id}")
    public ApiResponse<LotDto> getLot(@PathVariable("id") String lotId) {
        return ApiResponse.ok("LOT retrieved.", lotService.getLot(lotId));
    }

    @PostMapping
    public ApiResponse<LotDto> createLot(@Valid @RequestBody LotSaveRequestDto request) {
        return ApiResponse.ok("LOT created.", lotService.createLot(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<LotDto> updateLot(@PathVariable("id") String lotId,
                                         @Valid @RequestBody LotSaveRequestDto request) {
        return ApiResponse.ok("LOT updated.", lotService.updateLot(lotId, request));
    }
}
