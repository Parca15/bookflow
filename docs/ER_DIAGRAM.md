0-- BookFlow                      - Diagrama de Entidad-Relación
-- Base de datos: PostgreSQL 17

-- ========================================
-- EMPRESAS
-- ========================================
companies (
    id              BIGSERIAL PRIMARY KEY,
    business_name   VARCHAR(150) NOT NULL,
    document_number VARCHAR(30) UNIQUE,
    email           VARCHAR(120),
    phone           VARCHAR(30),
    address         VARCHAR(250),
    status          VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
)

-- ========================================
-- USUARIOS (Auth)
-- ========================================
users (
    id              BIGSERIAL PRIMARY KEY,
    company_id      BIGINT NOT NULL → companies(id),
    email           VARCHAR(150) NOT NULL,
    password        VARCHAR(255) NOT NULL,
    full_name       VARCHAR(150) NOT NULL,
    role            VARCHAR(30) NOT NULL,  -- ADMIN, MANAGER, RECEPTIONIST, EMPLOYEE
    status          VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    
    UNIQUE (company_id, email)
)

-- ========================================
-- CATÁLOGO DE SERVICIOS
-- ========================================
service_catalog (
    id              BIGSERIAL PRIMARY KEY,
    company_id      BIGINT NOT NULL → companies(id),
    name            VARCHAR(100) NOT NULL,
    description     TEXT,
    price           DECIMAL(12,2) NOT NULL,
    duration_minutes INT NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
)

-- ========================================
-- CLIENTES
-- ========================================
clients (
    id              BIGSERIAL PRIMARY KEY,
    company_id      BIGINT NOT NULL → companies(id),
    full_name       VARCHAR(150) NOT NULL,
    document_number VARCHAR(30),
    email           VARCHAR(150),
    phone           VARCHAR(30),
    notes           TEXT,
    status          VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    
    UNIQUE (company_id, document_number)
)

-- ========================================
-- EMPLEADOS
-- ========================================
employees (
    id              BIGSERIAL PRIMARY KEY,
    company_id      BIGINT NOT NULL → companies(id),
    full_name       VARCHAR(150) NOT NULL,
    document_number VARCHAR(30),
    email           VARCHAR(150),
    phone           VARCHAR(30),
    specialty       VARCHAR(100),
    status          VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    
    UNIQUE (company_id, document_number)
)

-- ========================================
-- HORARIOS
-- ========================================
schedules (
    id              BIGSERIAL PRIMARY KEY,
    employee_id     BIGINT NOT NULL → employees(id),
    day_of_week     VARCHAR(10) NOT NULL,  -- MONDAY, TUESDAY, etc.
    start_time      TIME NOT NULL,
    end_time        TIME NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
)

-- ========================================
-- CITAS
-- ========================================
appointments (
    id              BIGSERIAL PRIMARY KEY,
    company_id      BIGINT NOT NULL → companies(id),
    client_id       BIGINT NOT NULL → clients(id),
    employee_id     BIGINT NOT NULL → employees(id),
    appointment_date DATE NOT NULL,
    start_time      TIME NOT NULL,
    end_time        TIME NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED',
    notes           TEXT,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
)

-- ========================================
-- SERVICIOS DE LA CITA (Many-to-Many)
-- ========================================
appointment_services (
    id              BIGSERIAL PRIMARY KEY,
    appointment_id  BIGINT NOT NULL → appointments(id),
    catalog_id      BIGINT NOT NULL → service_catalog(id),
    price           DECIMAL(12,2) NOT NULL
)

-- ========================================
-- CAJA
-- ========================================
cash_registers (
    id                  BIGSERIAL PRIMARY KEY,
    company_id          BIGINT NOT NULL → companies(id),
    opening_date        TIMESTAMP NOT NULL,
    closing_date        TIMESTAMP,
    opening_amount      DECIMAL(12,2) NOT NULL,
    closing_amount      DECIMAL(12,2),
    expected_cash_amount DECIMAL(12,2),
    cash_difference     DECIMAL(12,2),
    status              VARCHAR(20) NOT NULL DEFAULT 'OPEN'
)

-- ========================================
-- PAGOS
-- ========================================
payments (
    id              BIGSERIAL PRIMARY KEY,
    appointment_id  BIGINT NOT NULL → appointments(id),
    cash_register_id BIGINT → cash_registers(id),
    amount          DECIMAL(12,2) NOT NULL,
    payment_date    TIMESTAMP NOT NULL,
    payment_method  VARCHAR(30) NOT NULL,  -- CASH, CARD, TRANSFER, OTHER
    notes           TEXT
)

-- ========================================
-- GASTOS
-- ========================================
expenses (
    id              BIGSERIAL PRIMARY KEY,
    company_id      BIGINT NOT NULL → companies(id),
    cash_register_id BIGINT NOT NULL → cash_registers(id),
    amount          DECIMAL(12,2) NOT NULL,
    expense_date    TIMESTAMP NOT NULL,
    category        VARCHAR(30) NOT NULL,  -- PAYROLL, UTILITIES, RENT, etc.
    payment_method  VARCHAR(30) NOT NULL,
    description     TEXT
)

-- ========================================
-- FACTURAS
-- ========================================
invoices (
    id              BIGSERIAL PRIMARY KEY,
    appointment_id  BIGINT NOT NULL → appointments(id),
    invoice_number  VARCHAR(50) NOT NULL,
    issue_date      TIMESTAMP NOT NULL,
    due_date        TIMESTAMP NOT NULL,
    subtotal        DECIMAL(12,2) NOT NULL,
    tax_rate        DECIMAL(5,2) NOT NULL DEFAULT 19.00,
    tax_amount      DECIMAL(12,2) NOT NULL,
    total           DECIMAL(12,2) NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    notes           TEXT
)

-- ========================================
-- PROMOCIONES
-- ========================================
promotions (
    id              BIGSERIAL PRIMARY KEY,
    company_id      BIGINT NOT NULL → companies(id),
    name            VARCHAR(100) NOT NULL,
    description     TEXT,
    promotion_type  VARCHAR(20) NOT NULL,  -- DISCOUNT, PACKAGE, COUPON
    discount_type   VARCHAR(20),           -- PERCENTAGE, FIXED
    discount_value  DECIMAL(12,2),
    code            VARCHAR(50),
    start_date      DATE NOT NULL,
    end_date        DATE NOT NULL,
    min_purchase    DECIMAL(12,2) DEFAULT 0,
    max_uses        INT,
    current_uses    INT DEFAULT 0,
    status          VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
)

-- ========================================
-- SERVICIOS DE PROMOCIÓN (Many-to-Many)
-- ========================================
promotion_services (
    id              BIGSERIAL PRIMARY KEY,
    promotion_id    BIGINT NOT NULL → promotions(id),
    catalog_id      BIGINT NOT NULL → service_catalog(id)
)

-- ========================================
-- RELACIONES
-- ========================================

-- users → companies
-- service_catalog → companies
-- clients → companies
-- employees → companies
-- schedules → employees
-- appointments → companies, clients, employees
-- appointment_services → appointments, service_catalog
-- cash_registers → companies
-- payments → appointments, cash_registers
-- expenses → companies, cash_registers
-- invoices → appointments
-- promotions → companies
-- promotion_services → promotions, service_catalog

-- ========================================
-- RELACIONES IMPORTANTES
-- ========================================

-- 1 empresa → N usuarios
-- 1 empresa → N servicios
-- 1 empresa → N clientes
-- 1 empresa → N empleados
-- 1 empleado → N horarios
-- 1 cliente → N citas
-- 1 empleado → N citas
-- 1 cita → N servicios (appointment_services)
-- 1 empresa → N cajas
-- 1 caja → N pagos
-- 1 caja → N gastos
-- 1 cita → 1 factura
-- 1 empresa → N promociones
-- 1 promoción → N servicios (promotion_services)

-- ========================================
-- ESTADOS
-- ========================================

-- companies:    ACTIVE, INACTIVE
-- users:        ACTIVE, INACTIVE
-- appointments: SCHEDULED, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW
-- cash_registers: OPEN, CLOSED
-- invoices:     PENDING, PAID, CANCELLED
-- promotions:   ACTIVE, INACTIVE
-- servicios:    ACTIVE, INACTIVE
-- employees:    ACTIVE, INACTIVE
-- clients:      ACTIVE, INACTIVE
