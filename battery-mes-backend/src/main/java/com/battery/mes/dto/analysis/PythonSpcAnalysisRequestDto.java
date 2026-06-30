package com.battery.mes.dto.analysis;

import java.math.BigDecimal;
import java.util.List;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

public class PythonSpcAnalysisRequestDto {

    @NotEmpty(message = "values is required.")
    private List<@NotNull(message = "values element must not be null.") BigDecimal> values;

    public List<BigDecimal> getValues() {
        return values;
    }

    public void setValues(List<BigDecimal> values) {
        this.values = values;
    }
}