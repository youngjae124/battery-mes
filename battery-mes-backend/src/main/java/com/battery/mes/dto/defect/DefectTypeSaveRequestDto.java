package com.battery.mes.dto.defect;

import jakarta.validation.constraints.NotBlank;

public class DefectTypeSaveRequestDto {

    @NotBlank(message = "code is required.")
    private String code;

    @NotBlank(message = "name is required.")
    private String name;

    @NotBlank(message = "category is required.")
    private String category;

    private String description;

    private String isActive;

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getIsActive() {
        return isActive;
    }

    public void setIsActive(String isActive) {
        this.isActive = isActive;
    }
}
