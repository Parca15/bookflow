CREATE TABLE employees
(
    id BIGSERIAL PRIMARY KEY,

    company_id BIGINT NOT NULL,

    name VARCHAR(150) NOT NULL,

    document_number VARCHAR(30),

    email VARCHAR(120),

    phone VARCHAR(30),

    position VARCHAR(100) NOT NULL,

    status VARCHAR(20) NOT NULL,

    CONSTRAINT fk_employee_company
        FOREIGN KEY (company_id)
            REFERENCES companies (id),

    CONSTRAINT uk_employee_company_document
        UNIQUE (company_id, document_number)
);
