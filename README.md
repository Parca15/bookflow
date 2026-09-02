# BookFlow

Sistema de gestión integral para salones de belleza y barberías. Multi-empresa, multi-tenant con roles y permisos.

## Demo

> Agrega screenshots o un GIF del dashboard aquí

## Características

- **Multi-empresa**: Aislamiento completo de datos por empresa
- **JWT Authentication**: Login/registro con tokens JWT
- **Roles y Permisos**: 5 roles predefinidos con 11 módulos de permisos configurables
- **Calendario**: Vista mensual con creación de citas desde el calendario
- **Gestión de Citas**: Agendar, confirmar, completar, cancelar citas
- **Catálogo de Servicios**: CRUD completo con precios
- **Clientes y Empleados**: Gestión con historial
- **Pagos**: Múltiples métodos (efectivo, tarjeta, transferencia), abonos parciales, cupones
- **Caja**: Apertura/cierre con cálculo automático de diferencias
- **Gastos**: Registro y categorización de gastos
- **Reportes**: Diarios y mensuales con exportación a PDF
- **Promociones**: Descuentos, paquetes, cupones con vigencia
- **Facturación**: Generación automática de facturas con PDF

## Stack Tecnológico

### Backend

| Componente | Tecnología |
|------------|------------|
| Lenguaje | Java 21 |
| Framework | Spring Boot 3.5.4 |
| Base de datos | PostgreSQL 17 |
| ORM | Spring Data JPA, Hibernate |
| Migraciones | Flyway (V1-V17) |
| Seguridad | Spring Security, JWT |
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
| Contraseña | admin123 |

## Estructura del Proyecto

```
bookflow/
├── docker/
│   └── docker-compose.yml
├── backend/
│   ├── src/main/java/com/bookflow/
│   │   ├── auth/           # Autenticación JWT, roles, permisos
│   │   ├── appointment/    # Gestión de citas
│   │   ├── cash/           # Caja
│   │   ├── catalog/        # Catálogo de servicios
│   │   ├── client/         # Clientes e historial
│   │   ├── company/        # Empresas (multi-tenant)
│   │   ├── common/         # Excepciones, configuración
│   │   ├── employee/       # Empleados
│   │   ├── expense/        # Gastos
│   │   ├── invoice/        # Facturación
│   │   ├── payment/        # Pagos
│   │   ├── promotion/      # Promociones
│   │   └── report/         # Reportes diarios/mensuales
│   └── src/main/resources/db/migration/  # Flyway V1-V17
├── frontend/
│   ├── src/
│   │   ├── components/     # Componentes reutilizables
│   │   ├── context/        # AuthContext
│   │   ├── pages/          # Páginas de la aplicación
│   │   └── services/       # Servicios API
│   └── vite.config.js
└── .env.example
```

## Autenticación y Roles

### Login

```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@bookflow.com",
  "password": "admin123"
}
```

### Roles predefinidos

| Rol | Nivel | Descripción |
|-----|-------|-------------|
| `SUPER_ADMIN` | 100 | Control total del sistema |
| `ADMIN` | 80 | Control total de la empresa |
| `MANAGER` | 60 | Gestión de operaciones |
| `RECEPTIONIST` | 40 | Recepción y citas |
| `EMPLOYEE` | 20 | Empleados del salón |

### Módulos de permisos

`DASHBOARD`, `CALENDAR`, `EXPENSES`, `CASH_REGISTER`, `CLIENTS`, `CATALOG`, `EMPLOYEES`, `PROMOTIONS`, `COMPANIES`, `USERS`, `REPORTS`

## Endpoints principales

<details>
<summary>Ver todos los endpoints</summary>

### Autenticación

| Método | URL | Descripción |
|--------|-----|-------------|
| POST | `/api/v1/auth/login` | Login |
| GET | `/api/v1/auth/companies/{companyId}/users` | Listar usuarios |
| PATCH | `/api/v1/auth/users/{id}/deactivate` | Desactivar usuario |
| PATCH | `/api/v1/auth/users/{id}/activate` | Activar usuario |
| DELETE | `/api/v1/auth/users/{id}` | Eliminar usuario |

### Roles

| Método | URL | Descripción |
|--------|-----|-------------|
| GET | `/api/v1/roles?companyId={id}` | Listar roles |
| POST | `/api/v1/roles?companyId={id}` | Crear rol |
| PUT | `/api/v1/roles/{id}` | Actualizar rol |
| DELETE | `/api/v1/roles/{id}` | Eliminar rol |

### Empresas

| Método | URL | Descripción |
|--------|-----|-------------|
| POST | `/api/v1/companies` | Crear empresa |
| GET | `/api/v1/companies` | Listar activas |
| GET | `/api/v1/companies/all` | Listar todas |
| GET | `/api/v1/companies/{id}` | Obtener empresa |
| PUT | `/api/v1/companies/{id}` | Actualizar empresa |
| DELETE | `/api/v1/companies/{id}` | Desactivar empresa |
| DELETE | `/api/v1/companies/{id}/permanent` | Eliminar permanentemente |
| PATCH | `/api/v1/companies/{id}/activate` | Activar empresa |

### Catálogo de Servicios

| Método | URL | Descripción |
|--------|-----|-------------|
| POST | `/api/v1/companies/{companyId}/catalog` | Crear servicio |
| GET | `/api/v1/companies/{companyId}/catalog` | Listar servicios |
| PUT | `/api/v1/companies/{companyId}/catalog/{id}` | Actualizar servicio |
| DELETE | `/api/v1/companies/{companyId}/catalog/{id}` | Eliminar servicio |

### Clientes

| Método | URL | Descripción |
|--------|-----|-------------|
| POST | `/api/v1/companies/{companyId}/clients` | Crear cliente |
| GET | `/api/v1/companies/{companyId}/clients` | Listar clientes |
| PUT | `/api/v1/companies/{companyId}/clients/{id}` | Actualizar cliente |
| DELETE | `/api/v1/companies/{companyId}/clients/{id}` | Desactivar cliente |
| DELETE | `/api/v1/companies/{companyId}/clients/{id}/permanent` | Eliminar permanentemente |
| GET | `/api/v1/companies/{companyId}/clients/{id}/history` | Historial del cliente |

### Empleados

| Método | URL | Descripción |
|--------|-----|-------------|
| POST | `/api/v1/companies/{companyId}/employees` | Crear empleado |
| GET | `/api/v1/companies/{companyId}/employees` | Listar empleados |
| PUT | `/api/v1/companies/{companyId}/employees/{id}` | Actualizar empleado |
| DELETE | `/api/v1/companies/{companyId}/employees/{id}` | Eliminar empleado |

### Citas

| Método | URL | Descripción |
|--------|-----|-------------|
| POST | `/api/v1/appointments/company/{companyId}` | Crear cita |
| GET | `/api/v1/appointments/company/{companyId}` | Listar citas |
| PATCH | `/api/v1/appointments/company/{companyId}/{id}/complete` | Completar cita |
| PATCH | `/api/v1/appointments/company/{companyId}/{id}/cancel` | Cancelar cita |
| PATCH | `/api/v1/appointments/company/{companyId}/{id}/no-show` | Marcar no-show |

### Pagos

| Método | URL | Descripción |
|--------|-----|-------------|
| POST | `/api/v1/companies/{companyId}/payments/appointment/{appointmentId}` | Crear pago |
| GET | `/api/v1/companies/{companyId}/payments/appointment/{appointmentId}/balance` | Saldo pendiente |

### Caja

| Método | URL | Descripción |
|--------|-----|-------------|
| POST | `/api/v1/companies/{companyId}/cash-registers` | Abrir caja |
| GET | `/api/v1/companies/{companyId}/cash-registers/open` | Caja abierta |
| PUT | `/api/v1/companies/{companyId}/cash-registers/{id}/close` | Cerrar caja |

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
| GET | `/api/v1/companies/{companyId}/promotions/code/{code}` | Buscar por código |

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
