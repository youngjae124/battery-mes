package com.battery.mes.dto.defect;

public class DefectTrendDto {

    private String statDate;
    private long totalCount;
    private long criticalCount;
    private long majorCount;
    private long minorCount;

    public String getStatDate() {
        return statDate;
    }

    public void setStatDate(String statDate) {
        this.statDate = statDate;
    }

    public long getTotalCount() {
        return totalCount;
    }

    public void setTotalCount(long totalCount) {
        this.totalCount = totalCount;
    }

    public long getCriticalCount() {
        return criticalCount;
    }

    public void setCriticalCount(long criticalCount) {
        this.criticalCount = criticalCount;
    }

    public long getMajorCount() {
        return majorCount;
    }

    public void setMajorCount(long majorCount) {
        this.majorCount = majorCount;
    }

    public long getMinorCount() {
        return minorCount;
    }

    public void setMinorCount(long minorCount) {
        this.minorCount = minorCount;
    }
}
