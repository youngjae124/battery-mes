package com.battery.mes.dto.report;

import java.math.BigDecimal;

public class ProductionReportProcessDto {

    private String processType;
    private long orderCount;
    private long doneCount;
    private long targetQty;
    private long actualQty;
    private BigDecimal achievementRate;

    public String getProcessType() {
        return processType;
    }

    public void setProcessType(String processType) {
        this.processType = processType;
    }

    public long getOrderCount() {
        return orderCount;
    }

    public void setOrderCount(long orderCount) {
        this.orderCount = orderCount;
    }

    public long getDoneCount() {
        return doneCount;
    }

    public void setDoneCount(long doneCount) {
        this.doneCount = doneCount;
    }

    public long getTargetQty() {
        return targetQty;
    }

    public void setTargetQty(long targetQty) {
        this.targetQty = targetQty;
    }

    public long getActualQty() {
        return actualQty;
    }

    public void setActualQty(long actualQty) {
        this.actualQty = actualQty;
    }

    public BigDecimal getAchievementRate() {
        return achievementRate;
    }

    public void setAchievementRate(BigDecimal achievementRate) {
        this.achievementRate = achievementRate;
    }
}
