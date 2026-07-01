package com.battery.mes.dto.spc;

import java.math.BigDecimal;

public class SpcChartPointDto {

    private String id;
    private String parameterName;
    private int subgroupNo;
    private BigDecimal xBar;
    private BigDecimal rangeValue;
    private BigDecimal ucl;
    private BigDecimal cl;
    private BigDecimal lcl;
    private String measuredAt;
    private String lotNumber;
    private String woNumber;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getParameterName() {
        return parameterName;
    }

    public void setParameterName(String parameterName) {
        this.parameterName = parameterName;
    }

    public int getSubgroupNo() {
        return subgroupNo;
    }

    public void setSubgroupNo(int subgroupNo) {
        this.subgroupNo = subgroupNo;
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

    public String getMeasuredAt() {
        return measuredAt;
    }

    public void setMeasuredAt(String measuredAt) {
        this.measuredAt = measuredAt;
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
}
