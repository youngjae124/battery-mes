package com.battery.mes.dto.report;

import java.math.BigDecimal;

public class DailyQualityReportDto {

    private String startDate;
    private String endDate;
    private long totalInspections;
    private long passCount;
    private long failCount;
    private BigDecimal passRate;
    private long gradeACount;
    private long gradeBCount;
    private long gradeCCount;
    private long totalDefects;
    private long criticalDefectCount;
    private long majorDefectCount;
    private long minorDefectCount;

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

    public long getTotalInspections() {
        return totalInspections;
    }

    public void setTotalInspections(long totalInspections) {
        this.totalInspections = totalInspections;
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

    public BigDecimal getPassRate() {
        return passRate;
    }

    public void setPassRate(BigDecimal passRate) {
        this.passRate = passRate;
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

    public long getTotalDefects() {
        return totalDefects;
    }

    public void setTotalDefects(long totalDefects) {
        this.totalDefects = totalDefects;
    }

    public long getCriticalDefectCount() {
        return criticalDefectCount;
    }

    public void setCriticalDefectCount(long criticalDefectCount) {
        this.criticalDefectCount = criticalDefectCount;
    }

    public long getMajorDefectCount() {
        return majorDefectCount;
    }

    public void setMajorDefectCount(long majorDefectCount) {
        this.majorDefectCount = majorDefectCount;
    }

    public long getMinorDefectCount() {
        return minorDefectCount;
    }

    public void setMinorDefectCount(long minorDefectCount) {
        this.minorDefectCount = minorDefectCount;
    }
}
