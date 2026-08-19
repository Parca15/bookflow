CREATE TABLE schedules
(
    id BIGSERIAL PRIMARY KEY,

    employee_id BIGINT NOT NULL,

    day_of_week VARCHAR(20) NOT NULL,

    start_time TIME NOT NULL,

    end_time TIME NOT NULL,

    status VARCHAR(20) NOT NULL,

    CONSTRAINT fk_schedule_employee
        FOREIGN KEY (employee_id)
            REFERENCES employees (id)
);
