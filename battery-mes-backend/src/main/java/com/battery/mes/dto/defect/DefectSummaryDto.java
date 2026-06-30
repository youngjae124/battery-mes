package com.battery.mes.dto.defect;

public class DefectSummaryDto {

    private long totalCount;
    private long criticalCount;
    private long majorCount;
    private long minorCount;
    private long electrodeCategoryCount;
    private long assemblyCategoryCount;
    private long activationCategoryCount;
    private long oqcCategoryCount;

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

    public long getElectrodeCategoryCount() {
        return electrodeCategoryCount;
    }

    public void setElectrodeCategoryCount(long electrodeCategoryCount) {
        this.electrodeCategoryCount = electrodeCategoryCount;
    }

    public long getAssemblyCategoryCount() {
        return assemblyCategoryCount;
    }

    public void setAssemblyCategoryCount(long assemblyCategoryCount) {
        this.assemblyCategoryCount = assemblyCategoryCount;
    }

    public long getActivationCategoryCount() {
        return activationCategoryCount;
    }

    public void setActivationCategoryCount(long activationCategoryCount) {
        this.activationCategoryCount = activationCategoryCount;
    }

    public long getOqcCategoryCount() {
        return oqcCategoryCount;
    }

    public void setOqcCategoryCount(long oqcCategoryCount) {
        this.oqcCategoryCount = oqcCategoryCount;
    }
}
