package com.battery.mes.dto.analysis;

import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonProperty;

public class PythonSpcAnalysisResponseDto {

    @JsonProperty("sample_count")
    private int sampleCount;
    private BigDecimal average;
    private BigDecimal max;
    private BigDecimal min;
    @JsonProperty("standard_deviation")
    private BigDecimal standardDeviation;
    @JsonProperty("process_status")
    private String processStatus;
    private BigDecimal cp;
    private BigDecimal cpk;

    public int getSampleCount() {
        return sampleCount;
    }

    public void setSampleCount(int sampleCount) {
        this.sampleCount = sampleCount;
    }

    public BigDecimal getAverage() {
        return average;
    }

    public void setAverage(BigDecimal average) {
        this.average = average;
    }

    public BigDecimal getMax() {
        return max;
    }

    public void setMax(BigDecimal max) {
        this.max = max;
    }

    public BigDecimal getMin() {
        return min;
    }

    public void setMin(BigDecimal min) {
        this.min = min;
    }

    public BigDecimal getStandardDeviation() {
        return standardDeviation;
    }

    public void setStandardDeviation(BigDecimal standardDeviation) {
        this.standardDeviation = standardDeviation;
    }

    public String getProcessStatus() {
        return processStatus;
    }

    public void setProcessStatus(String processStatus) {
        this.processStatus = processStatus;
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