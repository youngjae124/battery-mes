-- Sample seed data for PostgreSQL
-- Users are seeded by SampleDataInitializer at application startup

-- equipment
INSERT INTO equipment (id, eq_code, eq_name, eq_type, status) VALUES
('EQ-UUID-0001', 'EQ-MIX-001', '전극 믹싱기 1호',  'MIXER',               'RUNNING'),
('EQ-UUID-0002', 'EQ-ASM-001', '조립 라인 1호',    'ASSEMBLY_LINE',       'IDLE'),
('EQ-UUID-0003', 'EQ-ACT-001', '화성 챔버 1호',    'ACTIVATION_CHAMBER',  'IDLE'),
('EQ-UUID-0004', 'EQ-INS-001', '최종 검사기 1호',  'INSPECTION',          'IDLE')
ON CONFLICT (id) DO UPDATE SET
    eq_code  = EXCLUDED.eq_code,
    eq_name  = EXCLUDED.eq_name,
    eq_type  = EXCLUDED.eq_type,
    status   = EXCLUDED.status;

-- defect_types
INSERT INTO defect_types (id, code, name, category, description, is_active) VALUES
('DT-UUID-0001', 'DELAM',   'Delamination',          'ELECTRODE',   '전극 박리 불량',    'Y'),
('DT-UUID-0002', 'SHORT',   'Internal Short',         'ASSEMBLY',    '내부 단락 불량',    'Y'),
('DT-UUID-0003', 'LEAK',    'Electrolyte Leak',       'ACTIVATION',  '전해액 누액 불량',  'Y'),
('DT-UUID-0004', 'OQCFAIL', 'Final Inspection Fail',  'OQC',         '최종 검사 판정 불량','Y'),
(gen_random_uuid()::VARCHAR, 'DIM-001', '코팅 두께 초과', '치수불량', NULL, 'Y'),
(gen_random_uuid()::VARCHAR, 'DIM-002', '코팅 두께 미달', '치수불량', NULL, 'Y'),
(gen_random_uuid()::VARCHAR, 'ELC-001', '용량 부족',      '전기불량', NULL, 'Y'),
(gen_random_uuid()::VARCHAR, 'ELC-002', '충전전류 이탈',  '전기불량', NULL, 'Y'),
(gen_random_uuid()::VARCHAR, 'VIS-001', '표면 스크래치',  '외관불량', NULL, 'Y'),
(gen_random_uuid()::VARCHAR, 'VIS-002', '이물 혼입',      '외관불량', NULL, 'Y'),
(gen_random_uuid()::VARCHAR, 'CHM-001', '전해액 누액',    '화학불량', NULL, 'Y')
ON CONFLICT (code) DO NOTHING;

-- lots
INSERT INTO lots (id, lot_number, product_name, quantity, status, created_at, updated_at) VALUES
('LOT-UUID-0001', 'LOT-20260413-001', '21700 CELL - NCM', 1000, 'IN_PROGRESS', NOW(), NOW()),
('LOT-UUID-0002', 'LOT-20260413-002', '21700 CELL - LFP',  800, 'HOLD',        NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
    lot_number   = EXCLUDED.lot_number,
    product_name = EXCLUDED.product_name,
    quantity     = EXCLUDED.quantity,
    status       = EXCLUDED.status,
    updated_at   = NOW();

-- work_orders
INSERT INTO work_orders (id, wo_number, lot_id, equipment_id, process_type, status, target_qty, actual_qty, planned_start, actual_start, actual_end) VALUES
('WO-UUID-0001', 'WO-EL-001', 'LOT-UUID-0001', 'EQ-UUID-0001', '전극', 'DONE',    1000, 1000, '2026-04-13 08:00:00'::TIMESTAMP, '2026-04-13 08:05:00'::TIMESTAMP, '2026-04-13 11:20:00'::TIMESTAMP),
('WO-UUID-0002', 'WO-AS-001', 'LOT-UUID-0001', 'EQ-UUID-0002', '조립', 'RUNNING', 1000,  620, '2026-04-13 12:00:00'::TIMESTAMP, '2026-04-13 12:10:00'::TIMESTAMP, NULL),
('WO-UUID-0003', 'WO-EL-002', 'LOT-UUID-0002', 'EQ-UUID-0001', '전극', 'DONE',     800,  800, '2026-04-12 08:00:00'::TIMESTAMP, '2026-04-12 08:03:00'::TIMESTAMP, '2026-04-12 10:40:00'::TIMESTAMP),
('WO-UUID-0004', 'WO-AS-002', 'LOT-UUID-0002', 'EQ-UUID-0002', '조립', 'DONE',     800,  790, '2026-04-12 11:00:00'::TIMESTAMP, '2026-04-12 11:05:00'::TIMESTAMP, '2026-04-12 14:25:00'::TIMESTAMP)
ON CONFLICT (id) DO UPDATE SET
    wo_number    = EXCLUDED.wo_number,
    lot_id       = EXCLUDED.lot_id,
    equipment_id = EXCLUDED.equipment_id,
    process_type = EXCLUDED.process_type,
    status       = EXCLUDED.status,
    target_qty   = EXCLUDED.target_qty,
    actual_qty   = EXCLUDED.actual_qty,
    planned_start = EXCLUDED.planned_start,
    actual_start  = EXCLUDED.actual_start,
    actual_end    = EXCLUDED.actual_end;

-- inspections/defects: seeded by MesSampleDataInitializer at application startup (after users are created)
