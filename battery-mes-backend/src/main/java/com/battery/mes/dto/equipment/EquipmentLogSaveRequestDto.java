package com.battery.mes.dto.equipment;

import java.time.LocalDateTime;

import jakarta.validation.constraints.NotBlank;

public class EquipmentLogSaveRequestDto {

    @NotBlank(message = "equipmentId is required.")
    private String equipmentId;

    @NotBlank(message = "logType is required.")
    private String logType;

    @NotBlank(message = "description is required.")
    private String description;

    private LocalDateTime occurredAt;

    public String getEquipmentId() {
        return equipmentId;
    }

    public void setEquipmentId(String equipmentId) {
        this.equipmentId = equipmentId;
    }

    public String getLogType() {
        return logType;
    }

    public void setLogType(String logType) {
        this.logType = logType;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getOccurredAt() {
        return occurredAt;
    }

    public void setOccurredAt(LocalDateTime occurredAt) {
        this.occurredAt = occurredAt;
    }
}
