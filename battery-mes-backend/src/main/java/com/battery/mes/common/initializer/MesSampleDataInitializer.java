package com.battery.mes.common.initializer;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.springframework.stereotype.Component;

import com.battery.mes.domain.defect.Defect;
import com.battery.mes.domain.inspection.Inspection;
import com.battery.mes.mapper.defect.DefectMapper;
import com.battery.mes.mapper.inspection.InspectionMapper;

import jakarta.annotation.PostConstruct;

@Component
public class MesSampleDataInitializer {

    private final InspectionMapper inspectionMapper;
    private final DefectMapper defectMapper;

    public MesSampleDataInitializer(InspectionMapper inspectionMapper, DefectMapper defectMapper) {
        this.inspectionMapper = inspectionMapper;
        this.defectMapper = defectMapper;
    }

    @PostConstruct
    public void initialize() {
        seedInspections();
        seedDefects();
    }

    private void seedInspections() {
        if (inspectionMapper.countAll() > 0) {
            return;
        }

        LocalDateTime now = LocalDateTime.now();
        String inspectorId = SampleDataInitializer.INSPECTOR_ID;

        insertInspection("INSP-UUID-0001", "LOT-UUID-0001", "WO-UUID-0001", inspectorId,
                "IPQC", "전극 두께 검사", bd("75.0000"), bd("85.0000"), bd("80.2000"),
                "PASS", "A", "PASS", LocalDateTime.of(2026, 4, 13, 11, 40), "전극 공정 후 두께 기준 만족", now);

        insertInspection("INSP-UUID-0002", "LOT-UUID-0001", "WO-UUID-0002", inspectorId,
                "IPQC", "조립 치수 검사", bd("99.5000"), bd("100.5000"), bd("100.1000"),
                "PASS", "A", "PENDING", LocalDateTime.of(2026, 4, 13, 13, 30), "조립 중간검사 기준 만족", now);

        insertInspection("INSP-UUID-0003", "LOT-UUID-0002", "WO-UUID-0003", inspectorId,
                "IPQC", "전극 접착력 검사", bd("4.5000"), bd("6.0000"), bd("4.2000"),
                "FAIL", "C", "PENDING", LocalDateTime.of(2026, 4, 12, 10, 55), "하한 기준 미달로 박리 의심", now);

        insertInspection("INSP-UUID-0004", "LOT-UUID-0002", "WO-UUID-0004", inspectorId,
                "OQC", "최종 외관 검사", bd("1.0000"), bd("1.0000"), bd("0.0000"),
                "FAIL", "C", "FAIL", LocalDateTime.of(2026, 4, 12, 14, 50), "외관 검사 중 누액 의심품 발견", now);
    }

    private void seedDefects() {
        if (defectMapper.countAll() > 0) {
            return;
        }

        LocalDateTime now = LocalDateTime.now();

        insertDefect("DEF-UUID-0001", "INSP-UUID-0003", "DT-UUID-0001", "DELAM",
                "CRITICAL", "전극 접착력 기준 미달로 박리 불량 등록", LocalDateTime.of(2026, 4, 12, 11, 5), now);

        insertDefect("DEF-UUID-0002", "INSP-UUID-0004", "DT-UUID-0003", "LEAK",
                "MAJOR", "최종 외관 검사 중 전해액 누액 의심 불량 등록", LocalDateTime.of(2026, 4, 12, 15, 0), now);

        insertDefect("DEF-UUID-0003", "INSP-UUID-0004", "DT-UUID-0004", "OQCFAIL",
                "MINOR", "최종 검사 FAIL 판정 이력 등록", LocalDateTime.of(2026, 4, 12, 15, 5), now);
    }

    private void insertInspection(String id, String lotId, String workOrderId, String inspectorId,
                                   String processType, String inspectionItem,
                                   BigDecimal specMin, BigDecimal specMax, BigDecimal measuredValue,
                                   String result, String grade, String agingStatus,
                                   LocalDateTime inspectedAt, String remarks, LocalDateTime now) {
        Inspection inspection = new Inspection();
        inspection.setId(id);
        inspection.setLotId(lotId);
        inspection.setWorkOrderId(workOrderId);
        inspection.setInspectorId(inspectorId);
        inspection.setProcessType(processType);
        inspection.setInspectionItem(inspectionItem);
        inspection.setSpecMin(specMin);
        inspection.setSpecMax(specMax);
        inspection.setMeasuredValue(measuredValue);
        inspection.setResult(result);
        inspection.setGrade(grade);
        inspection.setAgingStatus(agingStatus);
        inspection.setInspectedAt(inspectedAt);
        inspection.setRemarks(remarks);
        inspection.setIsDeleted("N");
        inspection.setCreatedAt(now);
        inspection.setUpdatedAt(now);
        inspectionMapper.insert(inspection);
    }

    private void insertDefect(String id, String inspectionId, String defectTypeId,
                               String defectCode, String severity, String description,
                               LocalDateTime createdAt, LocalDateTime updatedAt) {
        Defect defect = new Defect();
        defect.setId(id);
        defect.setInspectionId(inspectionId);
        defect.setDefectTypeId(defectTypeId);
        defect.setDefectCode(defectCode);
        defect.setSeverity(severity);
        defect.setDescription(description);
        defect.setCreatedAt(createdAt);
        defect.setUpdatedAt(updatedAt);
        defectMapper.insert(defect);
    }

    private BigDecimal bd(String val) {
        return new BigDecimal(val);
    }
}
