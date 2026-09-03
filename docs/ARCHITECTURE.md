# Arquitectura de BookFlow

## Diagrama de Componentes

```mermaid
graph TB
    subgraph "Frontend"
        A[React 19 + Vite] --> B[React Router]
        A --> C[Axios HTTP Client]
        A --> D[Tailwind CSS]
        A --> E[Framer Motion]
    end

    subgraph "Backend - Spring Boot 3.5"
        F[Security Config] --> G[JWT Filter]
        F --> H[Tenant Filter]
        G --> I[Auth Controller]
        H --> I
        
        I --> J[Auth Service]
        J --> K[User Repository]
        J --> L[Role Repository]
        
        M[Appointment Controller] --> N[Appointment Service]
        N --> O[Appointment Repository]
        N --> P[Schedule Service]
        
        Q[Client Controller] --> R[Client Service]
        S[Employee Controller] --> T[Employee Service]
        U[Catalog Controller] --> V[Catalog Service]
        
        W[Payment Controller] --> X[Payment Service]
        Y[Cash Controller] --> Z[Cash Service]
        
        AA[Report Controller] --> AB[Report Service]
        AC[Invoice Controller] --> AD[Invoice Service]
    end

    subgraph "Database"
        O --> AE[(PostgreSQL 17)]
        K --> AE
        R --> AE
        T --> AE
        V --> AE
        X --> AE
        Z --> AE
    end

    A -->|"HTTP/REST"| I
    A -->|"HTTP/REST"| M
    A -->|"HTTP/REST"| Q
    A -->|"HTTP/REST"| S
    A -->|"HTTP/REST"| U
    A -->|"HTTP/REST"| W
    A -->|"HTTP/REST"| Y
    A -->|"HTTP/REST"| AA
    A -->|"HTTP/REST"| AC
```

## Flujo de Autenticación

```mermaid
sequenceDiagram
    participant C as Client
    participant API as API Gateway
    participant Auth as Auth Service
    participant DB as Database

    C->>API: POST /auth/login (email, password)
    API->>Auth: authenticate(email, password)
    Auth->>DB: findByEmail(email)
    DB-->>Auth: User + Role + Permissions
    Auth->>Auth: Validate password (BCrypt)
    Auth->>Auth: Generate JWT Token
    Auth-->>API: AuthResponse (token, user, permissions)
    API-->>C: 200 OK + JWT Token

    loop Every Request
        C->>API: GET /resource + Bearer Token
        API->>API: JWT Filter (validate token)
        API->>API: Tenant Filter (validate companyId)
        API->>API: @PreAuthorize (check role/permission)
        API-->>C: 200 OK (data)
    end
```

## Modelo Multi-Tenant

```mermaid
erDiagram
    COMPANY ||--o{ USER : has
    COMPANY ||--o{ CLIENT : has
    COMPANY ||--o{ EMPLOYEE : has
    COMPANY ||--o{ CATALOG : has
    COMPANY ||--o{ APPOINTMENT : has
    COMPANY ||--o{ CASH_REGISTER : has
    COMPANY ||--o{ EXPENSE : has
    COMPANY ||--o{ PROMOTION : has
    
    USER }o--|| ROLE : has
    ROLE ||--o{ ROLE_PERMISSION : has
    ROLE_PERMISSION }o--|| PERMISSION_MODULE : references
    
    APPOINTMENT ||--o{ APPOINTMENT_ITEM : contains
    APPOINTMENT ||--o{ PAYMENT : has
    APPOINTMENT ||--|| INVOICE : has
    
    EMPLOYEE ||--o{ SCHEDULE : has
    CASH_REGISTER ||--o{ PAYMENT : contains
    CASH_REGISTER ||--o{ EXPENSE : contains

    COMPANY {
        long id PK
        string business_name
        string document_number
        string document_type
        string address
        string phone
        string email
        string status
    }

    USER {
        long id PK
        long company_id FK
        string email
        string password
        string full_name
        long role_id FK
        string status
    }

    ROLE {
        long id PK
        string name
        string display_name
        int level
        boolean is_system
        long company_id FK
    }

    APPOINTMENT {
        long id PK
        long company_id FK
        long client_id FK
        long employee_id FK
        date appointment_date
        time start_time
        time end_time
        string status
    }
```

## Arquitectura en Capas

```
┌─────────────────────────────────────────────────────┐
│                    PRESENTATION                      │
│  ┌─────────────────────────────────────────────┐    │
│  │  React Components (Pages, Layout, Modals)   │    │
│  └─────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────┐    │
│  │  Services (API calls with Axios)            │    │
│  └─────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────┤
│                     BUSINESS                         │
│  ┌─────────────────────────────────────────────┐    │
│  │  Controllers (REST endpoints)               │    │
│  │  - @PreAuthorize (role-based access)        │    │
│  │  - @Valid (input validation)                │    │
│  └─────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────┐    │
│  │  Services (business logic)                  │    │
│  │  - @Transactional (data integrity)          │    │
│  └─────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────┤
│                      DATA                            │
│  ┌─────────────────────────────────────────────┐    │
│  │  Repositories (Spring Data JPA)             │    │
│  └─────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────┐    │
│  │  Entities (JPA + Hibernate)                 │    │
│  └─────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────┐    │
│  │  Migrations (Flyway V1-V18)                 │    │
│  └─────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────┤
│                  SECURITY LAYER                      │
│  ┌─────────────────────────────────────────────┐    │
│  │  JWT Authentication Filter                  │    │
│  │  Tenant Isolation Filter                    │    │
│  │  Role-Based Authorization (@PreAuthorize)   │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

## Stack Tecnológico

| Capa | Tecnología | Propósito |
|------|-----------|-----------|
| Frontend | React 19 + Vite 6 | SPA moderna con HMR |
| Routing | React Router 7 | Navegación client-side |
| HTTP | Axios | Comunicación con API |
| Estilos | Tailwind CSS 4 | Utility-first CSS |
| Animaciones | Framer Motion | Transiciones suaves |
| Backend | Spring Boot 3.5 | API REST robusta |
| Seguridad | Spring Security + JWT | Autenticación stateless |
| ORM | Spring Data JPA + Hibernate | Mapeo objeto-relacional |
| DB | PostgreSQL 17 | Base de datos transaccional |
| Migraciones | Flyway | Versionado de esquema |
| API Docs | Springdoc OpenAPI | Swagger UI automático |
| Testing | JUnit 5 + Mockito | Tests unitarios e integración |

## Decisiones de Diseño

### Multi-Tenant con `company_id`
- **Por qué**: Aislamiento completo de datos por empresa sin complejidad de esquemas separados
- **Cómo**: Cada tabla tiene `company_id` como FK, el `TenantFilter` valida acceso
- **Ventaja**: Simple, eficiente, fácil de mantener

### JWT Stateless
- **Por qué**: Escalabilidad horizontal, sin sesiones en servidor
- **Cómo**: Token contiene email, se valida en cada request
- **Consideración**: Token blacklist para revocación (pendiente)

### Roles jerárquicos con niveles
- **Por qué**: Control granular de acceso sin configuración compleja
- **Cómo**: Nivel numérico (20-100), `@PreAuthorize` verifica nivel mínimo
- **Ejemplo**: EMPLOYEE(20) < RECEPTIONIST(40) < MANAGER(60) < ADMIN(80) < SUPER_ADMIN(100)

### Flyway para migraciones
- **Por qué**: Versionado controlado del esquema, reproducibilidad
- **Cómo**: Archivos SQL versionados (V1-V18), ejecución automática
- **Ventaja**: Histórico completo de cambios en BD
