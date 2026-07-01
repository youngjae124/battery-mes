package com.battery.mes.dto.spc;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class SpcDataSaveRequestDto {

    @NotBlank(message = "lotId is required.")
    private String lotId;

    private String workOrderId;

    @NotBlank(message = "parameterName is required.")
    private String parameterName;

    @NotNull(message = "subgroupNo is required.")
    @Positive(message = "subgroupNo must be greater than 0.")
    private Integer subgroupNo;

    @NotBlank(message = "sampleValues is required.")
    private String sampleValues;

    private BigDecimal xBar;

    private BigDecimal rangeValue;

    private BigDecimal ucl;

    private BigDecimal cl;

    private BigDecimal lcl;

    private BigDecimal usl;

    private BigDecimal lsl;

    private BigDecimal cp;

    private BigDecimal cpk;

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

    public String getParameterName() {
        return parameterName;
    }

    public void setParameterName(String parameterName) {
        this.parameterName = parameterName;
    }

    public Integer getSubgroupNo() {
        return subgroupNo;
    }

    public void setSubgroupNo(Integer subgroupNo) {
        this.subgroupNo = subgroupNo;
    }

    public String getSampleValues() {
        return sampleValues;
    }

    public void setSampleValues(String sampleValues) {
        this.sampleValues = sampleValues;
    }

    public BigDecimal getXBar() {
        return xBar;
    }

    public void setXBar(BigDecimal xBar) {
        this.xBar = xBar;
    }

    public BigDecimal getRangeValue() {
        return rangeValue;
    }

    public void setRangeValue(BigDecimal rangeValue) {
        this.rangeValue = rangeValue;
    }

    public BigDecimal getUcl() {
        return ucl;
    }

    public void setUcl(BigDecimal ucl) {
        this.ucl = ucl;
    }

    public BigDecimal getCl() {
        return cl;
    }

    public void setCl(BigDecimal cl) {
        this.cl = cl;
    }

    public BigDecimal getLcl() {
        return lcl;
    }

    public void setLcl(BigDecimal lcl) {
        this.lcl = lcl;
    }

    public BigDecimal getUsl() {
        return usl;
    }

    public void setUsl(BigDecimal usl) {
        this.usl = usl;
    }

    public BigDecimal getLsl() {
        return lsl;
    }

    public void setLsl(BigDecimal lsl) {
        this.lsl = lsl;
    }

    public BigDecimal getCp() {
        return cp;
    }

    public void setCp(BigDecimal cp) {
        this.cp = cp;
    }

    public BigDecimal getCpk() {
        return cpk;
    }

    public void setCpk(BigDecimal cpk) {
        this.cpk = cpk;
    }
}
