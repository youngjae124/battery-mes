package com.battery.mes.controller.spc;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import com.battery.mes.common.response.ApiResponse;
import com.battery.mes.common.response.PagedResponse;
import com.battery.mes.dto.spc.SpcChartPointDto;
import com.battery.mes.dto.spc.SpcDataDto;
import com.battery.mes.dto.spc.SpcDataSaveRequestDto;
import com.battery.mes.service.spc.SpcService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/spc-data")
public class SpcController {

    private final SpcService spcService;

    public SpcController(SpcService spcService) {
        this.spcService = spcService;
    }

    @GetMapping
    public ApiResponse<PagedResponse<SpcDataDto>> getSpcData(@RequestParam(defaultValue = "1") int page,
                                                             @RequestParam(defaultValue = "10") int limit,
                                                             @RequestParam(required = false) String lotId,
                                                             @RequestParam(required = false) String workOrderId,
                                                             @RequestParam(required = false) String parameterName) {
        return ApiResponse.ok(
            "SPC data retrieved.",
            spcService.getSpcData(page, limit, lotId, workOrderId, parameterName)
        );
    }

    @GetMapping("/{id}")
    public ApiResponse<SpcDataDto> getSpcData(@PathVariable("id") String spcId) {
        return ApiResponse.ok("SPC data retrieved.", spcService.getSpcData(spcId));
    }

    @PostMapping
    public ApiResponse<SpcDataDto> createSpcData(@Valid @RequestBody SpcDataSaveRequestDto request) {
        return ApiResponse.ok("SPC data created.", spcService.createSpcData(request));
    }

    @GetMapping("/chart")
    public ApiResponse<List<SpcChartPointDto>> getSpcChart(
            @RequestParam(required = false) String parameterName,
            @RequestParam(required = false) String lotId,
            @RequestParam(required = false) String workOrderId) {
        return ApiResponse.ok("SPC chart data retrieved.", spcService.getSpcChart(parameterName, lotId, workOrderId));
    }
}
