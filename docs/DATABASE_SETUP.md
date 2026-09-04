# Database Setup - Neon PostgreSQL

## Primer usuario (Admin)

Ve al **SQL Editor** de Neon y ejecuta:

```sql
-- 1. Crear empresa
INSERT INTO companies (business_name, document_number, email, phone, address, status)
VALUES ('BookFlow Demo', '123456789', 'admin@bookflow.com', '+1234567890', '123 Main St', 'ACTIVE')
RETURNING id;

-- 2. Crear usuario admin (contraseña: Admin123)
INSERT INTO users (company_id, email, password, full_name, role_id, status)
VALUES (
  1,
  'admin@bookflow.com',
  '$2b$10$9rcID7i0SozEN1te7PfENe4M/aRsCO2rkc5IBVszU4DghkfUNQmSO',
  'Administrador',
  2,
  'ACTIVE'
);
```

> Si el `id` de la empresa no es `1`, ajusta el `company_id` en el segundo INSERT con el valor que devolvió el primer INSERT.

## Credenciales

| Campo | Valor |
|-------|-------|
| Email | `admin@bookflow.com` |
| Contraseña | `Admin123` |

## URLs de Producción

| Servicio | URL |
|----------|-----|
| Frontend | https://bookflow.h6cy6knypg.workers.dev |
| Backend | https://bookflow-api-ki89.onrender.com |
| Database | Neon PostgreSQL (pooler) |
