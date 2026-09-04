# ADR-003: Spring Boot + React

## Estado: Aceptado

## Contexto
Se necesita un stack tecnológico para el sistema de gestión de salones.

## Decisión
- **Backend**: Spring Boot 3.5 + Java 21 + PostgreSQL 17
- **Frontend**: React 19 + Vite + Tailwind CSS

## Consecuencias
- **Positivo**: Spring Boot tiene ecosistema robusto para seguridad, JPA, validación
- **Positivo**: React tiene gran comunidad, componentes reutilizables
- **Positivo**: Java 21 con records y virtual threads
- **Negativo**: Curva de aprendizaje para Java/Spring
- **Negativo**: Bundle size de React puede crecer sin lazy loading

## Alternativas consideradas
- **Node.js + Express**: Más rápido de desarrollar pero menos estructurado
- **Next.js**: SSR innecesario para una app interna
- **Angular**: Más pesado, menor adopción en startups
