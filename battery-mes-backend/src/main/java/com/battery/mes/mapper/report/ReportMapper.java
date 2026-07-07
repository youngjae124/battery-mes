package com.battery.mes.mapper.report;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.battery.mes.dto.report.DailyQualityReportDto;
import com.battery.mes.dto.report.ProductionReportProcessDto;
import com.battery.mes.dto.report.ProductionReportSummaryDto;

@Mapper
public interface ReportMapper {

    DailyQualityReportDto selectDailyQualityReport(@Param("startDate") String startDate, @Param("endDate") String endDate);

    ProductionReportSummaryDto selectProductionReportSummary(@Param("startDate") String startDate, @Param("endDate") String endDate);

    List<ProductionReportProcessDto> selectProductionReportProcessBreakdown(@Param("startDate") String startDate, @Param("endDate") String endDate);
}
