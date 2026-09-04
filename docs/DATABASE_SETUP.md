# Database Setup - Neon PostgreSQL

## URLs de Producción

| Servicio | URL |
|----------|-----|
| Frontend | https://bookflow.h6cy6knypg.workers.dev |
| Backend | https://bookflow-api-ki89.onrender.com |
| Database | Neon PostgreSQL (pooler) |

## Credenciales

| Campo | Valor |
|-------|-------|
| Email | `admin@bookflow.com` |
| Contraseña | `Admin123` |

---

## Primer Setup - Crear usuario Admin

Ve al **SQL Editor** de Neon y ejecuta el siguiente SQL completo:

```sql
-- =============================================
-- BookFlow: Setup inicial de base de datos
-- =============================================

-- 1. Limpiar datos existentes (si existieran)
DELETE FROM users WHERE email = 'admin@bookflow.com';
DELETE FROM companies WHERE business_name = 'BookFlow Demo';

-- 2. Crear empresa
WITH new_company AS (
  INSERT INTO companies (business_name, document_number, document_type, email, phone, address, status)
  VALUES ('BookFlow Demo', '123456789', 'NIT', 'admin@bookflow.com', '+1234567890', '123 Main St', 'ACTIVE')
  RETURNING id
)
-- 3. Crear usuario admin (contraseña: Admin123)
INSERT INTO users (company_id, email, password, full_name, role_id, status)
SELECT id, 'admin@bookflow.com', '$2b$10$7QodKYcWWnD4IUNfUnYUtOGz/gBQO0R8m3QqbltPckOTMLHkc300G', 'Administrador', 2, 'ACTIVE'
FROM new_company;

-- 4. Verificar que se creó correctamente
SELECT u.id, u.email, u.full_name, r.name as role, c.business_name
FROM users u
JOIN roles r ON u.role_id = r.id
JOIN companies c ON u.company_id = c.id
WHERE u.email = 'admin@bookflow.com';
```

### Resultado esperado del SELECT final:

| id | email | full_name | role | business_name |
|----|-------|-----------|------|---------------|
| 1 | admin@bookflow.com | Administrador | ADMIN | BookFlow Demo |

---

## Verificar datos

Si algo sale mal, ejecuta estos queries para diagnosticar:

```sql
-- Ver todas las empresas
SELECT * FROM companies;

-- Ver todos los usuarios
SELECT * FROM users;

-- Ver todos los roles
SELECT * FROM roles;

-- Ver permisos del ADMIN (role_id = 2)
SELECT rp.module FROM role_permissions rp WHERE rp.role_id = 2;
```

---

## Variables de Entorno en Render

| Variable | Valor |
|----------|-------|
| `SPRING_PROFILES_ACTIVE` | `prod` |
| `DB_URL` | `jdbc:postgresql://ep-rough-bird-axvzpu6t-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require` |
| `DB_USERNAME` | `neondb_owner` |
| `DB_PASSWORD` | `npg_LEHY0ubn3NZC` |
| `JWT_SECRET` | `bookflowSecretKeyForJwt2026ProductionMin32Chars!!` |
| `CORS_ORIGINS` | `https://bookflow.h6cy6knypg.workers.dev,http://localhost:5173` |

---

## Variables de Entorno en Cloudflare Pages

| Variable | Valor |
|----------|-------|
| `VITE_API_URL` | `https://bookflow-api-ki89.onrender.com` |
