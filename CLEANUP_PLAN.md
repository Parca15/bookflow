# BookFlow - Plan de Limpieza del Repositorio

## Estado Actual

Repositorio: `github.com/Parca15/bookflow`
Stack: Java 21 + Spring Boot 3.5.4, React 19 + Vite 6, PostgreSQL 17, Docker

---

## 1. CRÍTICO: Secretos expuestos en el repositorio

### 1.1 Secretos comprometidos

| Archivo | Línea | Secretos expuestos |
|---------|-------|-------------------|
| `render.yaml` | 13-19 | URL Neon DB, password `npg_LEHY0ubn3NZC`, JWT secret |
| `application.yaml` | 12 | JWT secret como fallback legible |
| `docker-compose.yml` | 32 | JWT secret hardcoded |
| `application-test.yml` | 3-4, 18 | Password DB + JWT secret |
| `application-dev.yml` | 5 | Password DB por defecto `bookflow123` |

### 1.2 Acciones inmediatas

- [ ] **Rotar password de Neon DB** en el dashboard de Neon (el actual está en el historial de git)
- [ ] **Rotar JWT secret** - generar uno nuevo con `openssl rand -base64 64`
- [ ] **Actualizar variables de entorno** en Render Dashboard con los nuevos valores

---

## 2. Archivos a eliminar o modificar

### 2.1 Eliminar de git

| Archivo | Razón |
|---------|-------|
| `render.yaml` | Contiene secretos en texto plano. Mover configuración a Render Dashboard |
| `backend/src/main/resources/application-test.yml` | Solo debe estar en `src/test/resources/` |

### 2.2 Modificar

| Archivo | Cambio necesario |
|---------|-----------------|
| `render.yaml` | Usar `sync: false` para secretos (referenciar env vars de Render) |
| `application.yaml` | Eliminar fallback del JWT secret, requerir variable de entorno |
| `docker-compose.yml` | Eliminar valor por defecto del JWT secret |
| `application-dev.yml` | Eliminar password por defecto |

---

## 3. Actualizar .gitignore

### 3.1 Agregar al .gitignore raíz

```gitignore
# Env files
.env.local
.env.development.local
.env.test.local
.env.production.local

# Editor files
*.swp
*.swo
*~
*.bak

# Coverage
coverage/
.nyc_output/

# Docker
docker/data/

# OS files
Thumbs.db
```

### 3.2 Crear frontend/.gitignore

```gitignore
node_modules/
dist/
.env.local
.env.*.local
*.log
coverage/
```

---

## 4. Malas prácticas de seguridad

### 4.1 JWT secrets débiles

| Problema | Solución |
|----------|----------|
| Frases legibles como secrets | Usar `openssl rand -base64 64` para generar secrets criptográficos |
| Fallbacks en código | Requerir variables de entorno, fallar si no están configuradas |

### 4.2 Token en localStorage

| Problema | Solución |
|----------|----------|
| `localStorage.setItem('token')` vulnerable a XSS | Migrar a cookies `httpOnly` + `secure` |

**Archivos afectados:**
- `frontend/src/context/AuthContext.jsx:48-49`
- `frontend/src/services/api.js:11`

### 4.3 Credenciales hardcoded

| Problema | Solución |
|----------|----------|
| Passwords en archivos de configuración | Usar variables de entorno + `.env` (no commiteado) |

---

## 5. Configuración duplicada

### 5.1 Archivos de test redundantes

| Archivo | Estado |
|---------|--------|
| `backend/src/test/resources/application-test.yml` | Mantener |
| `backend/src/test/resources/application.properties` | Mantener ( Spring Boot lo usa por defecto) |
| `backend/src/main/resources/application-test.yml` | **Eliminar** |

---

## 6. Plan de ejecución

### Fase 1: Seguridad (urgente)
1. Rotar password de Neon DB en dashboard
2. Generar nuevo JWT secret: `openssl rand -base64 64`
3. Actualizar env vars en Render Dashboard
4. Eliminar `render.yaml` del repo (o vaciar de secretos)

### Fase 2: Limpieza del repo
1. Actualizar `.gitignore` raíz
2. Crear `frontend/.gitignore`
3. Eliminar `backend/src/main/resources/application-test.yml`
4. Limpiar hardcoded secrets de configs

### Fase 3: Mejoras de seguridad
1. Migrar JWT de localStorage a httpOnly cookies
2. Implementar refresh tokens
3. Agregar `git-secrets` o `trufflehog` para prevenir commits de secretos

---

## 7. Comandos útiles

```bash
# Generar nuevo JWT secret
openssl rand -base64 64

# Buscar secretos en el historial de git
git log -p --all -S 'password' -- '*.yml' '*.yaml'

# Eliminar archivo del historial (cuidado: reescribe historial)
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch render.yaml' \
  --prune-empty --tag-name-filter cat -- --all
```

---

## 8. Referencias

- [GitHub: Removing sensitive data from a repository](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- [OWASP: Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [Spring Boot: Externalized Configuration](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.external-config)
