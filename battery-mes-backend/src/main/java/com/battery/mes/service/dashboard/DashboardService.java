package com.battery.mes.service.dashboard;

import java.util.List;

import com.battery.mes.dto.dashboard.DashboardDefectCategoryDto;
import com.battery.mes.dto.dashboard.DashboardEquipmentStatusDto;
import com.battery.mes.dto.dashboard.DashboardKpiDto;
import com.battery.mes.dto.dashboard.DashboardProcessStatusDto;
import com.battery.mes.dto.dashboard.DashboardQualityTrendDto;

public interface DashboardService {

    DashboardKpiDto getKpis();

    List<DashboardEquipmentStatusDto> getEquipmentStatus();

    List<DashboardProcessStatusDto> getProcessStatus();

    List<DashboardQualityTrendDto> getQualityTrend(int days);

    List<DashboardDefectCategoryDto> getDefectCategories();
}
