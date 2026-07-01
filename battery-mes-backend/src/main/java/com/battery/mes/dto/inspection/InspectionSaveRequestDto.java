package com.battery.mes.dto.inspection;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class InspectionSaveRequestDto {

    @NotBlank(message = "lotId is required.")
    private String lotId;

    private String workOrderId;

    @NotBlank(message = "processType is required.")
    private String processType;

    @NotBlank(message = "inspectionItem is required.")
    private String inspectionItem;

    private BigDecimal specMin;

    private BigDecimal specMax;

    @NotNull(message = "measuredValue is required.")
    @DecimalMin(value = "0.0", inclusive = true, message = "measuredValue must be greater than or equal to 0.")
    private BigDecimal measuredValue;

    private String agingStatus;

    private String remarks;

    public String getLotId() {
        return lotId;
    }

    public void setLotId(String lotId) {
        this.lotId = lotId;
    }

    public String getWorkOrderId() {
        return workOrderId;
    }

    public void setWorkOrderId(String workOrderId) {
        this.workOrderId = workOrderId;
    }

    public String getProcessType() {
        return processType;
    }

    public void setProcessType(String processType) {
        this.processType = processType;
    }

    public String getInspectionItem() {
        return inspectionItem;
    }

    public void setInspectionItem(String inspectionItem) {
        this.inspectionItem = inspectionItem;
    }

    public BigDecimal getSpecMin() {
        return specMin;
    }

    public void setSpecMin(BigDecimal specMin) {
        this.specMin = specMin;
    }

    public BigDecimal getSpecMax() {
        return specMax;
    }

    public void setSpecMax(BigDecimal specMax) {
        this.specMax = specMax;
    }

    public BigDecimal getMeasuredValue() {
        return measuredValue;
    }

    public void setMeasuredValue(BigDecimal measuredValue) {
        this.measuredValue = measuredValue;
    }

    public String getAgingStatus() {
        return agingStatus;
    }

    public void setAgingStatus(String agingStatus) {
        this.agingStatus = agingStatus;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
}
