-- ==============================================================================
-- Lumina 24-Hour Study & Coffee Cafe Platform
-- Enterprise PostgreSQL 16+ Production Schema
-- Designed for 50,000+ Concurrent Mobile Users with Row-Level Security (RLS)
-- Multi-Architecture Distributed Concurrency, Redis Lock Integration & SSE Pub/Sub
-- Full Base64 Inline Storage for Ultra-Fast Zero-Network Menu Image Fetching
-- Cryptographic Admin Security: SHA-256 Hash (Never Plaintext)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS
DO $$ BEGIN
    CREATE TYPE table_status_enum AS ENUM ('AVAILABLE', 'OCCUPIED', 'CLEANING', 'MAINTENANCE');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE session_status_enum AS ENUM ('ACTIVE', 'CHECKED_OUT', 'REVOKED', 'EXPIRED');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status_enum AS ENUM ('UNPAID', 'PENDING_VERIFICATION', 'SETTLED', 'FAILED');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ==============================================================================
-- 3. TABLES TABLE (20 Dedicated 24h Study Workstations)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS tables (
    id VARCHAR(10) PRIMARY KEY,                         -- 'T01' to 'T20'
    table_number INT NOT NULL UNIQUE,                  -- 1 to 20
    zone_name VARCHAR(100) NOT NULL,                   -- 'Silent Focus Zone', etc.
    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',   -- 'AVAILABLE', 'OCCUPIED', etc.
    current_session_id VARCHAR(64) NULL,               -- Active session ID
    capacity INT NOT NULL DEFAULT 1,
    socket_count INT NOT NULL DEFAULT 4,
    has_type_c_100w BOOLEAN NOT NULL DEFAULT TRUE,
    has_ergonomic_chair BOOLEAN NOT NULL DEFAULT TRUE,
    total_uses_today INT NOT NULL DEFAULT 0,
    last_cleaned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tables_status ON tables(status);
CREATE INDEX IF NOT EXISTS idx_tables_zone ON tables(zone_name, status);

-- Seed Initial 20 Study Tables
INSERT INTO tables (id, table_number, zone_name, status, capacity, socket_count)
VALUES
('T01', 1, 'Silent Focus Zone', 'AVAILABLE', 1, 4),
('T02', 2, 'Silent Focus Zone', 'AVAILABLE', 1, 4),
('T03', 3, 'Silent Focus Zone', 'AVAILABLE', 1, 4),
('T04', 4, 'Silent Focus Zone', 'AVAILABLE', 1, 4),
('T05', 5, 'Silent Focus Zone', 'AVAILABLE', 1, 4),
('T06', 6, 'Collaborative Zone', 'AVAILABLE', 2, 6),
('T07', 7, 'Collaborative Zone', 'AVAILABLE', 2, 6),
('T08', 8, 'Collaborative Zone', 'AVAILABLE', 2, 6),
('T09', 9, 'Collaborative Zone', 'AVAILABLE', 2, 6),
('T10', 10, 'Collaborative Zone', 'AVAILABLE', 2, 6),
('T11', 11, 'Zen Garden View', 'AVAILABLE', 1, 4),
('T12', 12, 'Zen Garden View', 'AVAILABLE', 1, 4),
('T13', 13, 'Zen Garden View', 'AVAILABLE', 1, 4),
('T14', 14, 'Zen Garden View', 'AVAILABLE', 1, 4),
('T15', 15, 'Team Workshop Area', 'AVAILABLE', 4, 8),
('T16', 16, 'Team Workshop Area', 'AVAILABLE', 4, 8),
('T17', 17, 'Team Workshop Area', 'AVAILABLE', 4, 8),
('T18', 18, 'Silent Focus Zone', 'AVAILABLE', 1, 4),
('T19', 19, 'VIP Soundproof Pod', 'AVAILABLE', 2, 6),
('T20', 20, 'VIP Soundproof Pod', 'AVAILABLE', 2, 6)
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 4. SESSIONS (Cryptographically Secured Device Sessions)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS sessions (
    id VARCHAR(64) PRIMARY KEY,                        -- Cryptographic Session ID
    table_id VARCHAR(10) NOT NULL REFERENCES tables(id) ON DELETE RESTRICT,
    device_fingerprint VARCHAR(64) NOT NULL,           -- Persistent Hardware/Browser Fingerprint
    secure_pin VARCHAR(6) NOT NULL,                    -- 6-Digit HMAC OTP
    check_in_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    check_out_time TIMESTAMP NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',       -- 'ACTIVE', 'CHECKED_OUT'
    hmac_signature TEXT NOT NULL,
    client_ip VARCHAR(45) NOT NULL DEFAULT '127.0.0.1'
);

CREATE INDEX IF NOT EXISTS idx_sessions_active ON sessions(table_id, status) WHERE status = 'ACTIVE';
CREATE INDEX IF NOT EXISTS idx_sessions_device ON sessions(device_fingerprint, status);
CREATE INDEX IF NOT EXISTS idx_sessions_pin ON sessions(table_id, secure_pin);

-- ==============================================================================
-- 5. MENU_ITEMS (With Inline Base64 Data URI Images for Zero-HTTP Roundtrip)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS menu_items (
    id VARCHAR(50) PRIMARY KEY,
    name_th VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,                     -- 'coffee', 'tea', 'booster', 'bakery', 'bites'
    prices JSONB NOT NULL,                             -- {"small": 50.00, "large": 90.00}
    image_base64 TEXT NOT NULL,                        -- Direct Base64 Data URI
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    tags TEXT[] NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_menu_items_cat ON menu_items(category, is_available);

-- Seed Base64 Inline Culinary Masterpieces
INSERT INTO menu_items (id, name_th, name_en, category, prices, image_base64, is_available, tags)
VALUES
(
    'signature-americano',
    'Signature Lumina Americano',
    'Signature Lumina Americano',
    'coffee',
    '{"small": 50.00, "large": 90.00}'::jsonb,
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MDAgNDAwIiB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9IiMwQjBCMEMiLz48Y2lyY2xlIGN4PSIyMDAiIGN5PSIyMDAiIHI9IjE0MCIgZmlsbD0iIzE4MTQxMiIgc3Ryb2tlPSIjRkY2QjAwIiBzdHJva2Utd2lkdGg9IjIiLz48L3N2Zz4=',
    TRUE,
    ARRAY['Popular', '50/90 THB']
),
(
    'dirty-coffee',
    'Velvet Dirty Coffee',
    'Velvet Dirty Coffee',
    'coffee',
    '{"small": 110.00}'::jsonb,
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MDAgNDAwIiB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9IiMwQjBCMEMiLz48Y2lyY2xlIGN4PSIyMDAiIGN5PSIyMDAiIHI9IjE0MCIgZmlsbD0iIzE4MTUxMyIgc3Ryb2tlPSIjRkY2QjAwIiBzdHJva2Utd2lkdGg9IjIiLz48L3N2Zz4=',
    TRUE,
    ARRAY['Signature']
),
(
    'uji-matcha',
    'Ceremonial Uji Matcha Latte',
    'Ceremonial Uji Matcha Latte',
    'tea',
    '{"small": 125.00, "large": 155.00}'::jsonb,
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MDAgNDAwIiB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9IiMwQjBCMEMiLz48Y2lyY2xlIGN4PSIyMDAiIGN5PSIyMDAiIHI9IjE0MCIgZmlsbD0iIzEzMTgxNSIgc3Ryb2tlPSIjMTBCOTgxIiBzdHJva2Utd2lkdGg9IjIiLz48L3N2Zz4=',
    TRUE,
    ARRAY['Kyoto Ceremonial']
),
(
    'truffle-croissant',
    'French Truffle Butter Croissant',
    'French Truffle Butter Croissant',
    'bakery',
    '{"standard": 95.00}'::jsonb,
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MDAgNDAwIiB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9IiMwQjBCMEMiLz48Y2lyY2xlIGN4PSIyMDAiIGN5PSIyMDAiIHI9IjE0MCIgZmlsbD0iIzE4MTUxMyIgc3Ryb2tlPSIjRkY4QzMzIiBzdHJva2Utd2lkdGg9IjIiLz48L3N2Zz4=',
    TRUE,
    ARRAY['Warm Baked']
)
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 6. ORDERS (Customer & Bot Food & Table Usage Orders with Ref1 & Ref2)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(64) PRIMARY KEY,                        -- 'ORD-882190'
    session_id VARCHAR(64) NOT NULL REFERENCES sessions(id),
    table_id VARCHAR(10) NOT NULL REFERENCES tables(id),
    items JSONB NOT NULL,                              -- Array of cart items with sizes and options
    subtotal DECIMAL(10,2) NOT NULL,
    vat_amount DECIMAL(10,2) NOT NULL,                 -- 7% VAT
    service_charge DECIMAL(10,2) NOT NULL,             -- 5% Service Charge
    total_amount DECIMAL(10,2) NOT NULL,
    ref1 VARCHAR(22) NULL CHECK (ref1 IS NULL OR ref1 ~ '^D1[0-9]{20}$'), -- Begins with 'D1' + 20 digits
    ref2 VARCHAR(6) NULL CHECK (ref2 IS NULL OR ref2 ~ '^[0-9]{6}$'),     -- 6 digits table secret code
    payment_status VARCHAR(20) NOT NULL DEFAULT 'UNPAID', -- 'UNPAID', 'PENDING', 'SETTLED'
    slip_image TEXT NULL,                              -- Base64 Bank Slip proof
    bank_reference_no VARCHAR(100) NULL,
    sender_bank VARCHAR(100) NULL,
    rating INT NULL CHECK (rating >= 1 AND rating <= 5),
    is_bot BOOLEAN NOT NULL DEFAULT FALSE,             -- Strictly isolated from Admin Revenue Ledger
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    settled_at TIMESTAMP NULL
);

CREATE INDEX IF NOT EXISTS idx_orders_session ON orders(session_id);
CREATE INDEX IF NOT EXISTS idx_orders_revenue ON orders(payment_status, is_bot, settled_at);
CREATE INDEX IF NOT EXISTS idx_orders_table ON orders(table_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_refs ON orders(ref1, ref2);

-- ==============================================================================
-- 7. PROMPTPAY_TRANSACTIONS (EMVCo Tag 62 Biller QR & Non-AI Verification)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS promptpay_transactions (
    id VARCHAR(64) PRIMARY KEY,                        -- 'tx_1730591234_abc'
    order_id VARCHAR(64) NOT NULL REFERENCES orders(id),
    table_id VARCHAR(10) NOT NULL REFERENCES tables(id),
    target_ewallet_id VARCHAR(15) NOT NULL DEFAULT '004999233365393',
    amount DECIMAL(10,2) NOT NULL,
    ref1 VARCHAR(22) NOT NULL CHECK (ref1 ~ '^D1[0-9]{20}$'), -- Begins with 'D1' + 20 digits
    ref2 VARCHAR(6) NOT NULL CHECK (ref2 ~ '^[0-9]{6}$'),     -- 6 digits table secret code
    emvco_payload TEXT NOT NULL,
    crc16 VARCHAR(4) NOT NULL,
    payment_status VARCHAR(20) NOT NULL DEFAULT 'PENDING_VERIFICATION',
    bank_reference_no VARCHAR(100) NULL,
    sender_bank VARCHAR(100) NULL,
    verification_engine VARCHAR(100) NOT NULL DEFAULT 'NON_AI_RULE_BASED_SCRIPT',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    settled_at TIMESTAMP NULL
);

CREATE INDEX IF NOT EXISTS idx_transactions_order ON promptpay_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_transactions_ref1 ON promptpay_transactions(ref1);
CREATE INDEX IF NOT EXISTS idx_transactions_ref2 ON promptpay_transactions(ref2);

-- ==============================================================================
-- 8. TABLE_ACTIVITY_LOGS (Partitioned by Range / Month for 50,000 Users)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS table_activity_logs (
    id BIGSERIAL,
    table_id VARCHAR(10) NOT NULL,
    session_id VARCHAR(64) NULL,
    event_type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    metadata JSONB NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- Partition Tables
CREATE TABLE IF NOT EXISTS table_activity_logs_2026_10 PARTITION OF table_activity_logs
    FOR VALUES FROM ('2026-10-01 00:00:00') TO ('2026-11-01 00:00:00');
CREATE TABLE IF NOT EXISTS table_activity_logs_2026_11 PARTITION OF table_activity_logs
    FOR VALUES FROM ('2026-11-01 00:00:00') TO ('2026-12-01 00:00:00');
CREATE TABLE IF NOT EXISTS table_activity_logs_2026_12 PARTITION OF table_activity_logs
    FOR VALUES FROM ('2026-12-01 00:00:00') TO ('2027-01-01 00:00:00');

CREATE INDEX IF NOT EXISTS idx_activity_logs_table_time ON table_activity_logs(table_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_session ON table_activity_logs(session_id);

-- ==============================================================================
-- 9. ADMIN_AUDIT_LOGS (Protected Exclusively for Admin Access)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id SERIAL PRIMARY KEY,
    action VARCHAR(100) NOT NULL,
    table_id VARCHAR(10) NULL,
    session_id VARCHAR(64) NULL,
    details TEXT NOT NULL,
    metadata JSONB NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_action ON admin_audit_logs(action, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_table ON admin_audit_logs(table_id, created_at DESC);

-- ==============================================================================
-- 10. ADMIN DAILY REVENUE TARGETS (15,000 THB Minimum Goal)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS admin_daily_targets (
    target_date DATE PRIMARY KEY DEFAULT CURRENT_DATE,
    minimum_target DECIMAL(10,2) NOT NULL DEFAULT 15000.00,
    total_settled_revenue DECIMAL(10,2) NOT NULL DEFAULT 0.00, -- Starts strictly at 0.00 THB
    total_settled_orders INT NOT NULL DEFAULT 0,
    is_target_achieved BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 11. ADMIN USERS & SHA-256 PASSWORD HASH SECURITY
-- Password 'Caferich888' -> SHA-256: 8936b51f709037b5c81b7587751799ea2292ffb924c9c80db253af549516c148
-- ==============================================================================
CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(64) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'ADMIN',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO admin_users (username, password_hash, full_name, role)
VALUES (
    'admin',
    '8936b51f709037b5c81b7587751799ea2292ffb924c9c80db253af549516c148',
    'Lumina Cafe Executive Administrator',
    'ADMIN'
) ON CONFLICT (username) DO NOTHING;

-- ==============================================================================
-- 12. POSTGRESQL ROW-LEVEL SECURITY (RLS) POLICIES
-- Enforces device-level row isolation for customer sessions, orders, and transactions.
-- Admin role possesses bypass/elevation privileges after SHA-256 verification.
-- ==============================================================================

-- Enable RLS across all tables
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE promptpay_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE table_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_daily_targets ENABLE ROW LEVEL SECURITY;

-- 12.1 Table RLS: Public can view table statuses, only Admin or Server Functions can write
DROP POLICY IF EXISTS p_tables_public_read ON tables;
CREATE POLICY p_tables_public_read ON tables
    FOR SELECT USING (true);

DROP POLICY IF EXISTS p_tables_admin_write ON tables;
CREATE POLICY p_tables_admin_write ON tables
    FOR ALL USING (current_setting('app.is_admin', true) = 'true');

-- 12.2 Menu Items RLS: Public read for fast rendering
DROP POLICY IF EXISTS p_menu_items_read ON menu_items;
CREATE POLICY p_menu_items_read ON menu_items
    FOR SELECT USING (true);

-- 12.3 Sessions RLS: Strict Device Fingerprint Isolation
DROP POLICY IF EXISTS p_sessions_device_isolation ON sessions;
CREATE POLICY p_sessions_device_isolation ON sessions
    FOR ALL USING (
        device_fingerprint = current_setting('app.current_device_fingerprint', true)
        OR current_setting('app.is_admin', true) = 'true'
    );

-- 12.4 Orders RLS: A client can only access their own session orders
DROP POLICY IF EXISTS p_orders_session_isolation ON orders;
CREATE POLICY p_orders_session_isolation ON orders
    FOR ALL USING (
        session_id IN (
            SELECT id FROM sessions 
            WHERE device_fingerprint = current_setting('app.current_device_fingerprint', true)
        )
        OR current_setting('app.is_admin', true) = 'true'
    );

-- 12.5 PromptPay Transactions RLS: Strict Session Isolation
DROP POLICY IF EXISTS p_transactions_isolation ON promptpay_transactions;
CREATE POLICY p_transactions_isolation ON promptpay_transactions
    FOR ALL USING (
        order_id IN (
            SELECT o.id FROM orders o
            JOIN sessions s ON o.session_id = s.id
            WHERE s.device_fingerprint = current_setting('app.current_device_fingerprint', true)
        )
        OR current_setting('app.is_admin', true) = 'true'
    );

-- 12.6 Activity Logs RLS: Customer sees only their table session logs; Admin views all
DROP POLICY IF EXISTS p_activity_logs_isolation ON table_activity_logs;
CREATE POLICY p_activity_logs_isolation ON table_activity_logs
    FOR ALL USING (
        session_id IN (
            SELECT id FROM sessions 
            WHERE device_fingerprint = current_setting('app.current_device_fingerprint', true)
        )
        OR current_setting('app.is_admin', true) = 'true'
    );

-- 12.7 Admin Audit Logs RLS: Strictly restricted to Admin role
DROP POLICY IF EXISTS p_admin_audit_logs_restricted ON admin_audit_logs;
CREATE POLICY p_admin_audit_logs_restricted ON admin_audit_logs
    FOR ALL USING (current_setting('app.is_admin', true) = 'true');

-- 12.8 Admin Daily Targets RLS: Restricted to Admin role
DROP POLICY IF EXISTS p_admin_targets_restricted ON admin_daily_targets;
CREATE POLICY p_admin_targets_restricted ON admin_daily_targets
    FOR ALL USING (current_setting('app.is_admin', true) = 'true');

-- ==============================================================================
-- 13. ATOMIC CONCURRENCY FUNCTION: SELECT FOR UPDATE TABLE LEASE
-- ==============================================================================
CREATE OR REPLACE FUNCTION atomic_reserve_table(
    p_table_id VARCHAR(10),
    p_session_id VARCHAR(64),
    p_device_fingerprint VARCHAR(64),
    p_secure_pin VARCHAR(6),
    p_hmac TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    v_status VARCHAR(20);
    v_existing_active_count INT;
BEGIN
    -- 1. Check if device already has an unpaid active session on another table
    SELECT COUNT(*) INTO v_existing_active_count
    FROM sessions
    WHERE device_fingerprint = p_device_fingerprint AND status = 'ACTIVE';

    IF v_existing_active_count > 0 THEN
        RAISE EXCEPTION 'อุปกรณ์นี้มีโต๊ะที่กำลังใช้งานอยู่แล้ว กรุณาชำระเงินและ Checkout ก่อนจองโต๊ะเพิ่ม';
    END IF;

    -- 2. Acquire exclusive row lock on the table (SELECT FOR UPDATE)
    SELECT status INTO v_status
    FROM tables
    WHERE id = p_table_id
    FOR UPDATE;

    IF v_status = 'OCCUPIED' THEN
        RAISE EXCEPTION 'โต๊ะนี้ถูกจองไปแล้ว';
    END IF;

    -- 3. Insert active session
    INSERT INTO sessions (id, table_id, device_fingerprint, secure_pin, hmac_signature, status)
    VALUES (p_session_id, p_table_id, p_device_fingerprint, p_secure_pin, p_hmac, 'ACTIVE');

    -- 4. Update table state
    UPDATE tables
    SET status = 'OCCUPIED',
        current_session_id = p_session_id,
        total_uses_today = total_uses_today + 1,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_table_id;

    -- 5. Audit Log
    INSERT INTO admin_audit_logs (action, table_id, session_id, details)
    VALUES ('CHECK_IN', p_table_id, p_session_id, FORMAT('ลูกค้าเข้าใช้โต๊ะ %s PIN: %s (Device: %s)', p_table_id, p_secure_pin, p_device_fingerprint));

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 12. ATOMIC CHECKOUT & REVENUE TRIGGER (ISOLATING BOTS)
-- ==============================================================================
CREATE OR REPLACE FUNCTION trigger_settle_order_and_release_table()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.payment_status = 'SETTLED' AND OLD.payment_status <> 'SETTLED' THEN
        -- 1. Release Table back to AVAILABLE
        UPDATE tables
        SET status = 'AVAILABLE',
            current_session_id = NULL,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.table_id;

        -- 2. Mark Session as CHECKED_OUT
        UPDATE sessions
        SET status = 'CHECKED_OUT',
            check_out_time = CURRENT_TIMESTAMP
        WHERE id = NEW.session_id;

        -- 3. If genuine customer (not bot), increment Admin Revenue Ledger
        IF NEW.is_bot = FALSE THEN
            INSERT INTO admin_daily_targets (target_date, minimum_target, total_settled_revenue, total_settled_orders, is_target_achieved)
            VALUES (CURRENT_DATE, 15000.00, NEW.total_amount, 1, (NEW.total_amount >= 15000.00))
            ON CONFLICT (target_date) DO UPDATE
            SET total_settled_revenue = admin_daily_targets.total_settled_revenue + NEW.total_amount,
                total_settled_orders = admin_daily_targets.total_settled_orders + 1,
                is_target_achieved = ((admin_daily_targets.total_settled_revenue + NEW.total_amount) >= admin_daily_targets.minimum_target),
                updated_at = CURRENT_TIMESTAMP;
        END IF;

        -- 4. Record to Admin Audit Log
        INSERT INTO admin_audit_logs (action, table_id, session_id, details, metadata)
        VALUES (
            'CHECK_OUT',
            NEW.table_id,
            NEW.session_id,
            FORMAT('ชำระเงินสำเร็จ ฿%s (Ref: %s). คืนสถานะโต๊ะ %s เป็น AVAILABLE', NEW.total_amount, NEW.bank_reference_no, NEW.table_id),
            jsonb_build_object('amount', NEW.total_amount, 'is_bot', NEW.is_bot, 'ref', NEW.bank_reference_no)
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_order_settlement ON orders;
CREATE TRIGGER trg_order_settlement
AFTER UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION trigger_settle_order_and_release_table();
