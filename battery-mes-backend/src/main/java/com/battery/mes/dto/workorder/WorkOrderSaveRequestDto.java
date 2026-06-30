package com.battery.mes.dto.workorder;

import java.time.LocalDateTime;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class WorkOrderSaveRequestDto {

    @NotBlank(message = "woNumber is required.")
    @Size(max = 50, message = "woNumber must be 50 characters or fewer.")
    private String woNumber;

    @NotBlank(message = "lotId is required.")
    private String lotId;

    @NotBlank(message = "equipmentId is required.")
    private String equipmentId;

    @NotBlank(message = "processType is required.")
    private String processType;

    @NotBlank(message = "status is required.")
    private String status;

    @Min(value = 1, message = "targetQty must be greater than 0.")
    private int targetQty;

    @Min(value = 0, message = "actualQty must be greater than or equal to 0.")
    private int actualQty;

    @NotNull(message = "plannedStart is required.")
    private LocalDateTime plannedStart;

    private LocalDateTime actualStart;

    private LocalDateTime actualEnd;

    public String getWoNumber() {
        return woNumber;
    }

    public void setWoNumber(String woNumber) {
        this.woNumber = woNumber;
    }

    public String getLotId() {
        return lotId;
    }

    public void setLotId(String lotId) {
        this.lotId = lotId;
    }

    public String getEquipmentId() {
        return equipmentId;
    }

    public void setEquipmentId(String equipmentId) {
        this.equipmentId = equipmentId;
    }

    public String getProcessType() {
        return processType;
    }

    public void setProcessType(String processType) {
        this.processType = processType;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public int getTargetQty() {
        return targetQty;
    }

    public void setTargetQty(int targetQty) {
        this.targetQty = targetQty;
    }

    public int getActualQty() {
        return actualQty;
    }

    public void setActualQty(int actualQty) {
        this.actualQty = actualQty;
    }

    public LocalDateTime getPlannedStart() {
        return plannedStart;
    }

    public void setPlannedStart(LocalDateTime plannedStart) {
        this.plannedStart = plannedStart;
    }

    public LocalDateTime getActualStart() {
        return actualStart;
    }

    public void setActualStart(LocalDateTime actualStart) {
        this.actualStart = actualStart;
    }

    public LocalDateTime getActualEnd() {
        return actualEnd;
    }

    public void setActualEnd(LocalDateTime actualEnd) {
        this.actualEnd = actualEnd;
    }
}
