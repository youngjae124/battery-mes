-- UUID 확장
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. users
CREATE TABLE IF NOT EXISTS users (
    id          VARCHAR(36)  NOT NULL DEFAULT gen_random_uuid()::VARCHAR,
    email       VARCHAR(255) NOT NULL,
    password    VARCHAR(255) NOT NULL,
    name        VARCHAR(100) NOT NULL,
    role        VARCHAR(20)  NOT NULL CHECK (role IN ('ADMIN','OPERATOR','INSPECTOR')),
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    CONSTRAINT pk_users PRIMARY KEY (id),
    CONSTRAINT uq_users_email UNIQUE (email)
);

-- 2. equipment
CREATE TABLE IF NOT EXISTS equipment (
    id          VARCHAR(36)  NOT NULL DEFAULT gen_random_uuid()::VARCHAR,
    eq_code     VARCHAR(50)  NOT NULL,
    eq_name     VARCHAR(200) NOT NULL,
    eq_type     VARCHAR(50)  NOT NULL,
    status      VARCHAR(20)  NOT NULL DEFAULT 'IDLE'
                CHECK (status IN ('RUNNING','IDLE','DOWN','PM')),
    last_pm_at  TIMESTAMP,
    CONSTRAINT pk_equipment PRIMARY KEY (id),
    CONSTRAINT uq_equipment_code UNIQUE (eq_code)
);

-- 3. equipment_logs
CREATE TABLE IF NOT EXISTS equipment_logs (
    id           VARCHAR(36) NOT NULL DEFAULT gen_random_uuid()::VARCHAR,
    equipment_id VARCHAR(36) NOT NULL,
    log_type     VARCHAR(20) NOT NULL CHECK (log_type IN ('BREAKDOWN','PM','ALERT')),
    description  TEXT        NOT NULL,
    occurred_at  TIMESTAMP   NOT NULL DEFAULT NOW(),
    reported_by  VARCHAR(36) NOT NULL,
    CONSTRAINT pk_equipment_logs PRIMARY KEY (id),
    CONSTRAINT fk_eqlogs_equipment FOREIGN KEY (equipment_id) REFERENCES equipment(id),
    CONSTRAINT fk_eqlogs_user      FOREIGN KEY (reported_by)  REFERENCES users(id)
);

-- 4. materials
CREATE TABLE IF NOT EXISTS materials (
    id        VARCHAR(36)   NOT NULL DEFAULT gen_random_uuid()::VARCHAR,
    mat_code  VARCHAR(50)   NOT NULL,
    mat_name  VARCHAR(200)  NOT NULL,
    mat_type  VARCHAR(20)   NOT NULL CHECK (mat_type IN ('RAW','SEMI','CONSUMABLE')),
    stock_qty NUMERIC(15,4) NOT NULL DEFAULT 0,
    unit      VARCHAR(20)   NOT NULL,
    CONSTRAINT pk_materials PRIMARY KEY (id),
    CONSTRAINT uq_materials_code UNIQUE (mat_code)
);

-- 5. bom
CREATE TABLE IF NOT EXISTS bom (
    id            VARCHAR(36)   NOT NULL DEFAULT gen_random_uuid()::VARCHAR,
    product_code  VARCHAR(50)   NOT NULL,
    material_id   VARCHAR(36)   NOT NULL,
    qty_per_unit  NUMERIC(15,4) NOT NULL,
    unit          VARCHAR(20)   NOT NULL,
    CONSTRAINT pk_bom PRIMARY KEY (id),
    CONSTRAINT fk_bom_material FOREIGN KEY (material_id) REFERENCES materials(id)
);

-- 6. lots
CREATE TABLE IF NOT EXISTS lots (
    id           VARCHAR(36)  NOT NULL DEFAULT gen_random_uuid()::VARCHAR,
    lot_number   VARCHAR(50)  NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    quantity     NUMERIC(10)  NOT NULL,
    status       VARCHAR(20)  NOT NULL DEFAULT 'IN_PROGRESS'
                 CHECK (status IN ('IN_PROGRESS','COMPLETED','HOLD')),
    created_at   TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMP    NOT NULL DEFAULT NOW(),
    CONSTRAINT pk_lots PRIMARY KEY (id),
    CONSTRAINT uq_lots_number UNIQUE (lot_number)
);

-- 7. work_orders
CREATE TABLE IF NOT EXISTS work_orders (
    id            VARCHAR(36) NOT NULL DEFAULT gen_random_uuid()::VARCHAR,
    wo_number     VARCHAR(50) NOT NULL,
    lot_id        VARCHAR(36) NOT NULL,
    equipment_id  VARCHAR(36) NOT NULL,
    process_type  VARCHAR(20) NOT NULL CHECK (process_type IN ('전극','조립','화성','검사')),
    status        VARCHAR(20) NOT NULL DEFAULT 'PLANNED'
                  CHECK (status IN ('PLANNED','RUNNING','DONE','HOLD')),
    target_qty    NUMERIC(10) NOT NULL,
    actual_qty    NUMERIC(10) NOT NULL DEFAULT 0,
    planned_start TIMESTAMP   NOT NULL,
    actual_start  TIMESTAMP,
    actual_end    TIMESTAMP,
    CONSTRAINT pk_work_orders PRIMARY KEY (id),
    CONSTRAINT uq_work_orders_number UNIQUE (wo_number),
    CONSTRAINT fk_wo_lot       FOREIGN KEY (lot_id)       REFERENCES lots(id),
    CONSTRAINT fk_wo_equipment FOREIGN KEY (equipment_id) REFERENCES equipment(id)
);

-- 8. work_assignments
CREATE TABLE IF NOT EXISTS work_assignments (
    id            VARCHAR(36) NOT NULL DEFAULT gen_random_uuid()::VARCHAR,
    work_order_id VARCHAR(36) NOT NULL,
    user_id       VARCHAR(36) NOT NULL,
    role          VARCHAR(20) NOT NULL CHECK (role IN ('OPERATOR','LEADER','INSPECTOR')),
    start_at      TIMESTAMP   NOT NULL DEFAULT NOW(),
    end_at        TIMESTAMP,
    CONSTRAINT pk_work_assignments PRIMARY KEY (id),
    CONSTRAINT fk_wa_work_order FOREIGN KEY (work_order_id) REFERENCES work_orders(id),
    CONSTRAINT fk_wa_user       FOREIGN KEY (user_id)       REFERENCES users(id)
);

-- 9. process_params
CREATE TABLE IF NOT EXISTS process_params (
    id            VARCHAR(36)   NOT NULL DEFAULT gen_random_uuid()::VARCHAR,
    work_order_id VARCHAR(36)   NOT NULL,
    param_name    VARCHAR(100)  NOT NULL,
    target_value  NUMERIC(10,4),
    actual_value  NUMERIC(10,4) NOT NULL,
    unit          VARCHAR(20)   NOT NULL,
    upper_limit   NUMERIC(10,4),
    lower_limit   NUMERIC(10,4),
    measured_at   TIMESTAMP     NOT NULL DEFAULT NOW(),
    CONSTRAINT pk_process_params PRIMARY KEY (id),
    CONSTRAINT fk_pp_work_order FOREIGN KEY (work_order_id) REFERENCES work_orders(id)
);

-- 10. inspections
CREATE TABLE IF NOT EXISTS inspections (
    id              VARCHAR(36)   NOT NULL DEFAULT gen_random_uuid()::VARCHAR,
    lot_id          VARCHAR(36)   NOT NULL,
    work_order_id   VARCHAR(36),
    inspector_id    VARCHAR(36)   NOT NULL,
    process_type    VARCHAR(20)   NOT NULL CHECK (process_type IN ('IQC','IPQC','OQC')),
    inspection_item VARCHAR(200)  NOT NULL,
    spec_min        NUMERIC(10,4),
    spec_max        NUMERIC(10,4),
    measured_value  NUMERIC(10,4) NOT NULL,
    result          VARCHAR(10)   NOT NULL CHECK (result IN ('PASS','FAIL')),
    grade           VARCHAR(2)    CHECK (grade IN ('A','B','C')),
    aging_status    VARCHAR(20)   CHECK (aging_status IN ('PASS','FAIL','PENDING')),
    inspected_at    TIMESTAMP     NOT NULL DEFAULT NOW(),
    remarks         TEXT,
    is_deleted      CHAR(1)       NOT NULL DEFAULT 'N' CHECK (is_deleted IN ('Y','N')),
    created_at      TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP     NOT NULL DEFAULT NOW(),
    CONSTRAINT pk_inspections PRIMARY KEY (id),
    CONSTRAINT fk_insp_lot        FOREIGN KEY (lot_id)        REFERENCES lots(id),
    CONSTRAINT fk_insp_work_order FOREIGN KEY (work_order_id) REFERENCES work_orders(id),
    CONSTRAINT fk_insp_inspector  FOREIGN KEY (inspector_id)  REFERENCES users(id)
);

-- 11. defect_types
CREATE TABLE IF NOT EXISTS defect_types (
    id          VARCHAR(36)  NOT NULL DEFAULT gen_random_uuid()::VARCHAR,
    code        VARCHAR(20)  NOT NULL,
    name        VARCHAR(100) NOT NULL,
    category    VARCHAR(50)  NOT NULL,
    description TEXT,
    is_active   CHAR(1)      NOT NULL DEFAULT 'Y' CHECK (is_active IN ('Y','N')),
    CONSTRAINT pk_defect_types PRIMARY KEY (id),
    CONSTRAINT uq_defect_types_code UNIQUE (code)
);

-- 12. defects
CREATE TABLE IF NOT EXISTS defects (
    id             VARCHAR(36) NOT NULL DEFAULT gen_random_uuid()::VARCHAR,
    inspection_id  VARCHAR(36) NOT NULL,
    defect_type_id VARCHAR(36) NOT NULL,
    defect_code    VARCHAR(20) NOT NULL,
    severity       VARCHAR(20) NOT NULL CHECK (severity IN ('CRITICAL','MAJOR','MINOR')),
    description    TEXT,
    created_at     TIMESTAMP   NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMP,
    CONSTRAINT pk_defects PRIMARY KEY (id),
    CONSTRAINT fk_defects_inspection  FOREIGN KEY (inspection_id)  REFERENCES inspections(id),
    CONSTRAINT fk_defects_defect_type FOREIGN KEY (defect_type_id) REFERENCES defect_types(id)
);

-- 13. spc_data
CREATE TABLE IF NOT EXISTS spc_data (
    id             VARCHAR(36)   NOT NULL DEFAULT gen_random_uuid()::VARCHAR,
    lot_id         VARCHAR(36)   NOT NULL,
    work_order_id  VARCHAR(36),
    parameter_name VARCHAR(100)  NOT NULL,
    subgroup_no    NUMERIC(10)   NOT NULL,
    sample_values  TEXT          NOT NULL,
    x_bar          NUMERIC(10,4),
    range_value    NUMERIC(10,4),
    ucl            NUMERIC(10,4),
    cl             NUMERIC(10,4),
    lcl            NUMERIC(10,4),
    usl            NUMERIC(10,4),
    lsl            NUMERIC(10,4),
    cp             NUMERIC(10,4),
    cpk            NUMERIC(10,4),
    measured_at    TIMESTAMP     NOT NULL DEFAULT NOW(),
    CONSTRAINT pk_spc_data PRIMARY KEY (id),
    CONSTRAINT fk_spc_lot        FOREIGN KEY (lot_id)        REFERENCES lots(id),
    CONSTRAINT fk_spc_work_order FOREIGN KEY (work_order_id) REFERENCES work_orders(id)
);

-- 14. audit_trail
CREATE TABLE IF NOT EXISTS audit_trail (
    id          VARCHAR(36)  NOT NULL DEFAULT gen_random_uuid()::VARCHAR,
    table_name  VARCHAR(100) NOT NULL,
    record_id   VARCHAR(36)  NOT NULL,
    action_type VARCHAR(20)  NOT NULL CHECK (action_type IN ('INSERT','UPDATE','DELETE')),
    before_data TEXT,
    after_data  TEXT,
    changed_by  VARCHAR(36)  NOT NULL,
    changed_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    CONSTRAINT pk_audit_trail PRIMARY KEY (id),
    CONSTRAINT fk_audit_user FOREIGN KEY (changed_by) REFERENCES users(id)
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_lots_status          ON lots(status);
CREATE INDEX IF NOT EXISTS idx_wo_lot_id            ON work_orders(lot_id);
CREATE INDEX IF NOT EXISTS idx_wo_status            ON work_orders(status);
CREATE INDEX IF NOT EXISTS idx_insp_lot_id          ON inspections(lot_id);
CREATE INDEX IF NOT EXISTS idx_insp_result          ON inspections(result);
CREATE INDEX IF NOT EXISTS idx_insp_is_deleted      ON inspections(is_deleted);
CREATE INDEX IF NOT EXISTS idx_defects_severity     ON defects(severity);
CREATE INDEX IF NOT EXISTS idx_spc_lot_id           ON spc_data(lot_id);
CREATE INDEX IF NOT EXISTS idx_audit_table_name     ON audit_trail(table_name);
CREATE INDEX IF NOT EXISTS idx_eqlogs_equipment_id  ON equipment_logs(equipment_id);

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION fn_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

CREATE TRIGGER trg_lots_updated_at
    BEFORE UPDATE ON lots
    FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

CREATE TRIGGER trg_inspections_updated_at
    BEFORE UPDATE ON inspections
    FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();
