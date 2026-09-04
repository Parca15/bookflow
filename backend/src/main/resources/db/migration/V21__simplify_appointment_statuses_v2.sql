-- Simplificar los estados de cita a SCHEDULED, COMPLETED, CANCELLED
UPDATE appointments SET status = 'SCHEDULED' WHERE status IN ('CONFIRMED', 'IN_PROGRESS', 'NO_SHOW');

ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_status_check;

ALTER TABLE appointments ADD CONSTRAINT appointments_status_check
    CHECK (status IN ('SCHEDULED', 'COMPLETED', 'CANCELLED'));
