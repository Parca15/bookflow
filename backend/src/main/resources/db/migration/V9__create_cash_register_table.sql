CREATE TABLE cash_registers
(
    id BIGSERIAL PRIMARY KEY,

    company_id BIGINT NOT NULL,

    opening_date TIMESTAMP NOT NULL,

    closing_date TIMESTAMP,

    opening_amount NUMERIC(12, 2) NOT NULL,

    closing_amount NUMERIC(12, 2),

    expected_cash_amount NUMERIC(12, 2),

    cash_difference NUMERIC(12, 2),

    status VARCHAR(20) NOT NULL,

    CONSTRAINT fk_cash_register_company
        FOREIGN KEY (company_id)
            REFERENCES companies (id),

    CONSTRAINT chk_cash_register_opening_amount
        CHECK (opening_amount >= 0),

    CONSTRAINT chk_cash_register_closing_amount
        CHECK (closing_amount IS NULL OR closing_amount >= 0),

    CONSTRAINT chk_cash_register_status
        CHECK (status IN ('OPEN', 'CLOSED'))
);

CREATE UNIQUE INDEX uk_cash_register_open_company
    ON cash_registers (company_id)
    WHERE status = 'OPEN';