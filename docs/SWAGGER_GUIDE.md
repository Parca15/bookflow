# Guía de Uso de Swagger UI - BookFlow

## Acceso

Abrir en el navegador: `http://localhost:8080/swagger-ui.html`

## Autenticación en Swagger

### Paso 1: Obtener token JWT

1. Expandir el grupo **auth**
2. Hacer clic en `POST /api/v1/auth/login`
3. Hacer clic en **Try it out**
4. Ingresar las credenciales:
```json
{
  "email": "admin@salon.com",
  "password": "123456"
}
```
5. Hacer clic en **Execute**
6. Copiar el valor del campo `token` de la respuesta

### Paso 2: Authorize

1. Hacer clic en el botón **Authorize** (arriba a la derecha)
2. En el campo **Value**, ingresar:
```
Bearer <token-copiado>
```
3. Hacer clic en **Authorize**
4. Cerrar el diálogo

Ahora todos los requests incluirán automáticamente el header `Authorization`.

## Flujo de Prueba Rápida

### 1. Crear empresa

```
POST /api/v1/companies
```
```json
{
  "businessName": "Salón Belleza",
  "documentNumber": "DOC-001",
  "email": "info@salon.com",
  "phone": "555-0100",
  "address": "Calle Principal 123"
}
```

### 2. Registrar usuario

```
POST /api/v1/auth/register
```
```json
{
  "companyId": 1,
  "email": "admin@salon.com",
  "password": "123456",
  "fullName": "Admin Salon",
  "role": "ADMIN"
}
```

### 3. Login

```
POST /api/v1/auth/login
```
```json
{
  "email": "admin@salon.com",
  "password": "123456"
}
```

### 4. Crear servicio

```
POST /api/v1/companies/1/catalog
```
```json
{
  "name": "Corte de Cabello",
  "description": "Corte profesional",
  "price": 50000,
  "durationMinutes": 30
}
```

### 5. Crear empleado

```
POST /api/v1/companies/1/employees
```
```json
{
  "fullName": "María García",
  "documentNumber": "1234567890",
  "email": "maria@salon.com",
  "phone": "555-0101",
  "specialty": "Cortes y Colorimetría"
}
```

### 6. Crear cliente

```
POST /api/v1/companies/1/clients
```
```json
{
  "fullName": "Juan López",
  "documentNumber": "0987654321",
  "email": "juan@email.com",
  "phone": "555-0201"
}
```

### 7. Abrir caja

```
POST /api/v1/companies/1/cash-registers
```
```json
{
  "openingAmount": 100000
}
```

### 8. Crear cita

```
POST /api/appointments/company/1
```
```json
{
  "clientId": 1,
  "employeeId": 1,
  "appointmentDate": "2026-08-27",
  "startTime": "10:00:00",
  "endTime": "10:30:00",
  "serviceIds": [1]
}
```

### 9. Registrar pago

```
POST /api/v1/companies/1/payments/appointment/1
```
```json
{
  "amount": 50000,
  "paymentMethod": "CASH",
  "notes": "Pago completo"
}
```

### 10. Completar cita

```
PATCH /api/appointments/company/1/1/complete
```

### 11. Generar factura

```
POST /api/v1/companies/1/invoices/appointment/1
```

### 12. Cerrar caja

```
PUT /api/v1/companies/1/cash-registers/1/close
```
```json
{
  "closingAmount": 150000
}
```

### 13. Ver reporte diario

```
GET /api/v1/companies/1/reports/daily?date=2026-08-27
```

## Códigos de Respuesta

| Código | Significado |
|--------|-------------|
| 200 | OK - Operación exitosa |
| 201 | Created - Recurso creado |
| 400 | Bad Request - Datos inválidos |
| 401 | Unauthorized - Token inválido o ausente |
| 403 | Forbidden - Sin permisos |
| 404 | Not Found - Recurso no encontrado |
| 409 | Conflict - Conflicto (ej: caja ya abierta) |
| 500 | Internal Server Error - Error del servidor |

## Errores Comunes

### 401 Unauthorized
```json
{
  "timestamp": "2026-08-27T10:00:00",
  "status": 401,
  "error": "Unauthorized",
  "message": "Full authentication is required to access this resource"
}
```
**Solución**: Verificar que el token JWT esté correctamente configurado en Authorize.

### 403 Forbidden
```json
{
  "timestamp": "2026-08-27T10:00:00",
  "status": 403,
  "error": "Forbidden"
}
```
**Solución**: Token expirado o inválido. Realizar login nuevamente.

### 404 Not Found
```json
{
  "timestamp": "2026-08-27T10:00:00",
  "status": 404,
  "error": "Not Found",
  "message": "No se encontró la empresa con id: 99"
}
```
**Solución**: Verificar que el ID del recurso exista.

### 409 Conflict
```json
{
  "timestamp": "2026-08-27T10:00:00",
  "status": 409,
  "error": "Conflict",
  "message": "La empresa ya tiene una caja abierta."
}
```
**Solución**: Cerrar la caja actual antes de abrir una nueva.

## Tips

1. **Campos requeridos**: Los campos obligatorios están marcados con asterisco (*)
2. **Enumeraciones**: Los valores enum son case-sensitive (ej: `CASH`, no `cash`)
3. **Fechas**: Usar formato ISO 8601: `YYYY-MM-DD`
4. **Horas**: Usar formato 24h: `HH:mm:ss` (ej: `14:30:00`)
5. **Montos**: Usar punto decimal: `50000.00`
6. ** companyId**: Siempre incluir en la ruta de los endpoints protegidos
