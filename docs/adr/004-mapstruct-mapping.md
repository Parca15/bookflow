# ADR-004: MapStruct para mapeo DTO-Entity

## Estado: Aceptado

## Contexto
El backend necesita convertir entre entidades JPA y DTOs de respuesta/request. Hay 12+ módulos con múltiples entidades.

## Decisión
Usar MapStruct para mapeo automático compile-time, con Lombok para reducir boilerplate.

## Consecuencias
- **Positivo**: Mapeo automático, sin reflection en runtime
- **Positivo**: Detección de errores en compile-time
- **Positivo**: Genera código eficiente y tipado
- **Negativo**: Dependencia de annotation processor
- **Negativo**: Curva de aprendizaje para configuración avanzada

## Alternativas consideradas
- **ModelMapper**: Más simple pero usa reflection, más lento
- **Manual mapping**: Control total pero mucha repetición
- **Spring Data projections**: Limitado a consultas read-only
