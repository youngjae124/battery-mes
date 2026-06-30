package com.battery.mes.mapper.report;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.battery.mes.dto.report.DailyQualityReportDto;
import com.battery.mes.dto.report.ProductionReportProcessDto;
import com.battery.mes.dto.report.ProductionReportSummaryDto;

@Mapper
public interface ReportMapper {

    DailyQualityReportDto selectDailyQualityReport(@Param("date") String date);

    ProductionReportSummaryDto selectProductionReportSummary(@Param("date") String date);

    List<ProductionReportProcessDto> selectProductionReportProcessBreakdown(@Param("date") String date);
}
