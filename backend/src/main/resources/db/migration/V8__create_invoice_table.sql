CREATE TABLE invoices
(
    id BIGSERIAL PRIMARY KEY,

    appointment_id BIGINT NOT NULL,

    invoice_number VARCHAR(30) NOT NULL,

    issue_date TIMESTAMP NOT NULL,

    subtotal NUMERIC(12, 2) NOT NULL,

    total NUMERIC(12, 2) NOT NULL,

    status VARCHAR(20) NOT NULL,

    CONSTRAINT fk_invoice_appointment
        FOREIGN KEY (appointment_id)
            REFERENCES appointments (id),

    CONSTRAINT uk_invoice_appointment
        UNIQUE (appointment_id),

    CONSTRAINT uk_invoice_number
        UNIQUE (invoice_number),

    CONSTRAINT ck_invoice_subtotal
        CHECK (subtotal >= 0),

    CONSTRAINT ck_invoice_total
        CHECK (total >= 0)
);