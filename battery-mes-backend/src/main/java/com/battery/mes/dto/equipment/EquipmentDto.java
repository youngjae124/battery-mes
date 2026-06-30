package com.battery.mes.dto.equipment;

import java.time.LocalDateTime;

public class EquipmentDto {

    private String id;
    private String eqCode;
    private String eqName;
    private String eqType;
    private String status;
    private LocalDateTime lastPmAt;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

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
