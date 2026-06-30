package com.battery.mes.dto.dashboard;

import java.math.BigDecimal;

public class DashboardKpiDto {

    private int totalLots;
    private int completedLots;
    private int holdLots;
    private int passLots;
    private int failLots;
    private int defectCount;
    private int gradeALots;
    private int gradeBLots;
    private int gradeCLots;
    private int runningEquipmentCount;
    private int totalEquipmentCount;
    private BigDecimal defectRate;
    private BigDecimal passRate;
    private BigDecimal equipmentAvailability;

    public int getTotalLots() {
        return totalLots;
    }

    public void setTotalLots(int totalLots) {
        this.totalLots = totalLots;
    }

    public int getCompletedLots() {
        return completedLots;
    }

    public void setCompletedLots(int completedLots) {
        this.completedLots = completedLots;
    }

    public int getHoldLots() {
        return holdLots;
    }

    public void setHoldLots(int holdLots) {
        this.holdLots = holdLots;
    }

    public int getPassLots() {
        return passLots;
    }

    public void setPassLots(int passLots) {
        this.passLots = passLots;
    }

    public int getFailLots() {
        return failLots;
    }

    public void setFailLots(int failLots) {
        this.failLots = failLots;
    }

    public int getDefectCount() {
        return defectCount;
    }

    public void setDefectCount(int defectCount) {
        this.defectCount = defectCount;
    }

    public int getGradeALots() {
        return gradeALots;
    }

    public void setGradeALots(int gradeALots) {
        this.gradeALots = gradeALots;
    }

    public int getGradeBLots() {
        return gradeBLots;
    }

    public void setGradeBLots(int gradeBLots) {
        this.gradeBLots = gradeBLots;
    }

    public int getGradeCLots() {
        return gradeCLots;
    }

    public void setGradeCLots(int gradeCLots) {
        this.gradeCLots = gradeCLots;
    }

    public int getRunningEquipmentCount() {
        return runningEquipmentCount;
    }

    public void setRunningEquipmentCount(int runningEquipmentCount) {
        this.runningEquipmentCount = runningEquipmentCount;
    }

    public int getTotalEquipmentCount() {
        return totalEquipmentCount;
    }

    public void setTotalEquipmentCount(int totalEquipmentCount) {
        this.totalEquipmentCount = totalEquipmentCount;
    }

    public BigDecimal getDefectRate() {
        return defectRate;
    }

    public void setDefectRate(BigDecimal defectRate) {
        this.defectRate = defectRate;
    }

    public BigDecimal getPassRate() {
        return passRate;
    }

    public void setPassRate(BigDecimal passRate) {
        this.passRate = passRate;
    }

    public BigDecimal getEquipmentAvailability() {
        return equipmentAvailability;
    }

    public void setEquipmentAvailability(BigDecimal equipmentAvailability) {
        this.equipmentAvailability = equipmentAvailability;
    }
}
