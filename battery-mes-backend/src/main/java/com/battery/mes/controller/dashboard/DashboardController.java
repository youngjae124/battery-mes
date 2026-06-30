package com.battery.mes.controller.dashboard;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.battery.mes.common.response.ApiResponse;
import com.battery.mes.dto.dashboard.DashboardDefectCategoryDto;
import com.battery.mes.dto.dashboard.DashboardEquipmentStatusDto;
import com.battery.mes.dto.dashboard.DashboardKpiDto;
import com.battery.mes.dto.dashboard.DashboardProcessStatusDto;
import com.battery.mes.dto.dashboard.DashboardQualityTrendDto;
import com.battery.mes.service.dashboard.DashboardService;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/kpis")
    public ApiResponse<DashboardKpiDto> getKpis() {
        return ApiResponse.ok("Dashboard KPIs retrieved.", dashboardService.getKpis());
    }

    @GetMapping("/equipment-status")
    public ApiResponse<List<DashboardEquipmentStatusDto>> getEquipmentStatus() {
        return ApiResponse.ok("Dashboard equipment status retrieved.", dashboardService.getEquipmentStatus());
    }

    @GetMapping("/process-status")
    public ApiResponse<List<DashboardProcessStatusDto>> getProcessStatus() {
        return ApiResponse.ok("Dashboard process status retrieved.", dashboardService.getProcessStatus());
    }

    @GetMapping("/quality-trend")
    public ApiResponse<List<DashboardQualityTrendDto>> getQualityTrend(@RequestParam(defaultValue = "7") int days) {
        return ApiResponse.ok("Dashboard quality trend retrieved.", dashboardService.getQualityTrend(days));
    }

    @GetMapping("/defect-categories")
    public ApiResponse<List<DashboardDefectCategoryDto>> getDefectCategories() {
        return ApiResponse.ok("Dashboard defect categories retrieved.", dashboardService.getDefectCategories());
    }
}
