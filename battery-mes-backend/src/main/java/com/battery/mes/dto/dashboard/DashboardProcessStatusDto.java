package com.battery.mes.dto.dashboard;

public class DashboardProcessStatusDto {

    private String processType;
    private long totalCount;
    private long plannedCount;
    private long runningCount;
    private long doneCount;
    private long holdCount;

    public String getProcessType() {
        return processType;
    }

    public void setProcessType(String processType) {
        this.processType = processType;
    }

    public long getTotalCount() {
        return totalCount;
    }

    public void setTotalCount(long totalCount) {
        this.totalCount = totalCount;
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
}
