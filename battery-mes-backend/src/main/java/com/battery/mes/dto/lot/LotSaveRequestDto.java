package com.battery.mes.dto.lot;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class LotSaveRequestDto {

    @NotBlank(message = "lotNumber is required.")
    @Size(max = 50, message = "lotNumber must be 50 characters or fewer.")
    private String lotNumber;

    @NotBlank(message = "productName is required.")
    @Size(max = 200, message = "productName must be 200 characters or fewer.")
    private String productName;

    @Min(value = 1, message = "quantity must be greater than 0.")
    private int quantity;

    @NotBlank(message = "status is required.")
    private String status;

    public String getLotNumber() {
        return lotNumber;
    }

    public void setLotNumber(String lotNumber) {
        this.lotNumber = lotNumber;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
