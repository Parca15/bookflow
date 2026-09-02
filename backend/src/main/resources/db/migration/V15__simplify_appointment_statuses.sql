-- Migrar datos existentes: CONFIRMED -> SCHEDULED, IN_PROGRESS -> COMPLETED
UPDATE appointments SET status = 'SCHEDULED' WHERE status = 'CONFIRMED';
UPDATE appointments SET status = 'COMPLETED' WHERE status = 'IN_PROGRESS';

-- Eliminar los valores del CHECK constraint si existe
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_status_check;

-- Crear nuevo CHECK constraint con solo 4 estados
ALTER TABLE appointments ADD CONSTRAINT appointments_status_check
    CHECK (status IN ('SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'));
