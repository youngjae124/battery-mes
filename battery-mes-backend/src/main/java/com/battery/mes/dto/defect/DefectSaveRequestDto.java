package com.battery.mes.dto.defect;

import jakarta.validation.constraints.NotBlank;

public class DefectSaveRequestDto {

    @NotBlank(message = "inspectionId is required.")
    private String inspectionId;

    @NotBlank(message = "defectCode is required.")
    private String defectCode;

    @NotBlank(message = "severity is required.")
    private String severity;

    private String description;

    public String getInspectionId() {
        return inspectionId;
    }

    public void setInspectionId(String inspectionId) {
        this.inspectionId = inspectionId;
    }

    public String getDefectCode() {
        return defectCode;
    }

    public void setDefectCode(String defectCode) {
        this.defectCode = defectCode;
    }

    public String getSeverity() {
        return severity;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
