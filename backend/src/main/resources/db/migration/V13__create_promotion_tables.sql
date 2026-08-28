CREATE TABLE promotions
(
    id BIGSERIAL PRIMARY KEY,

    company_id BIGINT NOT NULL,

    name VARCHAR(150) NOT NULL,

    description TEXT,

    type VARCHAR(20) NOT NULL,

    discount_type VARCHAR(20) NOT NULL,

    discount_value NUMERIC(12, 2) NOT NULL,

    code VARCHAR(50),

    start_date TIMESTAMP NOT NULL,

    end_date TIMESTAMP NOT NULL,

    min_purchase NUMERIC(12, 2),

    max_uses INTEGER,

    used_count INTEGER NOT NULL DEFAULT 0,

    status VARCHAR(20) NOT NULL,

    CONSTRAINT fk_promotion_company
        FOREIGN KEY (company_id)
            REFERENCES companies (id),

    CONSTRAINT ck_promotion_discount_value
        CHECK (discount_value > 0),

    CONSTRAINT ck_promotion_type
        CHECK (type IN ('DISCOUNT', 'PACKAGE', 'COUPON')),

    CONSTRAINT ck_promotion_discount_type
        CHECK (discount_type IN ('PERCENTAGE', 'FIXED')),

    CONSTRAINT ck_promotion_status
        CHECK (status IN ('ACTIVE', 'INACTIVE')),

    CONSTRAINT uk_promotion_company_code
        UNIQUE (company_id, code)
);

CREATE TABLE promotion_services
(
    id BIGSERIAL PRIMARY KEY,

    promotion_id BIGINT NOT NULL,

    catalog_id BIGINT NOT NULL,

    CONSTRAINT fk_promotion_service_promotion
        FOREIGN KEY (promotion_id)
            REFERENCES promotions (id)
            ON DELETE CASCADE,

    CONSTRAINT fk_promotion_service_catalog
        FOREIGN KEY (catalog_id)
            REFERENCES catalog (id),

    CONSTRAINT uk_promotion_service
        UNIQUE (promotion_id, catalog_id)
);
