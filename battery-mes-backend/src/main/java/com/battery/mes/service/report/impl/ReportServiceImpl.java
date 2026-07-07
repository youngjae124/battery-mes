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
    public DailyQualityReportDto getDailyQualityReport(String startDate, String endDate) {
        String[] range = normalizeDateRange(startDate, endDate);
        DailyQualityReportDto report = reportMapper.selectDailyQualityReport(range[0], range[1]);
        report.setStartDate(range[0]);
        report.setEndDate(range[1]);
        return report;
    }

    @Override
    public ProductionReportDto getProductionReport(String startDate, String endDate) {
        String[] range = normalizeDateRange(startDate, endDate);
        ProductionReportSummaryDto summary = reportMapper.selectProductionReportSummary(range[0], range[1]);

        ProductionReportDto report = new ProductionReportDto();
        report.setStartDate(range[0]);
        report.setEndDate(range[1]);
        report.setTotalWorkOrders(summary.getTotalWorkOrders());
        report.setPlannedCount(summary.getPlannedCount());
        report.setRunningCount(summary.getRunningCount());
        report.setDoneCount(summary.getDoneCount());
        report.setHoldCount(summary.getHoldCount());
        report.setTotalTargetQty(summary.getTotalTargetQty());
        report.setTotalActualQty(summary.getTotalActualQty());
        report.setAchievementRate(summary.getAchievementRate());
        report.setProcessBreakdown(reportMapper.selectProductionReportProcessBreakdown(range[0], range[1]));

        return report;
    }

    private String[] normalizeDateRange(String startDate, String endDate) {
        LocalDate today = LocalDate.now();
        String start = (startDate == null || startDate.isBlank())
                ? today.minusDays(6).format(DATE_FORMAT)
                : parseDate(startDate);
        String end = (endDate == null || endDate.isBlank())
                ? today.format(DATE_FORMAT)
                : parseDate(endDate);
        if (start.compareTo(end) > 0) {
            throw new BadRequestException("startDate must not be after endDate.");
        }
        return new String[]{start, end};
    }

    private String parseDate(String date) {
        try {
            return LocalDate.parse(date.trim(), DATE_FORMAT).format(DATE_FORMAT);
        } catch (DateTimeParseException e) {
            throw new BadRequestException("date must be in YYYY-MM-DD format.");
        }
    }
}
