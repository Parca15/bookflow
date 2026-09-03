-- Agregar columna document_type a la tabla companies
ALTER TABLE companies ADD COLUMN document_type VARCHAR(20) DEFAULT 'NIT';

-- Migrar datos existentes: si tiene NIT (10 dígitos) usar NIT, si no usar CC
UPDATE companies SET document_type = 'NIT' WHERE LENGTH(REPLACE(document_number, '-', '')) = 10 AND document_number ~ '^[0-9]+$';
UPDATE companies SET document_type = 'CC' WHERE document_type IS NULL;

-- Establecer NOT NULL después de la migración
ALTER TABLE companies ALTER COLUMN document_type SET NOT NULL;
ALTER TABLE companies ALTER COLUMN document_type DROP DEFAULT;
