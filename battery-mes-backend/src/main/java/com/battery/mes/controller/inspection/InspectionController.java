package com.battery.mes.controller.inspection;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
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
import com.battery.mes.dto.inspection.InspectionDto;
import com.battery.mes.dto.inspection.InspectionSaveRequestDto;
import com.battery.mes.dto.inspection.InspectionSummaryDto;
import com.battery.mes.service.inspection.InspectionService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/inspections")
public class InspectionController {

    private final InspectionService inspectionService;

    public InspectionController(InspectionService inspectionService) {
        this.inspectionService = inspectionService;
    }

    @GetMapping
    public ApiResponse<PagedResponse<InspectionDto>> getInspections(@RequestParam(defaultValue = "1") int page,
                                                                    @RequestParam(defaultValue = "10") int limit) {
        return ApiResponse.ok("Inspection list retrieved.", inspectionService.getInspections(page, limit));
    }

    @GetMapping("/summary")
    public ApiResponse<InspectionSummaryDto> getInspectionSummary() {
        return ApiResponse.ok("Inspection summary retrieved.", inspectionService.getInspectionSummary());
    }

    @GetMapping("/{id}")
    public ApiResponse<InspectionDto> getInspection(@PathVariable("id") String inspectionId) {
        return ApiResponse.ok("Inspection retrieved.", inspectionService.getInspection(inspectionId));
    }

    @PostMapping
    public ApiResponse<InspectionDto> createInspection(@Valid @RequestBody InspectionSaveRequestDto request,
                                                       Authentication authentication) {
        String actorEmail = authentication == null ? null : authentication.getName();
        return ApiResponse.ok("Inspection created.", inspectionService.createInspection(request, actorEmail));
    }

    @PutMapping("/{id}")
    public ApiResponse<InspectionDto> updateInspection(@PathVariable("id") String inspectionId,
                                                       @Valid @RequestBody InspectionSaveRequestDto request,
                                                       Authentication authentication) {
        String actorEmail = authentication == null ? null : authentication.getName();
        return ApiResponse.ok("Inspection updated.", inspectionService.updateInspection(inspectionId, request, actorEmail));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<InspectionDto> deleteInspection(@PathVariable("id") String inspectionId) {
        return ApiResponse.ok("Inspection deleted.", inspectionService.deleteInspection(inspectionId));
    }
}
