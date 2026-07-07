package com.battery.mes.common.initializer;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.springframework.stereotype.Component;

import com.battery.mes.domain.defect.Defect;
import com.battery.mes.domain.inspection.Inspection;
import com.battery.mes.domain.material.Bom;
import com.battery.mes.domain.material.Material;
import com.battery.mes.domain.spc.SpcData;
import com.battery.mes.mapper.defect.DefectMapper;
import com.battery.mes.mapper.inspection.InspectionMapper;
import com.battery.mes.mapper.material.MaterialMapper;
import com.battery.mes.mapper.spc.SpcMapper;

import org.springframework.context.annotation.DependsOn;
import jakarta.annotation.PostConstruct;

@Component
@DependsOn("sampleDataInitializer")
public class MesSampleDataInitializer {

    private final InspectionMapper inspectionMapper;
    private final DefectMapper defectMapper;
    private final SpcMapper spcMapper;
    private final MaterialMapper materialMapper;

    public MesSampleDataInitializer(InspectionMapper inspectionMapper, DefectMapper defectMapper,
                                     SpcMapper spcMapper, MaterialMapper materialMapper) {
        this.inspectionMapper = inspectionMapper;
        this.defectMapper = defectMapper;
        this.spcMapper = spcMapper;
        this.materialMapper = materialMapper;
    }

    @PostConstruct
    public void initialize() {
        seedMaterials();
        seedBoms();
        seedInspections();
        seedDefects();
        seedSpcData();
    }

    private void seedMaterials() {
        if (materialMapper.countMaterials() > 0) {
            return;
        }

        LocalDateTime base = LocalDateTime.now().minusDays(30);
        insertMaterial("MAT-UUID-0001", "MAT-CAM-001", "NCM 양극재",          "RAW",        bd("500.0000"),   "kg",  base);
        insertMaterial("MAT-UUID-0002", "MAT-ANO-001", "흑연 음극재",          "RAW",        bd("400.0000"),   "kg",  base.plusMinutes(1));
        insertMaterial("MAT-UUID-0003", "MAT-SEP-001", "폴리에틸렌 분리막",    "SEMI",       bd("1000.0000"),  "m",   base.plusMinutes(2));
        insertMaterial("MAT-UUID-0004", "MAT-ELY-001", "LiPF6 전해액",         "RAW",        bd("300.0000"),   "L",   base.plusMinutes(3));
        insertMaterial("MAT-UUID-0005", "MAT-CAN-001", "알루미늄 캔 21700",    "CONSUMABLE", bd("10000.0000"), "ea",  base.plusMinutes(4));
        insertMaterial("MAT-UUID-0006", "MAT-PCH-001", "알루미늄 파우치",      "CONSUMABLE", bd("5000.0000"),  "ea",  base.plusMinutes(5));
    }

    private void seedBoms() {
        if (materialMapper.countBoms(null) > 0) {
            return;
        }

        // CELL-21700-NCM (원통형 배터리)
        insertBom("BOM-UUID-0001", "CELL-21700-NCM", "MAT-UUID-0001", bd("0.0150"), "kg");
        insertBom("BOM-UUID-0002", "CELL-21700-NCM", "MAT-UUID-0002", bd("0.0080"), "kg");
        insertBom("BOM-UUID-0003", "CELL-21700-NCM", "MAT-UUID-0003", bd("0.5000"), "m");
        insertBom("BOM-UUID-0004", "CELL-21700-NCM", "MAT-UUID-0004", bd("0.0050"), "L");
        insertBom("BOM-UUID-0005", "CELL-21700-NCM", "MAT-UUID-0005", bd("1.0000"), "ea");

        // CELL-POUCH-NCM (파우치형 배터리)
        insertBom("BOM-UUID-0006", "CELL-POUCH-NCM", "MAT-UUID-0001", bd("0.0200"), "kg");
        insertBom("BOM-UUID-0007", "CELL-POUCH-NCM", "MAT-UUID-0002", bd("0.0120"), "kg");
        insertBom("BOM-UUID-0008", "CELL-POUCH-NCM", "MAT-UUID-0003", bd("0.8000"), "m");
        insertBom("BOM-UUID-0009", "CELL-POUCH-NCM", "MAT-UUID-0004", bd("0.0080"), "L");
        insertBom("BOM-UUID-0010", "CELL-POUCH-NCM", "MAT-UUID-0006", bd("1.0000"), "ea");
    }

    private void insertMaterial(String id, String matCode, String matName, String matType,
                                 BigDecimal stockQty, String unit, LocalDateTime createdAt) {
        Material m = new Material();
        m.setId(id);
        m.setMatCode(matCode);
        m.setMatName(matName);
        m.setMatType(matType);
        m.setStockQty(stockQty);
        m.setUnit(unit);
        m.setCreatedAt(createdAt);
        materialMapper.insertMaterial(m);
    }

    private void insertBom(String id, String productCode, String materialId,
                            BigDecimal qtyPerUnit, String unit) {
        Bom b = new Bom();
        b.setId(id);
        b.setProductCode(productCode);
        b.setMaterialId(materialId);
        b.setQtyPerUnit(qtyPerUnit);
        b.setUnit(unit);
        materialMapper.insertBom(b);
    }

    private void seedInspections() {
        if (inspectionMapper.countAll() > 0) {
            return;
        }

        LocalDateTime now = LocalDateTime.now();
        String inspectorId = SampleDataInitializer.INSPECTOR_ID;

        insertInspection("INSP-UUID-0001", "LOT-UUID-0001", "WO-UUID-0001", inspectorId,
                "IPQC", "전극 두께 검사", bd("75.0000"), bd("85.0000"), bd("80.2000"),
                "PASS", "A", "PASS", now.minusDays(3).withHour(11).withMinute(40), "전극 공정 후 두께 기준 만족", now);

        insertInspection("INSP-UUID-0002", "LOT-UUID-0001", "WO-UUID-0002", inspectorId,
                "IPQC", "조립 치수 검사", bd("99.5000"), bd("100.5000"), bd("100.1000"),
                "PASS", "A", "PENDING", now.minusDays(2).withHour(13).withMinute(30), "조립 중간검사 기준 만족", now);

        insertInspection("INSP-UUID-0003", "LOT-UUID-0002", "WO-UUID-0003", inspectorId,
                "IPQC", "전극 접착력 검사", bd("4.5000"), bd("6.0000"), bd("4.2000"),
                "FAIL", "C", "PENDING", now.minusDays(2).withHour(10).withMinute(55), "하한 기준 미달로 박리 의심", now);

        insertInspection("INSP-UUID-0004", "LOT-UUID-0002", "WO-UUID-0004", inspectorId,
                "OQC", "최종 외관 검사", bd("1.0000"), bd("1.0000"), bd("0.0000"),
                "FAIL", "C", "FAIL", now.minusDays(1).withHour(14).withMinute(50), "외관 검사 중 누액 의심품 발견", now);
    }

    private void seedDefects() {
        if (defectMapper.countAll() > 0) {
            return;
        }

        LocalDateTime now = LocalDateTime.now();

        insertDefect("DEF-UUID-0001", "INSP-UUID-0003", "DT-UUID-0001", "DELAM",
                "CRITICAL", "전극 접착력 기준 미달로 박리 불량 등록", now.minusDays(2).withHour(11).withMinute(5), now);

        insertDefect("DEF-UUID-0002", "INSP-UUID-0004", "DT-UUID-0003", "LEAK",
                "MAJOR", "최종 외관 검사 중 전해액 누액 의심 불량 등록", now.minusDays(1).withHour(15).withMinute(0), now);

        insertDefect("DEF-UUID-0003", "INSP-UUID-0004", "DT-UUID-0004", "OQCFAIL",
                "MINOR", "최종 검사 FAIL 판정 이력 등록", now.minusDays(1).withHour(15).withMinute(5), now);
    }

    private void seedSpcData() {
        if (spcMapper.countAll(null, null, null) > 0) {
            return;
        }

        LocalDateTime now = LocalDateTime.now();

        // 전극 두께 파라미터 (spec: 75~85μm, 목표 80μm)
        // UCL=83.0, CL=80.0, LCL=77.0 / USL=85.0, LSL=75.0 / Cp≈1.33, Cpk≈1.20
        Object[][] rows = {
            {"SPC-UUID-0001", 1, "79.8,80.2,80.1,79.9,80.0", "80.0000", "0.4000", now.minusDays(6).withHour(9).withMinute(0)},
            {"SPC-UUID-0002", 2, "80.3,79.7,80.4,80.1,80.0", "80.1000", "0.7000", now.minusDays(6).withHour(11).withMinute(0)},
            {"SPC-UUID-0003", 3, "79.9,80.1,80.2,79.8,80.0", "80.0000", "0.4000", now.minusDays(5).withHour(9).withMinute(0)},
            {"SPC-UUID-0004", 4, "80.5,80.2,80.3,80.1,80.4", "80.3000", "0.4000", now.minusDays(5).withHour(11).withMinute(0)},
            {"SPC-UUID-0005", 5, "79.6,79.8,80.0,79.7,79.9", "79.8000", "0.4000", now.minusDays(4).withHour(9).withMinute(0)},
            {"SPC-UUID-0006", 6, "80.1,80.3,80.0,80.2,80.4", "80.2000", "0.4000", now.minusDays(4).withHour(11).withMinute(0)},
            {"SPC-UUID-0007", 7, "80.6,80.1,80.3,80.5,80.0", "80.3000", "0.6000", now.minusDays(3).withHour(9).withMinute(0)},
            {"SPC-UUID-0008", 8, "79.5,79.8,80.1,79.9,79.7", "79.8000", "0.6000", now.minusDays(3).withHour(11).withMinute(0)},
            {"SPC-UUID-0009", 9, "80.2,80.0,80.3,80.1,80.4", "80.2000", "0.4000", now.minusDays(2).withHour(9).withMinute(0)},
            {"SPC-UUID-0010",10, "79.9,80.2,80.0,80.1,79.8", "80.0000", "0.4000", now.minusDays(1).withHour(9).withMinute(0)},
        };

        for (Object[] r : rows) {
            SpcData s = new SpcData();
            s.setId((String) r[0]);
            s.setLotId("LOT-UUID-0001");
            s.setWorkOrderId("WO-UUID-0001");
            s.setParameterName("전극 두께");
            s.setSubgroupNo((Integer) r[1]);
            s.setSampleValues((String) r[2]);
            s.setXBar(bd((String) r[3]));
            s.setRangeValue(bd((String) r[4]));
            s.setUcl(bd("83.0000"));
            s.setCl(bd("80.0000"));
            s.setLcl(bd("77.0000"));
            s.setUsl(bd("85.0000"));
            s.setLsl(bd("75.0000"));
            s.setCp(bd("1.3300"));
            s.setCpk(bd("1.2000"));
            s.setMeasuredAt((LocalDateTime) r[5]);
            spcMapper.insert(s);
        }
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
