package com.battery.mes.dto.dashboard;

public class DashboardQualityTrendDto {

    private String statDate;
    private long inspectionCount;
    private long passCount;
    private long failCount;
    private long defectCount;

    public String getStatDate() {
        return statDate;
    }

    public void setStatDate(String statDate) {
        this.statDate = statDate;
    }

    public long getInspectionCount() {
        return inspectionCount;
    }

    public void setInspectionCount(long inspectionCount) {
        this.inspectionCount = inspectionCount;
    }

    public long getPassCount() {
        return passCount;
    }

    public void setPassCount(long passCount) {
        this.passCount = passCount;
    }

    public long getFailCount() {
        return failCount;
    }

    public void setFailCount(long failCount) {
        this.failCount = failCount;
    }

    public long getDefectCount() {
        return defectCount;
    }

    public void setDefectCount(long defectCount) {
        this.defectCount = defectCount;
    }
}
