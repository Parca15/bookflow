CREATE TABLE expenses
(
    id BIGSERIAL PRIMARY KEY,

    company_id BIGINT NOT NULL,

    cash_register_id BIGINT NOT NULL,

    amount NUMERIC(12, 2) NOT NULL,

    expense_date TIMESTAMP NOT NULL,

    category VARCHAR(30) NOT NULL,

    payment_method VARCHAR(30) NOT NULL,

    description TEXT,

    CONSTRAINT fk_expense_company
        FOREIGN KEY (company_id)
            REFERENCES companies (id),

    CONSTRAINT fk_expense_cash_register
        FOREIGN KEY (cash_register_id)
            REFERENCES cash_registers (id),

    CONSTRAINT ck_expense_amount
        CHECK (amount > 0),

    CONSTRAINT ck_expense_category
        CHECK (category IN (
            'PAYROLL', 'UTILITIES', 'RENT',
            'SUPPLIES', 'MAINTENANCE', 'TRANSPORT', 'OTHER'
        )),

    CONSTRAINT ck_expense_payment_method
        CHECK (payment_method IN (
            'CASH', 'CARD', 'TRANSFER', 'OTHER'
        ))
);
