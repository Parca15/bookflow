# BookFlow — Diagrama Entidad-Relación

> Generado en la auditoría del 26/08/2026 a partir de las entidades JPA reales (`@Entity`) y migraciones Flyway V1–V14.

```mermaid
erDiagram
    COMPANIES ||--o{ USERS : "tiene"
    COMPANIES ||--o{ CLIENTS : "tiene"
    COMPANIES ||--o{ EMPLOYEES : "tiene"
    COMPANIES ||--o{ CATALOG : "ofrece"
    COMPANIES ||--o{ CASH_REGISTERS : "opera"
    COMPANIES ||--o{ APPOINTMENTS : "agenda"
    COMPANIES ||--o{ EXPENSES : "registra"
    COMPANIES ||--o{ PROMOTIONS : "define"
    COMPANIES ||--o{ INVOICES : "emite"

    CLIENTS ||--o{ APPOINTMENTS : "solicita"
    CLIENTS ||--o{ INVOICES : "recibe"

    EMPLOYEES ||--o{ SCHEDULES : "trabaja"
    EMPLOYEES ||--o{ APPOINTMENTS : "atiende"

    APPOINTMENTS ||--|{ APPOINTMENT_ITEMS : "incluye"
    CATALOG ||--o{ APPOINTMENT_ITEMS : "se presta"
    CATALOG }o--o{ PROMOTIONS : "aplica"

    APPOINTMENTS ||--o{ PAYMENTS : "paga"
    APPOINTMENTS ||--o| INVOICES : "factura"
    CASH_REGISTERS ||--o{ PAYMENTS : "recibe"
    CASH_REGISTERS ||--o{ EXPENSES : "descuenta"

    USERS {
        bigint id PK
        bigint company_id FK
        string email UK
        string password "BCrypt"
        string full_name
        enum role "ADMIN,MANAGER,RECEPTIONIST,EMPLOYEE"
        enum status
        timestamp created_at
    }

    COMPANIES {
        bigint id PK
        string business_name
        string document_number UK
        enum status
    }

    CASH_REGISTERS {
        bigint id PK
        bigint company_id FK
        decimal opening_amount
        decimal closing_amount
        timestamp opening_date
        timestamp closing_date
        enum status "OPEN,CLOSED (índice parcial: 1 OPEN por empresa)"
    }

    APPOINTMENTS {
        bigint id PK
        bigint company_id FK
        bigint client_id FK
        bigint employee_id FK
        date appointment_date
        time start_time
        time end_time
        enum status "SCHEDULED,CONFIRMED,IN_PROGRESS,COMPLETED,CANCELLED,NO_SHOW"
    }

    APPOINTMENT_ITEMS {
        bigint id PK
        bigint appointment_id FK
        bigint catalog_id FK
        decimal price_at_sale
    }

    PAYMENTS {
        bigint id PK
        bigint appointment_id FK
        bigint cash_register_id FK "nullable - asignada automáticamente (caja OPEN)"
        decimal amount
        enum method "CASH,CARD,TRANSFER,OTHER"
    }

    EXPENSES {
        bigint id PK
        bigint company_id FK
        bigint cash_register_id FK
        enum category "PAYROLL,UTILITIES,RENT,SUPPLIES,MAINTENANCE,TRANSPORT,OTHER"
        decimal amount
        enum method "CASH,CARD,TRANSFER,OTHER"
    }

    PROMOTIONS {
        bigint id PK
        bigint company_id FK
        string name
        enum type "DISCOUNT,PACKAGE,COUPON"
        enum discount_type "PERCENTAGE,FIXED"
        decimal discount_value
        string code "UK compuesto (company_id, code)"
        datetime start_date
        datetime end_date
        integer max_uses
        integer used_count
        enum status
    }

    INVOICES {
        bigint id PK
        bigint appointment_id FK "UK - 1 factura por cita"
        string invoice_number UK
        datetime issue_date
        decimal subtotal
        decimal total
    }

    SCHEDULES {
        bigint id PK
        bigint employee_id FK
        enum day_of_week
        time start_time
        time end_time
        enum status
    }
```

## Fórmulas financieras implementadas

```
expectedCash   = openingAmount + Σ pagos CASH − Σ gastos CASH
cashDifference = closingAmount − expectedCash
netResult      = Σ pagos (todos los métodos) − Σ gastos (todos los métodos)
```

*Nota: el resumen financiero se calcula en tiempo real en `CashRegisterServiceImpl.toResponse()`, no se persiste.*
