package com.battery.mes.service.report.impl;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

import org.springframework.stereotype.Service;

import com.battery.mes.common.exception.BadRequestException;
import com.battery.mes.dto.report.DailyQualityReportDto;
import com.battery.mes.dto.report.ProductionReportDto;
import com.battery.mes.dto.report.ProductionReportSummaryDto;
import com.battery.mes.mapper.report.ReportMapper;
import com.battery.mes.service.report.ReportService;

@Service
public class ReportServiceImpl implements ReportService {

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ISO_LOCAL_DATE;

    private final ReportMapper reportMapper;

    public ReportServiceImpl(ReportMapper reportMapper) {
        this.reportMapper = reportMapper;
    }

    @Override
    public DailyQualityReportDto getDailyQualityReport(String date) {
        String normalizedDate = normalizeDate(date);
        DailyQualityReportDto report = reportMapper.selectDailyQualityReport(normalizedDate);
        report.setReportDate(normalizedDate);
        return report;
    }

    @Override
    public ProductionReportDto getProductionReport(String date) {
        String normalizedDate = normalizeDate(date);
        ProductionReportSummaryDto summary = reportMapper.selectProductionReportSummary(normalizedDate);

        ProductionReportDto report = new ProductionReportDto();
        report.setReportDate(normalizedDate);
        report.setTotalWorkOrders(summary.getTotalWorkOrders());
        report.setPlannedCount(summary.getPlannedCount());
        report.setRunningCount(summary.getRunningCount());
        report.setDoneCount(summary.getDoneCount());
        report.setHoldCount(summary.getHoldCount());
        report.setTotalTargetQty(summary.getTotalTargetQty());
        report.setTotalActualQty(summary.getTotalActualQty());
        report.setAchievementRate(summary.getAchievementRate());
        report.setProcessBreakdown(reportMapper.selectProductionReportProcessBreakdown(normalizedDate));

        return report;
    }

    private String normalizeDate(String date) {
        if (date == null || date.isBlank()) {
            return LocalDate.now().format(DATE_FORMAT);
        }

        try {
            return LocalDate.parse(date.trim(), DATE_FORMAT).format(DATE_FORMAT);
        } catch (DateTimeParseException error) {
            throw new BadRequestException("date must be in YYYY-MM-DD format.");
        }
    }
}
