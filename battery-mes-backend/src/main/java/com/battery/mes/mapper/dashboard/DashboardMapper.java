package com.battery.mes.mapper.dashboard;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.battery.mes.dto.dashboard.DashboardDefectCategoryDto;
import com.battery.mes.dto.dashboard.DashboardEquipmentStatusDto;
import com.battery.mes.dto.dashboard.DashboardKpiDto;
import com.battery.mes.dto.dashboard.DashboardProcessStatusDto;
import com.battery.mes.dto.dashboard.DashboardQualityTrendDto;

@Mapper
public interface DashboardMapper {

    DashboardKpiDto selectKpis();

    List<DashboardEquipmentStatusDto> selectEquipmentStatus();

    List<DashboardProcessStatusDto> selectProcessStatus();

    List<DashboardQualityTrendDto> selectQualityTrend(@Param("days") int days);

    List<DashboardDefectCategoryDto> selectDefectCategories();
}
