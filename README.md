# S7 Ciclo De Solicitud

API de incidencias construida para demostrar ciclo de solicitud, persistencia relacional y evolucion del esquema mediante migraciones.

## Stack

- Node.js
- TypeScript
- NestJS
- PostgreSQL
- Prisma ORM
- Docker Compose
- pnpm

## Arquitectura

La aplicacion separa responsabilidades por capas:

- DTO / ValidationPipe: transforma y valida el body de entrada.
- Controller: recibe HTTP y delega el caso de uso.
- Service: coordina reglas de aplicacion, busqueda de categoria y manejo de conflictos.
- Repository: encapsula el acceso a persistencia.
- Prisma: cliente ORM para hablar con PostgreSQL.
- PostgreSQL: protege restricciones reales como PK, UNIQUE, NOT NULL y FK.
- Exception Filter: normaliza respuestas de error.

```mermaid
flowchart LR
    A[HTTP Request] --> B[ValidationPipe + DTO]
    B --> C[IncidentsController]
    C --> D[IncidentsService]
    D --> E[CategoryRepository]
    D --> F[IncidentsRepository]
    E --> G[Prisma]
    F --> G
    G --> H[(PostgreSQL)]
    H --> G
    G --> D
    D --> C
    C --> I[HTTP Response]
```

En `POST /incidents`, el request pasa por `ValidationPipe`, se transforma con `CreateIncidentDto`, llega al controller y el service busca la categoria por `categoryCode`. Si existe, el repository crea la incidencia conectandola con la categoria mediante Prisma. Si no existe, responde `404`. Si `referenceCode` ya existe, PostgreSQL/Prisma protegen el UNIQUE y la API responde `409`.

## Modelo Relacional

`Category 1 ---- N Incident`

Restricciones protegidas por PostgreSQL:

- PK `Incident.id`
- PK `Category.id`
- UNIQUE `Incident.referenceCode`
- UNIQUE `Category.code`
- NOT NULL `Incident.categoryId`
- FK `Incident.categoryId -> Category.id`

## Variables De Entorno

La aplicacion usa `DATABASE_URL` para conectar Prisma con PostgreSQL.

Ejemplo basado en `.env.example`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/incidents_db?schema=public"
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=incidents_db
```

No coloques secretos reales en archivos versionados.

## Instalacion

```bash
pnpm install
docker compose up -d
pnpm exec prisma generate
```

## Flujo De Desarrollo

Para crear nuevas migraciones durante desarrollo:

```bash
pnpm exec prisma migrate dev --name nombre_migracion
```

Para aplicar migraciones durante desarrollo:

```bash
pnpm exec prisma migrate dev
```

`migrate dev` esta orientado al desarrollo: valida el historial, aplica migraciones pendientes y puede generar una nueva migracion cuando hay cambios en `schema.prisma`.

## Flujo De Despliegue

En deployment, CI, staging o production se aplican migraciones ya versionadas:

```bash
pnpm exec prisma migrate deploy
```

`migrate deploy` no crea migraciones nuevas. No uses `db push` como reemplazo del historial de migraciones.

Resumen:

- DEVELOPMENT: `pnpm exec prisma migrate dev`
- DEPLOYMENT / CI / STAGING / PRODUCTION: `pnpm exec prisma migrate deploy`

## Seed

```bash
pnpm exec prisma db seed
```

El seed es reproducible e idempotente. Usa `upsert` para crear o actualizar categorias minimas (`GENERAL`, `HARDWARE`, `SOFTWARE`, `NETWORK`) e incidencias iniciales sin duplicar datos.

## Reconstruccion Desde Una Base Vacia

Procedimiento planeado para verificar en Sprint 4:

```bash
docker compose down -v
docker compose up -d
pnpm exec prisma migrate deploy
pnpm exec prisma generate
pnpm exec prisma db seed
```

`migrate deploy` reconstruye el esquema usando todo el historial versionado. Luego `db seed` agrega los datos minimos. No se necesita una base preconstruida.

## Historial De Migraciones

- `20260907211500_init_incidents`: creo `Incident`, el enum `IncidentStatus` y el UNIQUE de `referenceCode`.
- `20260908013114_add_categories`: agrego `Category` y uso estrategia `EXPAND -> MIGRATE -> CONTRACT` para conservar incidencias existentes.

## Preservacion De Datos

No se agrego `Incident.categoryId` directamente como `NOT NULL` porque la tabla ya tenia incidencias. PostgreSQL no puede llenar una columna obligatoria nueva sin valor para filas existentes.

La migracion segura uso:

- EXPAND: agregar `categoryId` nullable.
- MIGRATE: crear la categoria `GENERAL` con UUID fijo y asignarla a todas las incidencias existentes.
- CONTRACT: convertir `categoryId` en `NOT NULL` y crear la FK hacia `Category.id`.

Asi la migracion funciona sobre una base con datos y tambien durante una reconstruccion desde cero.

## Endpoints

### POST /incidents

```json
{
  "referenceCode": "inc-100",
  "title": "Falla de conectividad",
  "description": "No hay conexion en recepcion",
  "status": "OPEN",
  "categoryCode": "network"
}
```

`referenceCode` y `categoryCode` se transforman a uppercase. `categoryId` no se acepta como entrada publica.

### GET /incidents

Devuelve incidencias con informacion de categoria:

```json
{
  "referenceCode": "INC-100",
  "title": "Falla de conectividad",
  "status": "OPEN",
  "category": {
    "code": "NETWORK",
    "name": "Network"
  }
}
```

### GET /categories

Devuelve las categorias disponibles ordenadas por `code`.

## Errores

Los errores se devuelven con estructura consistente:

```json
{
  "timestamp": "2026-09-08T00:00:00.000Z",
  "path": "/incidents",
  "error": {
    "statusCode": 400,
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": []
  }
}
```

Casos principales:

- `400 VALIDATION_ERROR`: body invalido, status invalido o propiedad no permitida.
- `404 CATEGORY_NOT_FOUND`: `categoryCode` no existe.
- `409 INCIDENT_REFERENCE_CONFLICT`: `referenceCode` duplicado.
- `500 INTERNAL_SERVER_ERROR`: error inesperado sin exponer stack trace ni datos sensibles.

## Verificacion

En DataGrip:

- Revisar tablas `Incident` y `Category`.
- Confirmar `Incident.categoryId` como `NOT NULL`.
- Confirmar FK `Incident_categoryId_fkey`.
- Confirmar UNIQUE `Incident.referenceCode` y `Category.code`.
- Revisar `_prisma_migrations` y validar que existan las dos migraciones esperadas.

Con HTTP:

- Ejecutar los casos de `requests.http`.
- Verificar `GET /incidents`.
- Verificar `GET /categories`.
- Probar creacion valida, categoria inexistente, referencia duplicada, status invalido y propiedad `categoryId` no permitida.
