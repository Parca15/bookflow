-- V19: Add audit columns to all tables
DO $$
DECLARE
    t text;
    tables text[] := ARRAY[
        'companies', 'users', 'roles', 'clients', 'employees',
        'catalog', 'schedules', 'appointments', 'appointment_items',
        'payments', 'expenses', 'cash_registers', 'invoices', 'promotions',
        'role_permissions'
    ];
BEGIN
    FOREACH t IN ARRAY tables LOOP
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = t AND column_name = 'created_at') THEN
            EXECUTE format('ALTER TABLE %I ADD COLUMN created_at TIMESTAMP DEFAULT NOW()', t);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = t AND column_name = 'updated_at') THEN
            EXECUTE format('ALTER TABLE %I ADD COLUMN updated_at TIMESTAMP DEFAULT NOW()', t);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = t AND column_name = 'created_by') THEN
            EXECUTE format('ALTER TABLE %I ADD COLUMN created_by BIGINT', t);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = t AND column_name = 'updated_by') THEN
            EXECUTE format('ALTER TABLE %I ADD COLUMN updated_by BIGINT', t);
        END IF;
    END LOOP;
END $$;
