-- =============================================
-- V17: Crear sistema de roles con permisos
-- =============================================

-- 1. Crear tabla roles
CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    display_name VARCHAR(100),
    level INT NOT NULL,
    is_system BOOLEAN NOT NULL DEFAULT false,
    company_id BIGINT REFERENCES companies(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(name, company_id)
);

-- 2. Crear tabla role_permissions
CREATE TABLE role_permissions (
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    module VARCHAR(50) NOT NULL,
    PRIMARY KEY (role_id, module)
);

CREATE INDEX idx_roles_company ON roles(company_id);
CREATE INDEX idx_role_permissions_role ON role_permissions(role_id);

-- 3. Insertar roles predeterminados (sin company_id = roles del sistema)
INSERT INTO roles (name, display_name, level, is_system, company_id) VALUES
('SUPER_ADMIN', 'Super Administrador', 100, true, NULL),
('ADMIN', 'Administrador', 80, true, NULL),
('MANAGER', 'Gerente', 60, true, NULL),
('RECEPTIONIST', 'Recepcionista', 40, true, NULL),
('EMPLOYEE', 'Empleado', 20, true, NULL);

-- 4. Asignar permisos a cada rol predeterminado

-- SUPER_ADMIN: todos los permisos
INSERT INTO role_permissions (role_id, module) VALUES
(1, 'DASHBOARD'), (1, 'CALENDAR'), (1, 'EXPENSES'), (1, 'CASH_REGISTER'),
(1, 'CLIENTS'), (1, 'CATALOG'), (1, 'EMPLOYEES'), (1, 'PROMOTIONS'),
(1, 'COMPANIES'), (1, 'USERS'), (1, 'REPORTS');

-- ADMIN: todos excepto COMPANIES
INSERT INTO role_permissions (role_id, module) VALUES
(2, 'DASHBOARD'), (2, 'CALENDAR'), (2, 'EXPENSES'), (2, 'CASH_REGISTER'),
(2, 'CLIENTS'), (2, 'CATALOG'), (2, 'EMPLOYEES'), (2, 'PROMOTIONS'),
(2, 'USERS'), (2, 'REPORTS');

-- MANAGER
INSERT INTO role_permissions (role_id, module) VALUES
(3, 'DASHBOARD'), (3, 'CALENDAR'), (3, 'EXPENSES'), (3, 'CASH_REGISTER'),
(3, 'CLIENTS'), (3, 'CATALOG'), (3, 'EMPLOYEES'), (3, 'REPORTS');

-- RECEPTIONIST
INSERT INTO role_permissions (role_id, module) VALUES
(4, 'DASHBOARD'), (4, 'CALENDAR'), (4, 'CLIENTS'), (4, 'CATALOG');

-- EMPLOYEE
INSERT INTO role_permissions (role_id, module) VALUES
(5, 'DASHBOARD'), (5, 'CALENDAR');

-- 5. Agregar columna role_id a users
ALTER TABLE users ADD COLUMN role_id BIGINT REFERENCES roles(id);

-- 6. Migrar datos existentes: mapear role string a role_id
UPDATE users SET role_id = (SELECT id FROM roles WHERE name = users.role);

-- 7. Hacer role_id NOT NULL después de la migración
ALTER TABLE users ALTER COLUMN role_id SET NOT NULL;

-- 8. Eliminar columna role antigua
ALTER TABLE users DROP COLUMN role;
