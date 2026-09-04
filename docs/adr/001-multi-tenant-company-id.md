# ADR-001: Multi-tenant con company_id

## Estado: Aceptado

## Contexto
BookFlow necesita soportar múltiples salones/barberías con aislamiento de datos completo. Cada empresa solo debe ver sus propios datos.

## Decisión
Implementar multi-tenancy a nivel de base de datos usando una columna `company_id` en todas las tablas de negocio, con filtro automático por TenantFilter en el backend.

## Consecuencias
- **Positivo**: Simple de implementar, compatible con JPA, no requiere middleware adicional
- **Positivo**: Un solo despliegue sirve a todas las empresas
- **Negativo**: Todas las queries deben incluir `company_id` (mitigado con TenantFilter)
- **Negativo**: Migración de datos más compleja si se necesita mover tenants

## Alternativas consideradas
- **Schema por tenant**: Más aislamiento pero más complejo de mantener
- **Database por tenant**: Máximo aislamiento pero coste operativo alto
- **Row-Level Security (RLS)**: Nativo de PostgreSQL pero menos control en la aplicación
