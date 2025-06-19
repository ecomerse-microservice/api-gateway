# Documentación del API Gateway

> **🌍 English Documentation:** If you prefer to read this documentation in English, see [API-DOCS.md](./API-DOCS.md)
> 
> **📖 Documentación Principal:** Para documentación completa del servicio, ver [README_ES.md](./README_ES.md) | For comprehensive service documentation in English, see [README.md](./README.md)

Este documento describe los endpoints de la API REST disponibles proporcionados por el servicio API Gateway, que actúa como un punto de entrada unificado para que las aplicaciones cliente interactúen con el ecosistema de microservicios.

## Descripción General

El API Gateway sirve como un proxy entre las aplicaciones cliente y los microservicios subyacentes. Maneja:

- Autenticación y autorización
- Enrutamiento de solicitudes
- Transformación de datos
- Documentación de API vía Swagger UI
- Integración con microservicios basados en PostgreSQL para persistencia de datos

## URL Base

Todos los endpoints de la API son accesibles en:

```
http://localhost:3000/api
```

El versionado de API se implementa a través de prefijos de ruta URL:

```
http://localhost:3000/api/v1/[recurso]
```

## Autenticación

### Registrar un Nuevo Usuario

**Endpoint:** `POST /api/auth/register`

**Descripción:** Crea una nueva cuenta de usuario.

**Cuerpo de la Solicitud:**
```json
{
  "name": "Juan Pérez",
  "email": "usuario@ejemplo.com",
  "password": "P@ssw0rd123!"
}
```

**Respuesta (201):**
```json
{
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Juan Pérez",
    "email": "usuario@ejemplo.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5..."
}
```

### Iniciar Sesión

**Endpoint:** `POST /api/auth/login`

**Descripción:** Autentica un usuario y retorna un token JWT.

**Cuerpo de la Solicitud:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "P@ssw0rd123!"
}
```

**Respuesta (200):**
```json
{
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Juan Pérez",
    "email": "usuario@ejemplo.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5..."
}
```

### Verificar Token

**Endpoint:** `GET /api/auth/verify`

**Descripción:** Verifica un token JWT y retorna la información del usuario.

**Encabezados:**
- `Authorization: Bearer {token}`

**Respuesta (200):**
```json
{
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Juan Pérez",
    "email": "usuario@ejemplo.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5..."
}
```

## API de Órdenes

Todos los endpoints de órdenes requieren autenticación (token Bearer).

### Crear una Nueva Orden

**Endpoint:** `POST /api/v1/orders`

**Descripción:** Crea una nueva orden con los artículos especificados.

**Encabezados:**
- `Authorization: Bearer {token}`

**Cuerpo de la Solicitud:**
```json
{
  "items": [
    { "productId": "123e4567-e89b-12d3-a456-426614174000", "quantity": 2 },
    { "productId": "523e8967-f31b-12d3-a456-426614174088", "quantity": 1 }
  ]
}
```

**Respuesta (201):**
```json
{
  "id": "abc12345-e89b-12d3-a456-426614174000",
  "totalAmount": 149.98,
  "items": [
    { "productId": "123e4567-e89b-12d3-a456-426614174000", "quantity": 2, "price": 49.99 },
    { "productId": "523e8967-f31b-12d3-a456-426614174088", "quantity": 1, "price": 50.00 }
  ],
  "status": "PENDING",
  "paymentSession": {
    "id": "sess_abc12345",
    "url": "https://proveedor-de-pagos.com/checkout/sess_abc12345"
  }
}
```

### Obtener Todas las Órdenes (Paginadas)

**Endpoint:** `GET /api/v1/orders?page=1&limit=10&status=PENDING`

**Descripción:** Recupera una lista paginada de órdenes con filtrado opcional por estado.

**Encabezados:**
- `Authorization: Bearer {token}`

**Parámetros de Consulta:**
- `page` (opcional, predeterminado=1): Número de página
- `limit` (opcional, predeterminado=10): Elementos por página
- `status` (opcional): Filtrar por estado de orden ("PENDING", "PAID", "DELIVERED", "CANCELLED")

**Respuesta (200):**
```json
{
  "data": [
    {
      "id": "abc12345-e89b-12d3-a456-426614174000",
      "totalAmount": 149.98,
      "status": "PENDING",
      "items": [...],
      "createdAt": "2023-05-01T10:30:00Z"
    },
    ...
  ],
  "meta": {
    "total": 25,
    "page": 1,
    "lastPage": 3
  }
}
```

### Obtener Órdenes por Estado

**Endpoint:** `GET /api/v1/orders/:status?page=1&limit=10`

**Descripción:** Recupera una lista paginada de órdenes filtradas por estado.

**Encabezados:**
- `Authorization: Bearer {token}`

**Parámetros de Ruta:**
- `status`: Estado de la orden ("PENDING", "PAID", "DELIVERED", "CANCELLED")

**Parámetros de Consulta:**
- `page` (opcional, predeterminado=1): Número de página
- `limit` (opcional, predeterminado=10): Elementos por página

**Respuesta (200):** Mismo formato que Obtener Todas las Órdenes.

### Obtener Orden por ID

**Endpoint:** `GET /api/v1/orders/id/:id`

**Descripción:** Recupera una orden específica por su ID.

**Encabezados:**
- `Authorization: Bearer {token}`

**Parámetros de Ruta:**
- `id`: UUID de la orden

**Respuesta (200):**
```json
{
  "id": "abc12345-e89b-12d3-a456-426614174000",
  "totalAmount": 149.98,
  "status": "PENDING",
  "items": [
    { 
      "productId": "123e4567-e89b-12d3-a456-426614174000", 
      "quantity": 2, 
      "price": 49.99,
      "name": "Nombre del Producto" 
    },
    ...
  ],
  "createdAt": "2023-05-01T10:30:00Z",
  "updatedAt": "2023-05-01T10:30:00Z"
}
```

### Cambiar Estado de Orden

**Endpoint:** `PATCH /api/v1/orders/:id`

**Descripción:** Actualiza el estado de una orden.

**Encabezados:**
- `Authorization: Bearer {token}`

**Parámetros de Ruta:**
- `id`: UUID de la orden

**Cuerpo de la Solicitud:**
```json
{
  "status": "DELIVERED"
}
```

**Respuesta (200):**
```json
{
  "id": "abc12345-e89b-12d3-a456-426614174000",
  "status": "DELIVERED",
  "updatedAt": "2023-05-01T14:30:00Z",
  ...
}
```

## Documentación Swagger

La documentación interactiva de la API está disponible vía Swagger UI en:

```
http://localhost:3000/api-docs
```

Esto proporciona una interfaz amigable para explorar y probar todos los endpoints de API disponibles.

## Manejo de Errores

La API sigue códigos de estado HTTP estándar:

- `200/201`: Operación exitosa
- `400`: Solicitud incorrecta (datos inválidos)
- `401`: No autorizado (token inválido)
- `404`: Recurso no encontrado
- `500`: Error del servidor

Las respuestas de error tienen un formato consistente:

```json
{
  "statusCode": 400,
  "message": "Datos de orden inválidos",
  "error": "Bad Request"
}
```

## Requisitos de Autenticación

Todos los endpoints de órdenes requieren un token JWT válido obtenido a través de los endpoints `/auth/login` o `/auth/register`. El token debe incluirse en el encabezado Authorization como un token Bearer:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5...
```

Los tokens expiran después de cierto período y deben refrescarse usando el endpoint `/auth/verify`. 