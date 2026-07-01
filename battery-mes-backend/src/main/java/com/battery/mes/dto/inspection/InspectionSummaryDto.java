package com.battery.mes.dto.inspection;

public class InspectionSummaryDto {

    private long totalCount;
    private long passCount;
    private long failCount;
    private long gradeACount;
    private long gradeBCount;
    private long gradeCCount;
    private long iqcCount;
    private long ipqcCount;
    private long oqcCount;
    private long agingPassCount;
    private long agingFailCount;
    private long agingPendingCount;

    public long getTotalCount() {
        return totalCount;
    }

    public void setTotalCount(long totalCount) {
        this.totalCount = totalCount;
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

    public long getGradeACount() {
        return gradeACount;
    }

    public void setGradeACount(long gradeACount) {
        this.gradeACount = gradeACount;
    }

    public long getGradeBCount() {
        return gradeBCount;
    }

    public void setGradeBCount(long gradeBCount) {
        this.gradeBCount = gradeBCount;
    }

    public long getGradeCCount() {
        return gradeCCount;
    }

    public void setGradeCCount(long gradeCCount) {
        this.gradeCCount = gradeCCount;
    }

    public long getIqcCount() {
        return iqcCount;
    }

    public void setIqcCount(long iqcCount) {
        this.iqcCount = iqcCount;
    }

    public long getIpqcCount() {
        return ipqcCount;
    }

    public void setIpqcCount(long ipqcCount) {
        this.ipqcCount = ipqcCount;
    }

    public long getOqcCount() {
        return oqcCount;
    }

    public void setOqcCount(long oqcCount) {
        this.oqcCount = oqcCount;
    }

    public long getAgingPassCount() {
        return agingPassCount;
    }

    public void setAgingPassCount(long agingPassCount) {
        this.agingPassCount = agingPassCount;
    }

    public long getAgingFailCount() {
        return agingFailCount;
    }

    public void setAgingFailCount(long agingFailCount) {
        this.agingFailCount = agingFailCount;
    }

    public long getAgingPendingCount() {
        return agingPendingCount;
    }

    public void setAgingPendingCount(long agingPendingCount) {
        this.agingPendingCount = agingPendingCount;
    }
}
