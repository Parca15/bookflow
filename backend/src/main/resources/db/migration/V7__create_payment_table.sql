CREATE TABLE payments
(
    id BIGSERIAL PRIMARY KEY,

    appointment_id BIGINT NOT NULL,

    amount NUMERIC(12, 2) NOT NULL,

    payment_date TIMESTAMP NOT NULL,

    payment_method VARCHAR(30) NOT NULL,

    notes TEXT,

    CONSTRAINT fk_payment_appointment
        FOREIGN KEY (appointment_id)
            REFERENCES appointments (id)
            ON DELETE CASCADE,

    CONSTRAINT ck_payment_amount
        CHECK (amount > 0)
);