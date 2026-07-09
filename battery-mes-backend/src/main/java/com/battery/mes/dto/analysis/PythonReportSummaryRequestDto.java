package com.battery.mes.dto.analysis;

import java.math.BigDecimal;
import java.util.List;

public class PythonReportSummaryRequestDto {

    private String startDate;
    private String endDate;
    private QualityData quality;
    private ProductionData production;

    public static class QualityData {
        private int totalInspections;
        private int passCount;
        private int failCount;
        private BigDecimal passRate;
        private int totalDefects;
        private int criticalDefectCount;
        private int majorDefectCount;
        private int minorDefectCount;
        private int gradeACount;
        private int gradeBCount;
        private int gradeCCount;

        public int getTotalInspections() { return totalInspections; }
        public void setTotalInspections(int v) { this.totalInspections = v; }
        public int getPassCount() { return passCount; }
        public void setPassCount(int v) { this.passCount = v; }
        public int getFailCount() { return failCount; }
        public void setFailCount(int v) { this.failCount = v; }
        public BigDecimal getPassRate() { return passRate; }
        public void setPassRate(BigDecimal v) { this.passRate = v; }
        public int getTotalDefects() { return totalDefects; }
        public void setTotalDefects(int v) { this.totalDefects = v; }
        public int getCriticalDefectCount() { return criticalDefectCount; }
        public void setCriticalDefectCount(int v) { this.criticalDefectCount = v; }
        public int getMajorDefectCount() { return majorDefectCount; }
        public void setMajorDefectCount(int v) { this.majorDefectCount = v; }
        public int getMinorDefectCount() { return minorDefectCount; }
        public void setMinorDefectCount(int v) { this.minorDefectCount = v; }
        public int getGradeACount() { return gradeACount; }
        public void setGradeACount(int v) { this.gradeACount = v; }
        public int getGradeBCount() { return gradeBCount; }
        public void setGradeBCount(int v) { this.gradeBCount = v; }
        public int getGradeCCount() { return gradeCCount; }
        public void setGradeCCount(int v) { this.gradeCCount = v; }
    }

    public static class ProcessBreakdownItem {
        private String processType;
        private int orderCount;
        private int doneCount;
        private int targetQty;
        private int actualQty;
        private BigDecimal achievementRate;

        public String getProcessType() { return processType; }
        public void setProcessType(String v) { this.processType = v; }
        public int getOrderCount() { return orderCount; }
        public void setOrderCount(int v) { this.orderCount = v; }
        public int getDoneCount() { return doneCount; }
        public void setDoneCount(int v) { this.doneCount = v; }
        public int getTargetQty() { return targetQty; }
        public void setTargetQty(int v) { this.targetQty = v; }
        public int getActualQty() { return actualQty; }
        public void setActualQty(int v) { this.actualQty = v; }
        public BigDecimal getAchievementRate() { return achievementRate; }
        public void setAchievementRate(BigDecimal v) { this.achievementRate = v; }
    }

    public static class ProductionData {
        private int totalWorkOrders;
        private int doneCount;
        private BigDecimal achievementRate;
        private int totalTargetQty;
        private int totalActualQty;
        private List<ProcessBreakdownItem> processBreakdown;

        public int getTotalWorkOrders() { return totalWorkOrders; }
        public void setTotalWorkOrders(int v) { this.totalWorkOrders = v; }
        public int getDoneCount() { return doneCount; }
        public void setDoneCount(int v) { this.doneCount = v; }
        public BigDecimal getAchievementRate() { return achievementRate; }
        public void setAchievementRate(BigDecimal v) { this.achievementRate = v; }
        public int getTotalTargetQty() { return totalTargetQty; }
        public void setTotalTargetQty(int v) { this.totalTargetQty = v; }
        public int getTotalActualQty() { return totalActualQty; }
        public void setTotalActualQty(int v) { this.totalActualQty = v; }
        public List<ProcessBreakdownItem> getProcessBreakdown() { return processBreakdown; }
        public void setProcessBreakdown(List<ProcessBreakdownItem> v) { this.processBreakdown = v; }
    }

    public String getStartDate() { return startDate; }
    public void setStartDate(String v) { this.startDate = v; }
    public String getEndDate() { return endDate; }
    public void setEndDate(String v) { this.endDate = v; }
    public QualityData getQuality() { return quality; }
    public void setQuality(QualityData v) { this.quality = v; }
    public ProductionData getProduction() { return production; }
    public void setProduction(ProductionData v) { this.production = v; }
}
