# BookFlow

Sistema de gestión integral para salones de belleza y barberías. Multi-empresa, multi-tenant.

## Características

- **Multi-empresa**: Aislamiento completo de datos por empresa
- **JWT Authentication**: Login/registro con tokens JWT
- **Gestión de Citas**: Agendar, confirmar, completar, cancelar citas
- **Catálogo de Servicios**: CRUD completo con precios
- **Clientes y Empleados**: Gestión con historial
- **Pagos**: Múltiples métodos (efectivo, tarjeta, transferencia)
- **Caja**: Apertura/cierre con cálculo automático de diferencias
- **Gastos**: Registro y categorización de gastos
- **Reportes**: Diarios y mensuales con métricas financieras
- **Promociones**: Descuentos, paquetes, cupones con vigencia
- **Facturación**: Generación automática de facturas

## Stack Tecnológico

| Componente | Tecnología |
|------------|------------|
| Backend | Java 21, Spring Boot 3.5.4 |
| Base de datos | PostgreSQL 17 |
| ORM | Spring Data JPA, Hibernate |
| Migraciones | Flyway |
| Seguridad | Spring Security, JWT (jjwt) |
| API Docs | Springdoc OpenAPI |
| Testing | JUnit 5, Mockito, H2 |

## Requisitos Previos

- Java 21+
- Maven 3.9+
- Docker (para PostgreSQL)
- Git

## Instalación

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd bookflow
```

### 2. Levantar PostgreSQL

```bash
cd docker
docker-compose up -d
```

Esto crea una base de datos PostgreSQL con:
- **Host**: localhost:5432
- **Database**: bookflow
- **User**: bookflow
- **Password**: bookflow123

### 3. Compilar el backend

```bash
cd backend
mvn clean package -DskipTests
```

### 4. Ejecutar la aplicación

```bash
java -jar target/backend-0.0.1-SNAPSHOT.jar
```

La aplicación estará disponible en: `http://localhost:8080`

### 5. Ejecutar tests

```bash
mvn test
```

## Estructura del Proyecto

```
bookflow/
├── docker/
│   └── docker-compose.yml
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/bookflow/
│   │   │   │   ├── auth/           # Autenticación JWT
│   │   │   │   ├── appointment/    # Gestión de citas
│   │   │   │   ├── cash/           # Caja
│   │   │   │   ├── catalog/        # Catálogo de servicios
│   │   │   │   ├── client/         # Clientes e historial
│   │   │   │   ├── company/        # Empresas
│   │   │   │   ├── common/         # Excepciones, config
│   │   │   │   ├── employee/       # Empleados
│   │   │   │   ├── expense/        # Gastos
│   │   │   │   ├── invoice/        # Facturación
│   │   │   │   ├── payment/        # Pagos
│   │   │   │   ├── promotion/      # Promociones
│   │   │   │   └── report/         # Reportes
│   │   │   └── resources/
│   │   │       ├── application.properties
│   │   │       └── db/migration/   # Flyway V1-V14
│   │   └── test/                   # Tests unitarios e integración
│   └── pom.xml
└── .opencode/plans/plan.md
```

## Autenticación

### Registrar usuario

```bash
POST /api/v1/auth/register
Content-Type: application/json

{
  "companyId": 1,
  "email": "admin@salon.com",
  "password": "123456",
  "fullName": "Admin Salon",
  "role": "ADMIN"
}
```

### Login

```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@salon.com",
  "password": "123456"
}
```

Respuesta:
```json
{
  "token": "eyJhbGciOiJIUz...",
  "tokenType": "Bearer",
  "userId": 1,
  "email": "admin@salon.com",
  "fullName": "Admin Salon",
  "role": "ADMIN",
  "companyId": 1,
  "companyName": "Salón Belleza"
}
```

### Usar el token

Incluir el header `Authorization` en todos los requests protegidos:

```
Authorization: Bearer eyJhbGciOiJIUz...
```

### Roles

| Rol | Descripción |
|-----|-------------|
| `ADMIN` | Control total de la empresa |
| `MANAGER` | Gestión de operaciones |
| `RECEPTIONIST` | Recepción y citas |
| `EMPLOYEE` | Empleados del salón |

## Endpoints

### Autenticación (Públicos)

| Método | URL | Descripción |
|--------|-----|-------------|
| POST | `/api/v1/auth/register` | Registrar usuario |
| POST | `/api/v1/auth/login` | Login |

### Empresas

| Método | URL | Descripción |
|--------|-----|-------------|
| POST | `/api/v1/companies` | Crear empresa |
| GET | `/api/v1/companies` | Listar empresas |
| GET | `/api/v1/companies/{id}` | Obtener empresa |
| PUT | `/api/v1/companies/{id}` | Actualizar empresa |
| DELETE | `/api/v1/companies/{id}` | Eliminar empresa |
| PATCH | `/api/v1/companies/{id}/activate` | Activar empresa |

### Catálogo de Servicios

| Método | URL | Descripción |
|--------|-----|-------------|
| POST | `/api/v1/companies/{companyId}/catalog` | Crear servicio |
| GET | `/api/v1/companies/{companyId}/catalog` | Listar servicios activos |
| GET | `/api/v1/companies/{companyId}/catalog/{id}` | Obtener servicio |
| PUT | `/api/v1/companies/{companyId}/catalog/{id}` | Actualizar servicio |
| DELETE | `/api/v1/companies/{companyId}/catalog/{id}` | Eliminar servicio |
| PATCH | `/api/v1/companies/{companyId}/catalog/{id}/activate` | Activar servicio |

### Clientes

| Método | URL | Descripción |
|--------|-----|-------------|
| POST | `/api/v1/companies/{companyId}/clients` | Crear cliente |
| GET | `/api/v1/companies/{companyId}/clients` | Listar clientes activos |
| GET | `/api/v1/companies/{companyId}/clients/{id}` | Obtener cliente |
| PUT | `/api/v1/companies/{companyId}/clients/{id}` | Actualizar cliente |
| DELETE | `/api/v1/companies/{companyId}/clients/{id}` | Eliminar cliente |
| PATCH | `/api/v1/companies/{companyId}/clients/{id}/activate` | Activar cliente |
| GET | `/api/v1/companies/{companyId}/clients/document/{doc}` | Buscar por documento |
| GET | `/api/v1/companies/{companyId}/clients/{id}/history` | Historial del cliente |

### Empleados

| Método | URL | Descripción |
|--------|-----|-------------|
| POST | `/api/v1/companies/{companyId}/employees` | Crear empleado |
| GET | `/api/v1/companies/{companyId}/employees` | Listar empleados activos |
| GET | `/api/v1/companies/{companyId}/employees/{id}` | Obtener empleado |
| PUT | `/api/v1/companies/{companyId}/employees/{id}` | Actualizar empleado |
| DELETE | `/api/v1/companies/{companyId}/employees/{id}` | Eliminar empleado |
| PATCH | `/api/v1/companies/{companyId}/employees/{id}/activate` | Activar empleado |
| GET | `/api/v1/companies/{companyId}/employees/document/{doc}` | Buscar por documento |

### Horarios

| Método | URL | Descripción |
|--------|-----|-------------|
| POST | `/api/v1/companies/{companyId}/employees/{employeeId}/schedules` | Crear horario |
| GET | `/api/v1/companies/{companyId}/employees/{employeeId}/schedules` | Listar horarios |
| GET | `/api/v1/companies/{companyId}/schedules/{id}` | Obtener horario |
| PUT | `/api/v1/companies/{companyId}/schedules/{id}` | Actualizar horario |
| DELETE | `/api/v1/companies/{companyId}/schedules/{id}` | Eliminar horario |
| PATCH | `/api/v1/companies/{companyId}/schedules/{id}/activate` | Activar horario |

### Citas

| Método | URL | Descripción |
|--------|-----|-------------|
| POST | `/api/appointments/company/{companyId}` | Crear cita |
| GET | `/api/appointments/company/{companyId}` | Listar citas |
| GET | `/api/appointments/company/{companyId}/{id}` | Obtener cita |
| PUT | `/api/appointments/company/{companyId}/{id}` | Actualizar cita |
| PATCH | `/api/appointments/company/{companyId}/{id}/confirm` | Confirmar cita |
| PATCH | `/api/appointments/company/{companyId}/{id}/start` | Iniciar cita |
| PATCH | `/api/appointments/company/{companyId}/{id}/complete` | Completar cita |
| PATCH | `/api/appointments/company/{companyId}/{id}/cancel` | Cancelar cita |
| PATCH | `/api/appointments/company/{companyId}/{id}/no-show` | Marcar no-show |
| GET | `/api/appointments/client/{clientId}` | Citas por cliente |
| GET | `/api/appointments/employee/{employeeId}` | Citas por empleado |

### Pagos

| Método | URL | Descripción |
|--------|-----|-------------|
| POST | `/api/v1/companies/{companyId}/payments/appointment/{appointmentId}` | Crear pago |
| GET | `/api/v1/companies/{companyId}/payments/{paymentId}` | Obtener pago |
| GET | `/api/v1/companies/{companyId}/payments/appointment/{appointmentId}` | Pagos por cita |
| GET | `/api/v1/companies/{companyId}/payments/appointment/{appointmentId}/total` | Total pagado |
| GET | `/api/v1/companies/{companyId}/payments/appointment/{appointmentId}/balance` | Saldo pendiente |

### Caja

| Método | URL | Descripción |
|--------|-----|-------------|
| POST | `/api/v1/companies/{companyId}/cash-registers` | Abrir caja |
| GET | `/api/v1/companies/{companyId}/cash-registers/open` | Caja abierta actual |
| GET | `/api/v1/companies/{companyId}/cash-registers` | Historial de cajas |
| GET | `/api/v1/companies/{companyId}/cash-registers/{cashRegisterId}` | Obtener caja |
| PUT | `/api/v1/companies/{companyId}/cash-registers/{cashRegisterId}/close` | Cerrar caja |

### Gastos

| Método | URL | Descripción |
|--------|-----|-------------|
| POST | `/api/v1/companies/{companyId}/expenses` | Crear gasto |
| GET | `/api/v1/companies/{companyId}/expenses` | Listar gastos |
| GET | `/api/v1/companies/{companyId}/expenses/{expenseId}` | Obtener gasto |
| GET | `/api/v1/companies/{companyId}/expenses/cash-register/{cashRegisterId}` | Gastos por caja |

### Facturación

| Método | URL | Descripción |
|--------|-----|-------------|
| POST | `/api/v1/companies/{companyId}/invoices/appointment/{appointmentId}` | Crear factura |
| GET | `/api/v1/companies/{companyId}/invoices/{id}` | Obtener factura |
| GET | `/api/v1/companies/{companyId}/invoices/appointment/{appointmentId}` | Factura por cita |
| PATCH | `/api/v1/companies/{companyId}/invoices/{id}/cancel` | Cancelar factura |

### Reportes

| Método | URL | Descripción |
|--------|-----|-------------|
| GET | `/api/v1/companies/{companyId}/reports/daily?date=YYYY-MM-DD` | Reporte diario |
| GET | `/api/v1/companies/{companyId}/reports/monthly?year=YYYY&month=MM` | Reporte mensual |

### Promociones

| Método | URL | Descripción |
|--------|-----|-------------|
| POST | `/api/v1/companies/{companyId}/promotions` | Crear promoción |
| GET | `/api/v1/companies/{companyId}/promotions` | Listar promociones |
| GET | `/api/v1/companies/{companyId}/promotions/active` | Listar activas |
| GET | `/api/v1/companies/{companyId}/promotions/{promotionId}` | Obtener promoción |
| PUT | `/api/v1/companies/{companyId}/promotions/{promotionId}` | Actualizar promoción |
| PATCH | `/api/v1/companies/{companyId}/promotions/{promotionId}/deactivate` | Desactivar |
| GET | `/api/v1/companies/{companyId}/promotions/code/{code}` | Buscar por código |

### Usuarios

| Método | URL | Descripción |
|--------|-----|-------------|
| GET | `/api/v1/auth/companies/{companyId}/users` | Listar usuarios |

## Swagger UI

Disponible en: `http://localhost:8080/swagger-ui.html`

## Flujo de Trabajo Típico

```
1. Crear empresa
2. Registrar usuario (admin)
3. Login → obtener token JWT
4. Crear catálogo de servicios
5. Crear empleados
6. Crear horarios
7. Abrir caja del día
8. Registrar clientes
9. Agendar citas
10. Confirmar/asistir/completar citas
11. Registrar pagos
12. Generar facturas
13. Registrar gastos
14. Cerrar caja
15. Consultar reportes
```

## Fórmulas Financieras

```
CAJA:
expectedCash = openingAmount + cashPayments - cashExpenses
cashDifference = closingAmount - expectedCash

REPORTE:
totalPayments = CASH + CARD + TRANSFER + OTHER
totalExpenses = SUM(gastos por método)
netResult = totalPayments - totalExpenses

PAGOS:
balance = totalAppointment - totalPaid
```

## Licencia

Proyecto privado - BookFlow
