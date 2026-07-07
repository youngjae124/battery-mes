package com.battery.mes.controller.report;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.battery.mes.common.response.ApiResponse;
import com.battery.mes.dto.report.DailyQualityReportDto;
import com.battery.mes.dto.report.ProductionReportDto;
import com.battery.mes.service.report.ReportService;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/daily")
    public ApiResponse<DailyQualityReportDto> getDailyQualityReport(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        return ApiResponse.ok("Daily quality report retrieved.", reportService.getDailyQualityReport(startDate, endDate));
    }

    @GetMapping("/production")
    public ApiResponse<ProductionReportDto> getProductionReport(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        return ApiResponse.ok("Production report retrieved.", reportService.getProductionReport(startDate, endDate));
    }
}
