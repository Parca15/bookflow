CREATE TABLE appointments
(
    id BIGSERIAL PRIMARY KEY,

    company_id BIGINT NOT NULL,
    client_id BIGINT NOT NULL,
    employee_id BIGINT NOT NULL,

    appointment_date DATE NOT NULL,

    start_time TIME NOT NULL,
    end_time TIME NOT NULL,

    status VARCHAR(20) NOT NULL,

    notes TEXT,

    CONSTRAINT fk_appointment_company
        FOREIGN KEY (company_id)
            REFERENCES companies (id),

    CONSTRAINT fk_appointment_client
        FOREIGN KEY (client_id)
            REFERENCES clients (id),

    CONSTRAINT fk_appointment_employee
        FOREIGN KEY (employee_id)
            REFERENCES employees (id)
);


CREATE TABLE appointment_items
(
    id BIGSERIAL PRIMARY KEY,

    appointment_id BIGINT NOT NULL,
    catalog_id BIGINT NOT NULL,

    price NUMERIC(12, 2) NOT NULL,

    duration_minutes INTEGER NOT NULL,

    CONSTRAINT fk_appointment_item_appointment
        FOREIGN KEY (appointment_id)
            REFERENCES appointments (id)
            ON DELETE CASCADE,

    CONSTRAINT fk_appointment_item_catalog
        FOREIGN KEY (catalog_id)
            REFERENCES catalog (id)
);