package com.battery.mes.domain.spc;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class SpcData {

    private String id;
    private String lotId;
    private String workOrderId;
    private String lotNumber;
    private String woNumber;
    private String parameterName;
    private Integer subgroupNo;
    private String sampleValues;
    private BigDecimal xBar;
    private BigDecimal rangeValue;
    private BigDecimal ucl;
    private BigDecimal cl;
    private BigDecimal lcl;
    private LocalDateTime measuredAt;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

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

    public String getLotNumber() {
        return lotNumber;
    }

    public void setLotNumber(String lotNumber) {
        this.lotNumber = lotNumber;
    }

    public String getWoNumber() {
        return woNumber;
    }

    public void setWoNumber(String woNumber) {
        this.woNumber = woNumber;
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

    public LocalDateTime getMeasuredAt() {
        return measuredAt;
    }

    public void setMeasuredAt(LocalDateTime measuredAt) {
        this.measuredAt = measuredAt;
    }
}
