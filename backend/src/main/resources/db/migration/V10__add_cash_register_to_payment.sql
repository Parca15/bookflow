ALTER TABLE payments
    ADD COLUMN cash_register_id BIGINT;

ALTER TABLE payments
    ADD CONSTRAINT fk_payment_cash_register
        FOREIGN KEY (cash_register_id)
        REFERENCES cash_registers (id);