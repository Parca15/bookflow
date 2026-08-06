CREATE TABLE companies
(
    id BIGSERIAL PRIMARY KEY,

    business_name VARCHAR(150) NOT NULL,

    document_number VARCHAR(30) UNIQUE,

    email VARCHAR(120),

    phone VARCHAR(30),

    address VARCHAR(250),

    status VARCHAR(20) NOT NULL
);