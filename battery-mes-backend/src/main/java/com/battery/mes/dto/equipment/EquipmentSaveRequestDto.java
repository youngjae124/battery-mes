package com.battery.mes.dto.equipment;

import java.time.LocalDateTime;

import jakarta.validation.constraints.NotBlank;

public class EquipmentSaveRequestDto {

    @NotBlank(message = "eqCode is required.")
    private String eqCode;

    @NotBlank(message = "eqName is required.")
    private String eqName;

    @NotBlank(message = "eqType is required.")
    private String eqType;

    @NotBlank(message = "status is required.")
    private String status;

    private LocalDateTime lastPmAt;

    public String getEqCode() {
        return eqCode;
    }

    public void setEqCode(String eqCode) {
        this.eqCode = eqCode;
    }

    public String getEqName() {
        return eqName;
    }

    public void setEqName(String eqName) {
        this.eqName = eqName;
    }

    public String getEqType() {
        return eqType;
    }

    public void setEqType(String eqType) {
        this.eqType = eqType;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getLastPmAt() {
        return lastPmAt;
    }

    public void setLastPmAt(LocalDateTime lastPmAt) {
        this.lastPmAt = lastPmAt;
    }
}
