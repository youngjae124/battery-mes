package com.battery.mes.dto.material;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class MaterialSaveRequestDto {

    @NotBlank(message = "matCode is required.")
    private String matCode;

    @NotBlank(message = "matName is required.")
    private String matName;

    @NotBlank(message = "matType is required.")
    private String matType;

    @NotNull(message = "stockQty is required.")
    @DecimalMin(value = "0.0", inclusive = true, message = "stockQty must be greater than or equal to 0.")
    private BigDecimal stockQty;

    @NotBlank(message = "unit is required.")
    private String unit;

    public String getMatCode() {
        return matCode;
    }

    public void setMatCode(String matCode) {
        this.matCode = matCode;
    }

    public String getMatName() {
        return matName;
    }

    public void setMatName(String matName) {
        this.matName = matName;
    }

    public String getMatType() {
        return matType;
    }

    public void setMatType(String matType) {
        this.matType = matType;
    }

    public BigDecimal getStockQty() {
        return stockQty;
    }

    public void setStockQty(BigDecimal stockQty) {
        this.stockQty = stockQty;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }
}
