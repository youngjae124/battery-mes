package com.battery.mes.dto.report;

import java.math.BigDecimal;
import java.util.List;

public class ProductionReportDto {

    private String startDate;
    private String endDate;
    private long totalWorkOrders;
    private long plannedCount;
    private long runningCount;
    private long doneCount;
    private long holdCount;
    private long totalTargetQty;
    private long totalActualQty;
    private BigDecimal achievementRate;
    private List<ProductionReportProcessDto> processBreakdown;

    public String getStartDate() {
        return startDate;
    }

    public void setStartDate(String startDate) {
        this.startDate = startDate;
    }

    public String getEndDate() {
        return endDate;
    }

    public void setEndDate(String endDate) {
        this.endDate = endDate;
    }

    public long getTotalWorkOrders() {
        return totalWorkOrders;
    }

    public void setTotalWorkOrders(long totalWorkOrders) {
        this.totalWorkOrders = totalWorkOrders;
    }

    public long getPlannedCount() {
        return plannedCount;
    }

    public void setPlannedCount(long plannedCount) {
        this.plannedCount = plannedCount;
    }

    public long getRunningCount() {
        return runningCount;
    }

    public void setRunningCount(long runningCount) {
        this.runningCount = runningCount;
    }

    public long getDoneCount() {
        return doneCount;
    }

    public void setDoneCount(long doneCount) {
        this.doneCount = doneCount;
    }

    public long getHoldCount() {
        return holdCount;
    }

    public void setHoldCount(long holdCount) {
        this.holdCount = holdCount;
    }

    public long getTotalTargetQty() {
        return totalTargetQty;
    }

    public void setTotalTargetQty(long totalTargetQty) {
        this.totalTargetQty = totalTargetQty;
    }

    public long getTotalActualQty() {
        return totalActualQty;
    }

    public void setTotalActualQty(long totalActualQty) {
        this.totalActualQty = totalActualQty;
    }

    public BigDecimal getAchievementRate() {
        return achievementRate;
    }

    public void setAchievementRate(BigDecimal achievementRate) {
        this.achievementRate = achievementRate;
    }

    public List<ProductionReportProcessDto> getProcessBreakdown() {
        return processBreakdown;
    }

    public void setProcessBreakdown(List<ProductionReportProcessDto> processBreakdown) {
        this.processBreakdown = processBreakdown;
    }
}
