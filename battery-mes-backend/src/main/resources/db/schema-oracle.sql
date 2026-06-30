CREATE TABLE users (
    id VARCHAR2(36) PRIMARY KEY,
    email VARCHAR2(255) NOT NULL UNIQUE,
    password VARCHAR2(255) NOT NULL,
    name VARCHAR2(100) NOT NULL,
    role VARCHAR2(20) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT ck_users_role CHECK (role IN ('ADMIN', 'OPERATOR', 'INSPECTOR'))
);

CREATE TABLE equipment (
    id VARCHAR2(36) PRIMARY KEY,
    eq_code VARCHAR2(50) NOT NULL UNIQUE,
    eq_name VARCHAR2(200) NOT NULL,
    eq_type VARCHAR2(50) NOT NULL,
    status VARCHAR2(20) NOT NULL,
    last_pm_at TIMESTAMP,
    CONSTRAINT ck_equipment_status CHECK (status IN ('RUNNING', 'IDLE', 'DOWN', 'PM'))
);

CREATE TABLE materials (
    id VARCHAR2(36) PRIMARY KEY,
    mat_code VARCHAR2(50) NOT NULL UNIQUE,
    mat_name VARCHAR2(200) NOT NULL,
    mat_type VARCHAR2(20) NOT NULL,
    stock_qty NUMBER(15,4) NOT NULL,
    unit VARCHAR2(20) NOT NULL,
    CONSTRAINT ck_materials_type CHECK (mat_type IN ('RAW', 'SEMI', 'CONSUMABLE'))
);

CREATE TABLE lots (
    id VARCHAR2(36) PRIMARY KEY,
    lot_number VARCHAR2(50) NOT NULL UNIQUE,
    product_name VARCHAR2(200) NOT NULL,
    quantity NUMBER(10) NOT NULL,
    status VARCHAR2(20) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT ck_lots_status CHECK (status IN ('IN_PROGRESS', 'COMPLETED', 'HOLD'))
);

CREATE TABLE work_orders (
    id VARCHAR2(36) PRIMARY KEY,
    wo_number VARCHAR2(50) NOT NULL UNIQUE,
    lot_id VARCHAR2(36) NOT NULL,
    equipment_id VARCHAR2(36) NOT NULL,
    process_type VARCHAR2(20) NOT NULL,
    status VARCHAR2(20) NOT NULL,
    target_qty NUMBER(10) NOT NULL,
    actual_qty NUMBER(10) NOT NULL,
    planned_start TIMESTAMP NOT NULL,
    actual_start TIMESTAMP,
    actual_end TIMESTAMP,
    CONSTRAINT fk_work_orders_lot FOREIGN KEY (lot_id) REFERENCES lots(id),
    CONSTRAINT fk_work_orders_equipment FOREIGN KEY (equipment_id) REFERENCES equipment(id),
    CONSTRAINT ck_work_orders_process_type CHECK (process_type IN ('전극', '조립', '화성', '검사')),
    CONSTRAINT ck_work_orders_status CHECK (status IN ('PLANNED', 'RUNNING', 'DONE', 'HOLD'))
);

CREATE TABLE work_assignments (
    id VARCHAR2(36) PRIMARY KEY,
    work_order_id VARCHAR2(36) NOT NULL,
    user_id VARCHAR2(36) NOT NULL,
    role VARCHAR2(20) NOT NULL,
    start_at TIMESTAMP NOT NULL,
    end_at TIMESTAMP,
    CONSTRAINT fk_work_assignments_work_order FOREIGN KEY (work_order_id) REFERENCES work_orders(id),
    CONSTRAINT fk_work_assignments_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT ck_work_assignments_role CHECK (role IN ('OPERATOR', 'LEADER', 'INSPECTOR'))
);

CREATE TABLE equipment_logs (
    id VARCHAR2(36) PRIMARY KEY,
    equipment_id VARCHAR2(36) NOT NULL,
    log_type VARCHAR2(20) NOT NULL,
    description CLOB NOT NULL,
    occurred_at TIMESTAMP NOT NULL,
    reported_by VARCHAR2(36) NOT NULL,
    CONSTRAINT fk_equipment_logs_equipment FOREIGN KEY (equipment_id) REFERENCES equipment(id),
    CONSTRAINT fk_equipment_logs_reported_by FOREIGN KEY (reported_by) REFERENCES users(id),
    CONSTRAINT ck_equipment_logs_type CHECK (log_type IN ('BREAKDOWN', 'PM', 'ALERT'))
);

CREATE TABLE bom (
    id VARCHAR2(36) PRIMARY KEY,
    product_code VARCHAR2(50) NOT NULL,
    material_id VARCHAR2(36) NOT NULL,
    qty_per_unit NUMBER(15,4) NOT NULL,
    unit VARCHAR2(20) NOT NULL,
    CONSTRAINT fk_bom_material FOREIGN KEY (material_id) REFERENCES materials(id)
);

CREATE TABLE process_params (
    id VARCHAR2(36) PRIMARY KEY,
    work_order_id VARCHAR2(36) NOT NULL,
    param_name VARCHAR2(100) NOT NULL,
    target_value NUMBER(10,4),
    actual_value NUMBER(10,4) NOT NULL,
    unit VARCHAR2(20) NOT NULL,
    upper_limit NUMBER(10,4),
    lower_limit NUMBER(10,4),
    measured_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_process_params_work_order FOREIGN KEY (work_order_id) REFERENCES work_orders(id)
);

CREATE TABLE inspections (
    id VARCHAR2(36) PRIMARY KEY,
    lot_id VARCHAR2(36) NOT NULL,
    work_order_id VARCHAR2(36),
    inspector_id VARCHAR2(36) NOT NULL,
    process_type VARCHAR2(20) NOT NULL,
    inspection_item VARCHAR2(200) NOT NULL,
    spec_min NUMBER(10,4),
    spec_max NUMBER(10,4),
    measured_value NUMBER(10,4) NOT NULL,
    result VARCHAR2(10) NOT NULL,
    grade VARCHAR2(2),
    aging_status VARCHAR2(20),
    inspected_at TIMESTAMP NOT NULL,
    remarks CLOB,
    is_deleted CHAR(1) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_inspections_lot FOREIGN KEY (lot_id) REFERENCES lots(id),
    CONSTRAINT fk_inspections_work_order FOREIGN KEY (work_order_id) REFERENCES work_orders(id),
    CONSTRAINT fk_inspections_inspector FOREIGN KEY (inspector_id) REFERENCES users(id),
    CONSTRAINT ck_inspections_process_type CHECK (process_type IN ('IQC', 'IPQC', 'OQC')),
    CONSTRAINT ck_inspections_result CHECK (result IN ('PASS', 'FAIL')),
    CONSTRAINT ck_inspections_aging_status CHECK (aging_status IN ('PASS', 'FAIL', 'PENDING')),
    CONSTRAINT ck_inspections_is_deleted CHECK (is_deleted IN ('Y', 'N'))
);

CREATE TABLE defect_types (
    id VARCHAR2(36) PRIMARY KEY,
    code VARCHAR2(20) NOT NULL UNIQUE,
    name VARCHAR2(100) NOT NULL,
    category VARCHAR2(50) NOT NULL,
    description CLOB,
    is_active CHAR(1) NOT NULL,
    CONSTRAINT ck_defect_types_active CHECK (is_active IN ('Y', 'N'))
);

CREATE TABLE defects (
    id VARCHAR2(36) PRIMARY KEY,
    inspection_id VARCHAR2(36) NOT NULL,
    defect_type_id VARCHAR2(36) NOT NULL,
    defect_code VARCHAR2(20) NOT NULL,
    severity VARCHAR2(20) NOT NULL,
    description CLOB,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    CONSTRAINT fk_defects_inspection FOREIGN KEY (inspection_id) REFERENCES inspections(id),
    CONSTRAINT fk_defects_defect_type FOREIGN KEY (defect_type_id) REFERENCES defect_types(id),
    CONSTRAINT ck_defects_severity CHECK (severity IN ('CRITICAL', 'MAJOR', 'MINOR'))
);

CREATE TABLE spc_data (
    id VARCHAR2(36) PRIMARY KEY,
    lot_id VARCHAR2(36) NOT NULL,
    work_order_id VARCHAR2(36),
    parameter_name VARCHAR2(100) NOT NULL,
    subgroup_no NUMBER(10) NOT NULL,
    sample_values CLOB NOT NULL,
    x_bar NUMBER(10,4),
    range_value NUMBER(10,4),
    ucl NUMBER(10,4),
    cl NUMBER(10,4),
    lcl NUMBER(10,4),
    measured_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_spc_data_lot FOREIGN KEY (lot_id) REFERENCES lots(id),
    CONSTRAINT fk_spc_data_work_order FOREIGN KEY (work_order_id) REFERENCES work_orders(id)
);

CREATE TABLE audit_trail (
    id VARCHAR2(36) PRIMARY KEY,
    table_name VARCHAR2(100) NOT NULL,
    record_id VARCHAR2(36) NOT NULL,
    action_type VARCHAR2(20) NOT NULL,
    before_data CLOB,
    after_data CLOB,
    changed_by VARCHAR2(36) NOT NULL,
    changed_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_audit_trail_changed_by FOREIGN KEY (changed_by) REFERENCES users(id),
    CONSTRAINT ck_audit_trail_action_type CHECK (action_type IN ('INSERT', 'UPDATE', 'DELETE'))
);
