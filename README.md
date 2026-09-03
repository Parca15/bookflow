# BookFlow

Sistema de gestión integral para salones de belleza y barberías. Multi-empresa, multi-tenant con roles y permisos.

[![Java](https://img.shields.io/badge/Java-21-ED8B00?style=flat&logo=openjdk&logoColor=white)](https://openjdk.org/projects/jdk/21/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.4-6DB33F?style=flat&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Características

### Seguridad
- **Multi-tenant aislado**: Validación de empresa en cada request mediante TenantFilter
- **Autorización por roles**: 5 roles jerárquicos con 11 módulos de permisos
- **JWT Stateless**: Tokens seguros con Spring Security
- **Política de contraseñas**: Mínimo 8 caracteres con mayúsculas, minúsculas y números
- **Protección de endpoints**: `@PreAuthorize` en cada controlador

### Funcionalidades
- **Calendario**: Vista mensual con creación de citas desde el calendario
- **Gestión de Citas**: Flujo completo SCHEDULED → CONFIRMED → IN_PROGRESS → COMPLETED
- **Catálogo de Servicios**: CRUD completo con precios y duración
- **Clientes y Empleados**: Gestión con historial
- **Pagos**: Múltiples métodos (efectivo, tarjeta, transferencia), abonos parciales
- **Caja**: Apertura/cierre con cálculo automático de diferencias
- **Gastos**: Registro y categorización de gastos
- **Reportes**: Diarios y mensuales con exportación a PDF
- **Promociones**: Descuentos, paquetes, cupones con vigencia
- **Facturación**: Generación automática de facturas con PDF

### Frontend
- **Componentes reutilizables**: Modal, LoadingSpinner, ErrorBoundary
- **Lazy Loading**: Carga optimizada de páginas con React.lazy
- **Animaciones**: Transiciones suaves con Framer Motion
- **Ruta 404**: Página de error personalizada

## Stack Tecnológico

### Backend

| Componente | Tecnología |
|------------|------------|
| Lenguaje | Java 21 |
| Framework | Spring Boot 3.5.4 |
| Base de datos | PostgreSQL 17 |
| ORM | Spring Data JPA, Hibernate |
| Migraciones | Flyway (V1-V18) |
| Seguridad | Spring Security, JWT, @PreAuthorize |
| API Docs | Springdoc OpenAPI |
| Testing | JUnit 5, Mockito |

### Frontend

| Componente | Tecnología |
|------------|------------|
| Framework | React 19 |
| Bundler | Vite 6 |
| Routing | React Router DOM 7 |
| HTTP Client | Axios |
| Estilos | Tailwind CSS 4 |
| Iconos | Lucide React |
| Animaciones | Framer Motion |
| PDF | html2pdf.js |
| Fechas | date-fns |

## Arquitectura

📖 **[Ver documentación completa de arquitectura](docs/ARCHITECTURE.md)**

```
┌─────────────────────────────────────────────────────┐
│                    PRESENTATION                      │
│  React Components → Services (Axios)                │
├─────────────────────────────────────────────────────┤
│                     BUSINESS                         │
│  Controllers (@PreAuthorize) → Services              │
├─────────────────────────────────────────────────────┤
│                      DATA                            │
│  Repositories → Entities → Migrations (Flyway)      │
├─────────────────────────────────────────────────────┤
│                  SECURITY LAYER                      │
│  JWT Filter → Tenant Filter → Role Authorization    │
└─────────────────────────────────────────────────────┘
```

## Requisitos Previos

- Java 21+
- Maven 3.9+
- Node.js 18+
- Docker (para PostgreSQL)
- Git

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/Parca15/bookflow.git
cd bookflow
```

### 2. Levantar PostgreSQL

```bash
cd docker
docker-compose up -d
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env
# Editar .env con tus valores (JWT_SECRET debe tener al menos 32 caracteres)
```

### 4. Compilar y ejecutar el backend

```bash
cd backend
mvn clean package -DskipTests
java -jar target/backend-0.0.1-SNAPSHOT.jar
```

El backend estará disponible en: `http://localhost:8080`

### 5. Ejecutar el frontend (desarrollo)

```bash
cd frontend
npm install
npm run dev
```

El frontend estará disponible en: `http://localhost:5173`

### 6. Credenciales por defecto

| Campo | Valor |
|-------|-------|
| Email | admin@bookflow.com |
| Contraseña | Admin123 |

## Estructura del Proyecto

```
bookflow/
├── docker/
│   └── docker-compose.yml
├── backend/
│   ├── src/main/java/com/bookflow/
│   │   ├── auth/           # Autenticación JWT, roles, permisos
│   │   │   ├── controller/ # AuthController, RoleController
│   │   │   ├── service/    # AuthService, RoleService, CurrentUserService
│   │   │   ├── security/   # JwtTokenProvider, JwtAuthenticationFilter
│   │   │   └── entity/     # User, Role, PermissionModule
│   │   ├── appointment/    # Gestión de citas con estados
│   │   ├── cash/           # Caja
│   │   ├── catalog/        # Catálogo de servicios
│   │   ├── client/         # Clientes e historial
│   │   ├── company/        # Empresas (multi-tenant)
│   │   ├── common/
│   │   │   ├── config/     # SecurityConfig, TenantFilter
│   │   │   └── exception/  # GlobalExceptionHandler
│   │   ├── employee/       # Empleados
│   │   ├── expense/        # Gastos
│   │   ├── invoice/        # Facturación
│   │   ├── payment/        # Pagos
│   │   ├── promotion/      # Promociones
│   │   └── report/         # Reportes diarios/mensuales
│   └── src/main/resources/db/migration/  # Flyway V1-V18
├── frontend/
│   ├── src/
│   │   ├── components/     # Componentes reutilizables
│   │   │   ├── Modal.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── ErrorBoundary.jsx
│   │   │   ├── Layout.jsx
│   │   │   └── BentoCard.jsx
│   │   ├── context/        # AuthContext (con validación de token)
│   │   ├── pages/          # Páginas de la aplicación
│   │   ├── services/       # Servicios API
│   │   └── utils/          # Utilidades compartidas
│   │       └── format.js   # fmt, statusColors, statusLabels
│   └── vite.config.js
├── docs/
│   └── ARCHITECTURE.md     # Documentación de arquitectura
└── .env.example
```

## Seguridad

### Flujo de Autenticación

```
1. Cliente envía credenciales → POST /auth/login
2. Backend valida con BCrypt → Genera JWT
3. Cliente almacena token → Envía en cada request
4. JwtAuthenticationFilter valida token
5. TenantFilter valida acceso a empresa
6. @PreAuthorize verifica rol/permiso
```

### Roles y Permisos

| Rol | Nivel | Acceso |
|-----|-------|--------|
| `SUPER_ADMIN` | 100 | Todo el sistema, todas las empresas |
| `ADMIN` | 80 | Control total de su empresa |
| `MANAGER` | 60 | Gestión de operaciones |
| `RECEPTIONIST` | 40 | Recepción, citas, clientes |
| `EMPLOYEE` | 20 | Consulta limitada |

### Módulos de permisos

`DASHBOARD` `CALENDAR` `EXPENSES` `CASH_REGISTER` `CLIENTS` `CATALOG` `EMPLOYEES` `PROMOTIONS` `COMPANIES` `USERS` `REPORTS`

## Endpoints principales

<details>
<summary>Ver todos los endpoints</summary>

### Autenticación

| Método | URL | Descripción | Permisos |
|--------|-----|-------------|----------|
| POST | `/api/v1/auth/login` | Login | Público |
| POST | `/api/v1/auth/register` | Registrar usuario | ADMIN, SUPER_ADMIN |
| GET | `/api/v1/auth/companies/{companyId}/users` | Listar usuarios | ADMIN, MANAGER, SUPER_ADMIN |
| PATCH | `/api/v1/auth/users/{id}/deactivate` | Desactivar usuario | ADMIN, SUPER_ADMIN |
| PATCH | `/api/v1/auth/users/{id}/activate` | Activar usuario | ADMIN, SUPER_ADMIN |
| DELETE | `/api/v1/auth/users/{id}` | Eliminar usuario | ADMIN, SUPER_ADMIN |

### Roles

| Método | URL | Descripción | Permisos |
|--------|-----|-------------|----------|
| GET | `/api/v1/roles?companyId={id}` | Listar roles | ADMIN, MANAGER, SUPER_ADMIN |
| POST | `/api/v1/roles?companyId={id}` | Crear rol | ADMIN, SUPER_ADMIN |
| PUT | `/api/v1/roles/{id}` | Actualizar rol | ADMIN, SUPER_ADMIN |
| DELETE | `/api/v1/roles/{id}` | Eliminar rol | ADMIN, SUPER_ADMIN |

### Empresas

| Método | URL | Descripción | Permisos |
|--------|-----|-------------|----------|
| POST | `/api/v1/companies` | Crear empresa | SUPER_ADMIN |
| GET | `/api/v1/companies` | Listar activas | SUPER_ADMIN |
| GET | `/api/v1/companies/{id}` | Obtener empresa | ADMIN, SUPER_ADMIN |
| PUT | `/api/v1/companies/{id}` | Actualizar empresa | ADMIN, SUPER_ADMIN |
| DELETE | `/api/v1/companies/{id}` | Desactivar empresa | SUPER_ADMIN |

### Citas

| Método | URL | Descripción | Permisos |
|--------|-----|-------------|----------|
| POST | `/api/v1/appointments/company/{companyId}` | Crear cita | ADMIN, MANAGER, RECEPTIONIST |
| GET | `/api/v1/appointments/company/{companyId}` | Listar citas | Todos autenticados |
| PATCH | `/api/v1/appointments/company/{companyId}/{id}/confirm` | Confirmar cita | ADMIN, MANAGER, RECEPTIONIST |
| PATCH | `/api/v1/appointments/company/{companyId}/{id}/start` | Iniciar cita | ADMIN, MANAGER, RECEPTIONIST, EMPLOYEE |
| PATCH | `/api/v1/appointments/company/{companyId}/{id}/complete` | Completar cita | ADMIN, MANAGER, RECEPTIONIST, EMPLOYEE |
| PATCH | `/api/v1/appointments/company/{companyId}/{id}/cancel` | Cancelar cita | ADMIN, MANAGER, RECEPTIONIST |
| PATCH | `/api/v1/appointments/company/{companyId}/{id}/no-show` | Marcar no-show | ADMIN, MANAGER, RECEPTIONIST |

### Clientes

| Método | URL | Descripción | Permisos |
|--------|-----|-------------|----------|
| POST | `/api/v1/companies/{companyId}/clients` | Crear cliente | ADMIN, MANAGER, RECEPTIONIST |
| GET | `/api/v1/companies/{companyId}/clients` | Listar clientes | Todos autenticados |
| PUT | `/api/v1/companies/{companyId}/clients/{id}` | Actualizar cliente | ADMIN, MANAGER, RECEPTIONIST |
| DELETE | `/api/v1/companies/{companyId}/clients/{id}` | Desactivar cliente | ADMIN, MANAGER |

### Empleados

| Método | URL | Descripción | Permisos |
|--------|-----|-------------|----------|
| POST | `/api/v1/companies/{companyId}/employees` | Crear empleado | ADMIN, MANAGER |
| GET | `/api/v1/companies/{companyId}/employees` | Listar empleados | ADMIN, MANAGER, RECEPTIONIST |
| PUT | `/api/v1/companies/{companyId}/employees/{id}` | Actualizar empleado | ADMIN, MANAGER |
| DELETE | `/api/v1/companies/{companyId}/employees/{id}` | Eliminar empleado | ADMIN, MANAGER |

### Pagos

| Método | URL | Descripción | Permisos |
|--------|-----|-------------|----------|
| POST | `/api/v1/companies/{companyId}/payments/appointment/{appointmentId}` | Crear pago | ADMIN, MANAGER, RECEPTIONIST |
| GET | `/api/v1/companies/{companyId}/payments/appointment/{appointmentId}/balance` | Saldo pendiente | ADMIN, MANAGER |

### Caja

| Método | URL | Descripción | Permisos |
|--------|-----|-------------|----------|
| POST | `/api/v1/companies/{companyId}/cash-registers` | Abrir caja | ADMIN, MANAGER |
| GET | `/api/v1/companies/{companyId}/cash-registers/open` | Caja abierta | ADMIN, MANAGER, RECEPTIONIST |
| PUT | `/api/v1/companies/{companyId}/cash-registers/{id}/close` | Cerrar caja | ADMIN, MANAGER |

### Reportes

| Método | URL | Descripción | Permisos |
|--------|-----|-------------|----------|
| GET | `/api/v1/companies/{companyId}/reports/daily?date=YYYY-MM-DD` | Reporte diario | ADMIN, MANAGER |
| GET | `/api/v1/companies/{companyId}/reports/monthly?year=YYYY&month=MM` | Reporte mensual | ADMIN, MANAGER |

### Promociones

| Método | URL | Descripción | Permisos |
|--------|-----|-------------|----------|
| POST | `/api/v1/companies/{companyId}/promotions` | Crear promoción | ADMIN, MANAGER |
| GET | `/api/v1/companies/{companyId}/promotions` | Listar promociones | ADMIN, MANAGER, RECEPTIONIST |
| GET | `/api/v1/companies/{companyId}/promotions/code/{code}` | Buscar por código | ADMIN, MANAGER, RECEPTIONIST |

</details>

## Flujo de Trabajo

```
1. Crear empresa → 2. Registrar usuario → 3. Login
4. Crear catálogo → 5. Crear empleados → 6. Crear horarios
7. Abrir caja → 8. Registrar clientes → 9. Agendar citas
10. Completar citas → 11. Registrar pagos → 12. Generar facturas
13. Registrar gastos → 14. Cerrar caja → 15. Consultar reportes
```

## Variables de Entorno

| Variable | Descripción | Default |
|----------|-------------|---------|
| `JWT_SECRET` | Secreto para tokens JWT (mín. 32 chars) | (ver .env.example) |
| `CORS_ORIGINS` | Orígenes permitidos (separados por coma) | `http://localhost:3000,http://localhost:5173` |
| `VITE_API_URL` | URL del backend para el frontend | `http://localhost:8080` |

## Swagger UI

Disponible en: `http://localhost:8080/swagger-ui.html`

## Licencia

MIT License - BookFlow
