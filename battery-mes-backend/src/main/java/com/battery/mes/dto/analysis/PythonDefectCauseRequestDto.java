package com.battery.mes.dto.analysis;

import java.math.BigDecimal;

public class PythonDefectCauseRequestDto {

    private DefectData defect;
    private InspectionData inspection;

    public static class DefectData {
        private String severity;
        private String defectCode;
        private String description;
        private String category;

        public String getSeverity() { return severity; }
        public void setSeverity(String v) { this.severity = v; }
        public String getDefectCode() { return defectCode; }
        public void setDefectCode(String v) { this.defectCode = v; }
        public String getDescription() { return description; }
        public void setDescription(String v) { this.description = v; }
        public String getCategory() { return category; }
        public void setCategory(String v) { this.category = v; }
    }

    public static class InspectionData {
        private String processType;
        private String inspectionItem;
        private BigDecimal specMin;
        private BigDecimal specMax;
        private BigDecimal measuredValue;
        private String result;

        public String getProcessType() { return processType; }
        public void setProcessType(String v) { this.processType = v; }
        public String getInspectionItem() { return inspectionItem; }
        public void setInspectionItem(String v) { this.inspectionItem = v; }
        public BigDecimal getSpecMin() { return specMin; }
        public void setSpecMin(BigDecimal v) { this.specMin = v; }
        public BigDecimal getSpecMax() { return specMax; }
        public void setSpecMax(BigDecimal v) { this.specMax = v; }
        public BigDecimal getMeasuredValue() { return measuredValue; }
        public void setMeasuredValue(BigDecimal v) { this.measuredValue = v; }
        public String getResult() { return result; }
        public void setResult(String v) { this.result = v; }
    }

    public DefectData getDefect() { return defect; }
    public void setDefect(DefectData v) { this.defect = v; }
    public InspectionData getInspection() { return inspection; }
    public void setInspection(InspectionData v) { this.inspection = v; }
}
