CREATE TABLE clients
(
    id BIGSERIAL PRIMARY KEY,

    company_id BIGINT NOT NULL,

    first_name VARCHAR(100) NOT NULL,

    last_name VARCHAR(100) NOT NULL,

    document_type VARCHAR(20) NOT NULL,

    document_number VARCHAR(30),

    phone VARCHAR(30),

    email VARCHAR(120),

    address VARCHAR(250),

    status VARCHAR(20) NOT NULL,

    CONSTRAINT fk_client_company
        FOREIGN KEY (company_id)
            REFERENCES companies (id),

    CONSTRAINT uk_client_company_document
        UNIQUE (company_id, document_number)
);
