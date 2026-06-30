package com.battery.mes.controller.defect;

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
import com.battery.mes.dto.defect.DefectTypeDto;
import com.battery.mes.dto.defect.DefectTypeSaveRequestDto;
import com.battery.mes.service.defect.DefectTypeService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/defect-types")
public class DefectTypeController {

    private final DefectTypeService defectTypeService;

    public DefectTypeController(DefectTypeService defectTypeService) {
        this.defectTypeService = defectTypeService;
    }

    @GetMapping
    public ApiResponse<PagedResponse<DefectTypeDto>> getDefectTypes(@RequestParam(defaultValue = "1") int page,
                                                                    @RequestParam(defaultValue = "10") int limit) {
        return ApiResponse.ok("Defect type list retrieved.", defectTypeService.getDefectTypes(page, limit));
    }

    @GetMapping("/{id}")
    public ApiResponse<DefectTypeDto> getDefectType(@PathVariable("id") String defectTypeId) {
        return ApiResponse.ok("Defect type retrieved.", defectTypeService.getDefectType(defectTypeId));
    }

    @PostMapping
    public ApiResponse<DefectTypeDto> createDefectType(@Valid @RequestBody DefectTypeSaveRequestDto request) {
        return ApiResponse.ok("Defect type created.", defectTypeService.createDefectType(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<DefectTypeDto> updateDefectType(@PathVariable("id") String defectTypeId,
                                                       @Valid @RequestBody DefectTypeSaveRequestDto request) {
        return ApiResponse.ok("Defect type updated.", defectTypeService.updateDefectType(defectTypeId, request));
    }
}
