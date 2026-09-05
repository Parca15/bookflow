ALTER TABLE appointments
    ADD COLUMN promotion_id BIGINT,
    ADD COLUMN coupon_discount_amount NUMERIC(12, 2),
    ADD COLUMN coupon_applied_at TIMESTAMP;

ALTER TABLE appointments
    ADD CONSTRAINT fk_appointment_promotion
        FOREIGN KEY (promotion_id)
            REFERENCES promotions (id)
            ON DELETE SET NULL;

ALTER TABLE appointments
    ADD CONSTRAINT ck_appointment_coupon_amount
        CHECK (coupon_discount_amount IS NULL OR coupon_discount_amount >= 0);

CREATE INDEX idx_appointment_promotion
    ON appointments (promotion_id);