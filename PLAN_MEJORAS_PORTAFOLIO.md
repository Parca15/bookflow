# BookFlow - Plan de Mejoras para Portafolio

## Resumen Ejecutivo

BookFlow es un sistema de gestión integral para salones de belleza y barberías con arquitectura multi-tenant, JWT authentication, y roles/permisos. El proyecto tiene una base sólida pero presenta áreas críticas de mejora en seguridad, calidad de código, rendimiento y UX que deben abordarse para que destaque en un portafolio profesional.

---

## FASE 1 - Seguridad Crítica (Prioridad MÁXIMA)

### 1.1 Implementar Autorización por Roles y Permisos
- **Problema**: No existe `@PreAuthorize` en ningún endpoint. Un usuario `EMPLOYEE` puede acceder a todo.
- **Solución**: Crear un `PermissionEvaluator` custom o usar `@PreAuthorize` con SpEL que verifique el nivel del rol y los permisos del módulo.
- **Archivos**: Todos los controllers, `SecurityConfig.java`
- **Esfuerzo**: Alto (2-3 días)

### 1.2 Aislamiento Multi-Tenant en Seguridad
- **Problema**: Cualquier usuario puede cambiar el `companyId` en la URL y acceder a datos de otra empresa.
- **Solución**: Crear un filtro o aspecto AOP que extraiga el `companyId` del JWT y lo compare con el de la URL.
- **Archivos**: Crear `TenantFilter.java`, modificar `SecurityConfig.java`
- **Esfuerzo**: Alto (2 días)

### 1.3 Proteger Endpoint de Registro
- **Problema**: `/api/v1/auth/register` es público. Cualquiera puede crear usuarios con rol ADMIN.
- **Solución**: Remover de `PUBLIC_ENDPOINTS` o agregar validación de autorización.
- **Archivos**: `SecurityConfig.java`, `AuthController.java`
- **Esfuerzo**: Bajo (2 horas)

### 1.4 Implementar Revocación de Tokens JWT
- **Problema**: Un token revocado o de usuario desactivado sigue siendo válido hasta expirar.
- **Solución**: Implementar blacklist en Redis o usar refresh tokens con rotación.
- **Archivos**: Crear `TokenBlacklistService.java`, modificar `JwtTokenProvider.java`
- **Esfuerzo**: Medio (1 día)

### 1.5 Agregar Rate Limiting
- **Problema**: Sin límite de intentos en login, vulnerable a brute-force.
- **Solución**: Implementar con Bucket4j o Spring Cloud Gateway Rate Limiter.
- **Archivos**: Crear `RateLimitFilter.java`
- **Esfuerzo**: Medio (4 horas)

### 1.6 Política de Contraseñas más Fuerte
- **Problema**: Solo requiere 6 caracteres, sin complejidad.
- **Solución**: Mínimo 8 caracteres, mayúscula, minúscula, número y especial.
- **Archivos**: `RegisterRequest.java`
- **Esfuerzo**: Bajo (1 hora)

---

## FASE 2 - Corrección de Bugs Críticos

### 2.1 Corregir Transiciones de Estado de Citas
- **Problema**: `confirm()`, `start()` y `complete()` todos establecen `COMPLETED`. Los endpoints son idénticos.
- **Solución**: Restaurar estados `CONFIRMED` e `IN_PROGRESS` al enum `AppointmentStatus` o consolidar endpoints.
- **Archivos**: `AppointmentStatus.java`, `AppointmentServiceImpl.java`, `AppointmentController.java`
- **Esfuerzo**: Medio (4 horas)

### 2.2 Corregir Código Muerto en RoleServiceImpl
- **Problema**: `getAllRoles()` tiene if/else que ejecuta la misma consulta.
- **Solución**: Implementar la lógica diferenciada (super admin ve todos, otros ven scoped) o eliminar larama muerta.
- **Archivos**: `RoleServiceImpl.java:33-40`
- **Esfuerzo**: Bajo (1 hora)

### 2.3 Corregir SQL Roto en Migración V16
- **Problema**: `WHERE document_type = 'NIT' IS NULL` siempre evalúa FALSE.
- **Solución**: Corregir a `WHERE document_type IS NULL` o la lógica correcta.
- **Archivos**: `V16__add_document_type_to_company.sql:6`
- **Esfuerzo**: Bajo (30 min)

---

## FASE 3 - Calidad del Backend

### 3.1 Eliminar Código Duplicado en ReportServiceImpl
- **Problema**: ~315 líneas duplicadas entre métodos diarios y mensuales.
- **Solución**: Extraer métodos helper genéricos (`fillAppointmentStats(list)`, `fillPaymentStats(list)`, etc.).
- **Archivos**: `ReportServiceImpl.java`
- **Esfuerzo**: Medio (4 horas)

### 3.2 Corregir Problemas N+1 en Consultas
- **Problema**: `findAllAppointmentsInPeriod()` consulta día por día (30 queries para un mes). `CashRegisterServiceImpl.toResponse()` ejecuta 10 queries separadas.
- **Solución**: Usar rangos de fechas en una sola consulta. Consolidar queries de caja con JOINs o agregaciones.
- **Archivos**: `ReportServiceImpl.java`, `CashRegisterServiceImpl.java`
- **Esfuerzo**: Alto (1 día)

### 3.3 Agregar @Transactional a Operaciones de Escritura
- **Problema**: Falta en CompanyService, ClientService, EmployeeService, CatalogService, ScheduleService.
- **Solución**: Agregar `@Transactional` a todos los métodos create/update/delete.
- **Archivos**: 5 service implementations
- **Esfuerzo**: Bajo (2 horas)

### 3.4 Estandarizar Rutas de API
- **Problema**: `AppointmentController` usa `/api/appointments` en lugar de `/api/v1/appointments`.
- **Solución**: Cambiar a `/api/v1/appointments` y actualizar el frontend.
- **Archivos**: `AppointmentController.java`, `appointmentService.js`
- **Esfuerzo**: Bajo (1 hora)

### 3.5 Remover Inyección Directa de Repositorios en Controllers
- **Problema**: `AuthController` y `RoleController` inyectan `UserRepository` directamente.
- **Solución**: Crear métodos en el service layer para las consultas necesarias.
- **Archivos**: `AuthController.java`, `RoleController.java`
- **Esfuerzo**: Bajo (2 horas)

### 3.6 Agregar Paginación a Endpoints de Listado
- **Problema**: Todos los `findAll()` devuelven resultados ilimitados.
- **Solución**: Usar `PagingAndSortingRepository` con `Pageable` en todos los endpoints de listado.
- **Archivos**: Todos los controllers y repositories
- **Esfuerzo**: Alto (1-2 días)

### 3.7 Estandarizar Mapping con MapStruct
- **Problema**: 4 módulos usan mapeo manual (Role, Promotion, Expense, CashRegister) vs 8 con MapStruct.
- **Solución**: Crear mappers MapStruct para los 4 módulos faltantes.
- **Archivos**: Crear 4 archivos `*Mapper.java`
- **Esfuerzo**: Medio (4 horas)

### 3.8 Agregar Columnas de Auditoría
- **Problema**: Solo User y Role tienen `created_at`. Ninguna entidad tiene `created_by` o `updated_by`.
- **Solución**: Crear migración para agregar `created_at`, `updated_at`, `created_by`, `updated_by` a todas las tablas. Implementar `AuditingListener` con Spring Data JPA.
- **Archivos**: Nueva migración Flyway, `@EntityListeners` en todas las entidades
- **Esfuerzo**: Alto (1 día)

### 3.9 Agregar Índices de Base de Datos
- **Problema**: Faltan índices en columnas frecuentemente consultadas.
- **Solución**: Crear migración con índices en `appointments.company_id`, `appointments.appointment_date`, `payments.appointment_id`, `payments.cash_register_id`, `expenses.company_id`, `expenses.cash_register_id`.
- **Archivos**: Nueva migración Flyway
- **Esfuerzo**: Bajo (2 horas)

---

## FASE 4 - Calidad del Frontend

### 4.1 Crear Componente Modal Reutilizable
- **Problema**: 13+ copias del mismo patrón de modal con `<div className="fixed inset-0 bg-black/50...">`.
- **Solución**: Crear `src/components/Modal.jsx` con Escape handler, backdrop click, scroll lock, focus trap.
- **Archivos**: Crear `Modal.jsx`, actualizar 13+ páginas
- **Esfuerzo**: Medio (4 horas)

### 4.2 Extraer Utilidades Compartidas
- **Problema**: `fmt()` definido 7 veces, `clientName()` 2 veces, `addMinutes()` 2 veces, `statusColors/statusLabels` 4 veces.
- **Solución**: Crear `src/utils/format.js` y `src/utils/constants.js`.
- **Archivos**: Crear 2 archivos, actualizar 10+ páginas
- **Esfuerzo**: Medio (3 horas)

### 4.3 Crear Componente LoadingSpinner
- **Problema**: 13 copias idénticas del spinner de carga.
- **Solución**: Crear `src/components/LoadingSpinner.jsx`.
- **Archivos**: Crear 1 archivo, actualizar 13 páginas
- **Esfuerzo**: Bajo (1 hora)

### 4.4 Agregar Error Boundary
- **Problema**: Zero Error Boundaries. Un error de JS crashea toda la app mostrando pantalla blanca.
- **Solución**: Crear `src/components/ErrorBoundary.jsx` y envolver en `App.jsx`.
- **Archivos**: Crear `ErrorBoundary.jsx`, modificar `App.jsx`
- **Esfuerzo**: Bajo (2 horas)

### 4.5 Implementar Lazy Loading de Páginas
- **Problema**: Las 14 páginas se importan eagerly, inflando el bundle inicial.
- **Solución**: Usar `React.lazy()` + `Suspense` con fallback de loading.
- **Archivos**: `App.jsx`
- **Esfuerzo**: Bajo (2 horas)

### 4.6 Agregar Ruta 404
- **Problema**: No existe ruta catch-all para URLs inválidas.
- **Solución**: Crear `NotFoundPage.jsx` y agregar `<Route path="*">`.
- **Archivos**: Crear `NotFoundPage.jsx`, modificar `App.jsx`
- **Esfuerzo**: Bajo (1 hora)

### 4.7 Validar Token al Cargar la App
- **Problema**: El token se lee de localStorage sin verificar si sigue válido contra el backend.
- **Solución**: Llamar a un endpoint `/auth/me` al montar `AuthContext` para validar el token.
- **Archivos**: `AuthContext.jsx`, crear endpoint en backend
- **Esfuerzo**: Medio (3 horas)

### 4.8 Usar authService en AuthContext
- **Problema**: `AuthContext` hace llamadas HTTP directas duplicando `authService`.
- **Solución**: Refactorizar para usar `authService.login()` y `authService.register()`.
- **Archivos**: `AuthContext.jsx`
- **Esfuerzo**: Bajo (1 hora)

### 4.9 Dividir Componentes "God" en Subcomponentes
- **Problema**: `CalendarPage.jsx` (976 líneas), `AppointmentsPage.jsx` (619), `DashboardPage.jsx` (534).
- **Solución**: Dividir en componentes más pequeños y enfocados.
  - CalendarPage → `CalendarGrid`, `DayPanel`, `CreateAppointmentModal`, `PaymentModal`, `InvoiceModal`
  - AppointmentsPage → `WeekTimeline`, `AppointmentBlock`, `CreateAppointmentModal`, `DetailModal`
  - DashboardPage → `StatCards`, `MiniCalendar`, `AppointmentsList`, `PaymentBreakdown`
- **Archivos**: Múltiples archivos nuevos
- **Esfuerzo**: Alto (2 días)

### 4.10 Reemplazar window.prompt y window.confirm
- **Problema**: Se usan diálogos nativos del navegador para apertura de caja y acciones destructivas.
- **Solución**: Reemplazar con modales personalizados del design system.
- **Archivos**: `CashRegisterPage.jsx`, 7+ páginas
- **Esfuerzo**: Medio (4 horas)

### 4.11 Agregar Paginación a Listados
- **Problema**: Todos los listados cargan todos los registros de una vez.
- **Solución**: Implementar paginación con Spring Data (backend) + paginación en tabla (frontend).
- **Archivos**: Todos los controllers, services y páginas de listado
- **Esfuerzo**: Alto (2 días)

---

## FASE 5 - Rendimiento

### 5.1 Optimizar Consultas del Dashboard
- **Problema**: `DashboardPage` carga TODAS las citas历史 y filtra en cliente.
- **Solución**: Crear endpoints backend específicos que retornen datos pre-agregados.
- **Archivos**: `DashboardPage.jsx`, crear `DashboardController.java` o methods en `ReportController`
- **Esfuerzo**: Medio (4 horas)

### 5.2 Implementar Data Fetching con React Query / SWR
- **Problema**: Cada página gestiona su propio estado de carga con useState+useEffect. No hay caché compartida.
- **Solución**: Migrar a TanStack Query (React Query) para caché, revalidación, deduplicación.
- **Archivos**: Nuevo provider, actualizar todos los services y pages
- **Esfuerzo**: Alto (3 días)

### 5.3 Agregar Request Cancellation
- **Problema**: No se usa AbortController. Requests en vuelo pueden intentar setear estado en componentes desmontados.
- **Solución**: Integrar AbortController en services o delegar a React Query.
- **Archivos**: Todos los services
- **Esfuerzo**: Medio (se resuelve parcialmente con React Query)

---

## FASE 6 - Testing

### 6.1 Backend - Tests de Controller (Integration Tests)
- **Problema**: No hay tests de integración con MockMvc/WebTestClient.
- **Solución**: Crear tests de integración para cada endpoint usando `@WebMvcTest` o `@SpringBootTest`.
- **Archivos**: Crear `*ControllerTest.java` para cada módulo
- **Esfuerzo**: Alto (3 días)

### 6.2 Backend - Tests de Servicios Críticos
- **Problema**: Solo 6 servicios tienen tests. Faltan AppointmentService, ReportService, InvoiceService, CompanyService, ClientService, EmployeeService.
- **Solución**: Crear unit tests con Mockito para los servicios faltantes.
- **Archivos**: Crear `*ServiceImplTest.java` faltantes
- **Esfuerzo**: Alto (2 días)

### 6.3 Frontend - Tests con Vitest + React Testing Library
- **Problema**: No hay ningún test en el frontend. No hay test runner configurado.
- **Solución**: Instalar Vitest, React Testing Library. Crear tests unitarios y de integración.
- **Archivos**: Instalar dependencias, crear `*.test.jsx` para componentes y pages críticos
- **Esfuerzo**: Alto (3 días)

### 6.4 Cobertura Objetivo
- Backend: Subir de ~15% a 70%+
- Frontend: Subir de 0% a 50%+

---

## FASE 7 - DevOps y Deployment

### 7.1 Agregar CI/CD con GitHub Actions
- **Problema**: No hay pipeline de integración continua.
- **Solución**: Crear `.github/workflows/ci.yml` que ejecute tests, lint y build.
- **Archivos**: `.github/workflows/ci.yml`
- **Esfuerzo**: Medio (4 horas)

### 7.2 Docker Compose para Desarrollo Completo
- **Problema**: `docker-compose.yml` tiene backend pero el Dockerfile del backend no existe en el repo.
- **Solución**: Crear `Dockerfile` para backend y frontend, verificar que `docker-compose up` funcione completo.
- **Archivos**: `backend/Dockerfile`, `frontend/Dockerfile`, revisar `docker-compose.yml`
- **Esfuerzo**: Medio (4 horas)

### 7.3 Variables de Entorno en Producción
- **Problema**: Credenciales hardcodeadas en `application-dev.yml`.
- **Solución**: Todas las credenciales deben venir de variables de entorno, nunca del repositorio.
- **Archivos**: `application.yml`, `.env.example`
- **Esfuerzo**: Bajo (1 hora)

---

## FASE 8 - Documentación y Presentación para Portafolio

### 8.1 Mejorar README
- **Problema**: Falta demo visual, arquitectura, decisiones técnicas.
- **Solución**: Agregar screenshots/GIFs del dashboard, diagrama de arquitectura, explicación de decisiones técnicas, badges de status.
- **Archivos**: `README.md`
- **Esfuerzo**: Medio (3 horas)

### 8.2 Crear Diagrama de Arquitectura
- **Solución**: Crear diagrama con Mermaid o_draw.io mostrando la arquitectura multi-tenant, componentes y flujo de datos.
- **Archivos**: `docs/ARCHITECTURE.md`
- **Esfuerzo**: Medio (2 horas)

### 8.3 Documentar Decisiones de Diseño
- **Solución**: Crear ADRs (Architecture Decision Records) explicando por qué se eligieron Spring Boot, multi-tenant con company_id, JWT, etc.
- **Archivos**: `docs/ADR/`
- **Esfuerzo**: Medio (2 horas)

### 8.4 Demo en Video
- **Solución**: Grabar un video de 3-5 minutos mostrando las funcionalidades principales del sistema.
- **Archivos**: Subir a YouTube o incluir en el README
- **Esfuerzo**: Medio (2 horas)

### 8.5 Live Demo (Opcional)
- **Solución**: Desplegar en Railway/Render/Fly.io con datos de ejemplo para que los reclutadores puedan probarlo.
- **Archivos**: Configuración de deployment
- **Esfuerzo**: Medio (3 horas)

---

## Orden de Ejecución Recomendado

| Semana | Fase | Tareas |
|--------|------|--------|
| 1 | Seguridad + Bugs | 1.1, 1.2, 1.3, 2.1, 2.2, 2.3 |
| 2 | Backend Quality | 3.1, 3.2, 3.3, 3.4, 3.5, 3.9 |
| 3 | Frontend Quality | 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8 |
| 4 | Frontend + Performance | 4.9, 4.10, 5.1 |
| 5 | Testing | 6.1, 6.2, 6.3 |
| 6 | DevOps + Docs | 7.1, 7.2, 8.1, 8.2, 8.3 |

---

## Métricas de Éxito

| Métrica | Actual | Objetivo |
|---------|--------|----------|
| Backend test coverage | ~15% | 70%+ |
| Frontend test coverage | 0% | 50%+ |
| Líneas de código duplicado (frontend) | ~500+ | <50 |
| Componentes "God" (>500 líneas) | 5 | 0 |
| Endpoints con autorización | 0% | 100% |
| Errores de seguridad críticos | 6 | 0 |

---

## Impacto en Portafolio

Completar este plan convierte BookFlow de un "proyecto funcional" a un **proyecto profesional** que demuestra:

- **Conocimiento de seguridad**: Autenticación JWT + autorización por roles + multi-tenant isolation
- **Calidad de código**: Sin duplicación, componentes modulares, testing robusto
- **Arquitectura limpia**: Patrón en capas consistente, separación de responsabilidades
- **DevOps**: CI/CD, Docker, deployment automatizado
- **UX**: Modales accesibles, loading states, error boundaries, paginación
- **Documentación**: Arquitectura documentada, decisiones explicadas, demo visual

> **Tiempo estimado total**: 6-8 semanas de trabajo part-time
> **Versión mínima viable para portafolio**: Fases 1-4 + 8.1-8.4 (3-4 semanas)
