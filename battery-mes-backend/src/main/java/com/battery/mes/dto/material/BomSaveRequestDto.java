package com.battery.mes.dto.material;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class BomSaveRequestDto {

    @NotBlank(message = "productCode is required.")
    private String productCode;

    @NotBlank(message = "materialId is required.")
    private String materialId;

    @NotNull(message = "qtyPerUnit is required.")
    @DecimalMin(value = "0.0001", inclusive = true, message = "qtyPerUnit must be greater than 0.")
    private BigDecimal qtyPerUnit;

    @NotBlank(message = "unit is required.")
    private String unit;

    public String getProductCode() {
        return productCode;
    }

    public void setProductCode(String productCode) {
        this.productCode = productCode;
    }

    public String getMaterialId() {
        return materialId;
    }

    public void setMaterialId(String materialId) {
        this.materialId = materialId;
    }

    public BigDecimal getQtyPerUnit() {
        return qtyPerUnit;
    }

    public void setQtyPerUnit(BigDecimal qtyPerUnit) {
        this.qtyPerUnit = qtyPerUnit;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }
}
