-- Sample master and test data for manual Oracle execution.
-- Users are seeded by SampleDataInitializer at application startup.
CONNECT scott/tiger@//localhost:1521/XEPDB1

MERGE INTO equipment t
USING (
    SELECT 'EQ-UUID-0001' AS id, 'EQ-MIX-001' AS eq_code, '전극 믹싱기 1호' AS eq_name, 'MIXER' AS eq_type, 'RUNNING' AS status FROM dual
    UNION ALL
    SELECT 'EQ-UUID-0002', 'EQ-ASM-001', '조립 라인 1호', 'ASSEMBLY_LINE', 'IDLE' FROM dual
    UNION ALL
    SELECT 'EQ-UUID-0003', 'EQ-ACT-001', '화성 챔버 1호', 'ACTIVATION_CHAMBER', 'IDLE' FROM dual
    UNION ALL
    SELECT 'EQ-UUID-0004', 'EQ-INS-001', '최종 검사기 1호', 'INSPECTION', 'IDLE' FROM dual
) s
ON (t.id = s.id)
WHEN MATCHED THEN
    UPDATE SET
        t.eq_code = s.eq_code,
        t.eq_name = s.eq_name,
        t.eq_type = s.eq_type,
        t.status = s.status
WHEN NOT MATCHED THEN
    INSERT (id, eq_code, eq_name, eq_type, status)
    VALUES (s.id, s.eq_code, s.eq_name, s.eq_type, s.status);

MERGE INTO defect_types t
USING (
    SELECT 'DT-UUID-0001' AS id, 'DELAM' AS code, 'Delamination' AS name, 'ELECTRODE' AS category, '전극 박리 불량' AS description FROM dual
    UNION ALL
    SELECT 'DT-UUID-0002', 'SHORT', 'Internal Short', 'ASSEMBLY', '내부 단락 불량' FROM dual
    UNION ALL
    SELECT 'DT-UUID-0003', 'LEAK', 'Electrolyte Leak', 'ACTIVATION', '전해액 누액 불량' FROM dual
    UNION ALL
    SELECT 'DT-UUID-0004', 'OQCFAIL', 'Final Inspection Fail', 'OQC', '최종 검사 판정 불량' FROM dual
) s
ON (t.id = s.id)
WHEN MATCHED THEN
    UPDATE SET
        t.code = s.code,
        t.name = s.name,
        t.category = s.category,
        t.description = s.description,
        t.is_active = 'Y'
WHEN NOT MATCHED THEN
    INSERT (id, code, name, category, description, is_active)
    VALUES (s.id, s.code, s.name, s.category, s.description, 'Y');

MERGE INTO lots t
USING (
    SELECT 'LOT-UUID-0001' AS id, 'LOT-20260413-001' AS lot_number, '21700 CELL - NCM' AS product_name, 1000 AS quantity, 'IN_PROGRESS' AS status FROM dual
    UNION ALL
    SELECT 'LOT-UUID-0002', 'LOT-20260413-002', '21700 CELL - LFP', 800, 'HOLD' FROM dual
) s
ON (t.id = s.id)
WHEN MATCHED THEN
    UPDATE SET
        t.lot_number = s.lot_number,
        t.product_name = s.product_name,
        t.quantity = s.quantity,
        t.status = s.status,
        t.updated_at = SYSTIMESTAMP
WHEN NOT MATCHED THEN
    INSERT (id, lot_number, product_name, quantity, status, created_at, updated_at)
    VALUES (s.id, s.lot_number, s.product_name, s.quantity, s.status, SYSTIMESTAMP, SYSTIMESTAMP);

MERGE INTO work_orders t
USING (
    SELECT 'WO-UUID-0001' AS id, 'WO-EL-001' AS wo_number, 'LOT-UUID-0001' AS lot_id, 'EQ-UUID-0001' AS equipment_id,
           '전극' AS process_type, 'DONE' AS status, 1000 AS target_qty, 1000 AS actual_qty,
           TIMESTAMP '2026-04-13 08:00:00' AS planned_start,
           TIMESTAMP '2026-04-13 08:05:00' AS actual_start,
           TIMESTAMP '2026-04-13 11:20:00' AS actual_end
    FROM dual
    UNION ALL
    SELECT 'WO-UUID-0002', 'WO-AS-001', 'LOT-UUID-0001', 'EQ-UUID-0002',
           '조립', 'RUNNING', 1000, 620,
           TIMESTAMP '2026-04-13 12:00:00',
           TIMESTAMP '2026-04-13 12:10:00',
           CAST(NULL AS TIMESTAMP)
    FROM dual
    UNION ALL
    SELECT 'WO-UUID-0003', 'WO-EL-002', 'LOT-UUID-0002', 'EQ-UUID-0001',
           '전극', 'DONE', 800, 800,
           TIMESTAMP '2026-04-12 08:00:00',
           TIMESTAMP '2026-04-12 08:03:00',
           TIMESTAMP '2026-04-12 10:40:00'
    FROM dual
    UNION ALL
    SELECT 'WO-UUID-0004', 'WO-AS-002', 'LOT-UUID-0002', 'EQ-UUID-0002',
           '조립', 'DONE', 800, 790,
           TIMESTAMP '2026-04-12 11:00:00',
           TIMESTAMP '2026-04-12 11:05:00',
           TIMESTAMP '2026-04-12 14:25:00'
    FROM dual
) s
ON (t.id = s.id)
WHEN MATCHED THEN
    UPDATE SET
        t.wo_number = s.wo_number,
        t.lot_id = s.lot_id,
        t.equipment_id = s.equipment_id,
        t.process_type = s.process_type,
        t.status = s.status,
        t.target_qty = s.target_qty,
        t.actual_qty = s.actual_qty,
        t.planned_start = s.planned_start,
        t.actual_start = s.actual_start,
        t.actual_end = s.actual_end
WHEN NOT MATCHED THEN
    INSERT (
        id,
        wo_number,
        lot_id,
        equipment_id,
        process_type,
        status,
        target_qty,
        actual_qty,
        planned_start,
        actual_start,
        actual_end
    ) VALUES (
        s.id,
        s.wo_number,
        s.lot_id,
        s.equipment_id,
        s.process_type,
        s.status,
        s.target_qty,
        s.actual_qty,
        s.planned_start,
        s.actual_start,
        s.actual_end
    );


-- inspections/defects: seeded by MesSampleDataInitializer at application startup (after users are created)

COMMIT;
