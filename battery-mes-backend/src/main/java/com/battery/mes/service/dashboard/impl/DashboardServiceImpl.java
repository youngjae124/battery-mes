package com.battery.mes.service.dashboard.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.battery.mes.common.exception.BadRequestException;
import com.battery.mes.dto.dashboard.DashboardDefectCategoryDto;
import com.battery.mes.dto.dashboard.DashboardEquipmentStatusDto;
import com.battery.mes.dto.dashboard.DashboardKpiDto;
import com.battery.mes.dto.dashboard.DashboardProcessStatusDto;
import com.battery.mes.dto.dashboard.DashboardQualityTrendDto;
import com.battery.mes.mapper.dashboard.DashboardMapper;
import com.battery.mes.service.dashboard.DashboardService;

@Service
public class DashboardServiceImpl implements DashboardService {

    private final DashboardMapper dashboardMapper;

    public DashboardServiceImpl(DashboardMapper dashboardMapper) {
        this.dashboardMapper = dashboardMapper;
    }

    @Override
    public DashboardKpiDto getKpis() {
        return dashboardMapper.selectKpis();
    }

    @Override
    public List<DashboardEquipmentStatusDto> getEquipmentStatus() {
        return dashboardMapper.selectEquipmentStatus();
    }

    @Override
    public List<DashboardProcessStatusDto> getProcessStatus() {
        return dashboardMapper.selectProcessStatus();
    }

    @Override
    public List<DashboardQualityTrendDto> getQualityTrend(int days) {
        if (days < 1 || days > 30) {
            throw new BadRequestException("days must be between 1 and 30.");
        }
        return dashboardMapper.selectQualityTrend(days);
    }

    @Override
    public List<DashboardDefectCategoryDto> getDefectCategories() {
        return dashboardMapper.selectDefectCategories();
    }
}
