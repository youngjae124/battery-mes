package com.battery.mes.service.report;

import com.battery.mes.dto.report.DailyQualityReportDto;
import com.battery.mes.dto.report.ProductionReportDto;

public interface ReportService {

    DailyQualityReportDto getDailyQualityReport(String startDate, String endDate);

    ProductionReportDto getProductionReport(String startDate, String endDate);
}
