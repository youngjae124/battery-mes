package com.battery.mes.dto.analysis;

public class PythonDefectImageRequestDto {

    private String image_base64;
    private ImageContext context;

    public static class ImageContext {
        private String severity;
        private String defectCode;
        private String processType;

        public String getSeverity() { return severity; }
        public void setSeverity(String v) { this.severity = v; }
        public String getDefectCode() { return defectCode; }
        public void setDefectCode(String v) { this.defectCode = v; }
        public String getProcessType() { return processType; }
        public void setProcessType(String v) { this.processType = v; }
    }

    public String getImage_base64() { return image_base64; }
    public void setImage_base64(String v) { this.image_base64 = v; }
    public ImageContext getContext() { return context; }
    public void setContext(ImageContext v) { this.context = v; }
}
