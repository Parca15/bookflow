CREATE TABLE catalog
(
    id BIGSERIAL PRIMARY KEY,

    company_id BIGINT NOT NULL,

    name VARCHAR(150) NOT NULL,

    price NUMERIC(12, 2) NOT NULL,

    duration_minutes INTEGER NOT NULL,

    status VARCHAR(20) NOT NULL,

    CONSTRAINT fk_catalog_company
        FOREIGN KEY (company_id)
            REFERENCES companies (id),

    CONSTRAINT uk_catalog_company_name
        UNIQUE (company_id, name)
);
