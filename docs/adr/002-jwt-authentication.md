# ADR-002: JWT sin refresh tokens

## Estado: Aceptado

## Contexto
Se necesita autenticación stateless para la API REST. El sistema tiene 5 roles con diferentes niveles de permiso.

## Decisión
Usar JWT con expiración de 24 horas, sin refresh tokens. El token se almacena en localStorage del frontend y se envía en el header `Authorization: Bearer`.

## Consecuencias
- **Positivo**: Simple de implementar, stateless, escalable
- **Positivo**: Sin estado del lado del servidor para sesiones
- **Negativo**: Token de 24h es una ventana amplia si se compromete
- **Negativo**: No hay forma de revocar tokens sin blacklist

## Alternativas consideradas
- **Refresh tokens**: Más seguro pero más complejo de implementar
- **Redis blacklist**: Permite revocación pero añade dependencia
- **Session cookies**: Más seguro contra XSS pero depende de CSRF protection
