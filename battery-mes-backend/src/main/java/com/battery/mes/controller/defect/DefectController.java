package com.battery.mes.controller.defect;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import com.battery.mes.common.response.ApiResponse;
import com.battery.mes.common.response.PagedResponse;
import com.battery.mes.dto.defect.DefectDto;
import com.battery.mes.dto.defect.DefectSaveRequestDto;
import com.battery.mes.dto.defect.DefectSummaryDto;
import com.battery.mes.dto.defect.DefectTrendDto;
import com.battery.mes.service.defect.DefectService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/defects")
public class DefectController {

    private final DefectService defectService;

    public DefectController(DefectService defectService) {
        this.defectService = defectService;
    }

    @GetMapping
    public ApiResponse<PagedResponse<DefectDto>> getDefects(@RequestParam(defaultValue = "1") int page,
                                                            @RequestParam(defaultValue = "10") int limit) {
        return ApiResponse.ok("Defect list retrieved.", defectService.getDefects(page, limit));
    }

    @GetMapping("/summary")
    public ApiResponse<DefectSummaryDto> getDefectSummary() {
        return ApiResponse.ok("Defect summary retrieved.", defectService.getDefectSummary());
    }

    @GetMapping("/{id}")
    public ApiResponse<DefectDto> getDefect(@PathVariable("id") String defectId) {
        return ApiResponse.ok("Defect retrieved.", defectService.getDefect(defectId));
    }

    @PostMapping
    public ApiResponse<DefectDto> createDefect(@Valid @RequestBody DefectSaveRequestDto request) {
        return ApiResponse.ok("Defect created.", defectService.createDefect(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<DefectDto> updateDefect(@PathVariable("id") String defectId,
                                               @Valid @RequestBody DefectSaveRequestDto request) {
        return ApiResponse.ok("Defect updated.", defectService.updateDefect(defectId, request));
    }

    @GetMapping("/trend")
    public ApiResponse<List<DefectTrendDto>> getDefectTrend(@RequestParam(defaultValue = "7") int days) {
        return ApiResponse.ok("Defect trend retrieved.", defectService.getDefectTrend(days));
    }
}
