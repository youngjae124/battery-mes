package com.battery.mes.dto.analysis;

import java.math.BigDecimal;
import java.util.List;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

public class PythonSpcAnalysisRequestDto {

    @NotEmpty(message = "values is required.")
    private List<@NotNull(message = "values element must not be null.") BigDecimal> values;

    private BigDecimal usl;

    private BigDecimal lsl;

    public List<BigDecimal> getValues() {
        return values;
    }

    public void setValues(List<BigDecimal> values) {
        this.values = values;
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
}