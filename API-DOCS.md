# API Gateway Documentation

> **🌍 Documentación en Español:** Si prefieres leer esta documentación en español, consulta [API-DOCS_ES.md](./API-DOCS_ES.md)
> 
> **📖 Main Documentation:** For comprehensive service documentation, see [README.md](./README.md) | Para documentación principal en español, ver [README_ES.md](./README_ES.md)

This document outlines the available REST API endpoints provided by the API Gateway service, which acts as a unified entry point for client applications to interact with the microservices ecosystem.

## Overview

The API Gateway serves as a proxy between client applications and the underlying microservices. It handles:

- Authentication and authorization
- Request routing
- Data transformation
- API documentation via Swagger UI
- Integration with PostgreSQL-based microservices for data persistence

## Base URL

All API endpoints are accessible at:

```
http://localhost:3000/api
```

API versioning is implemented through URL path prefixing:

```
http://localhost:3000/api/v1/[resource]
```

## Authentication

### Register a New User

**Endpoint:** `POST /api/auth/register`

**Description:** Creates a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "P@ssw0rd123!"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "John Doe",
    "email": "user@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5..."
}
```

### Login

**Endpoint:** `POST /api/auth/login`

**Description:** Authenticates a user and returns a JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "P@ssw0rd123!"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "John Doe",
    "email": "user@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5..."
}
```

### Verify Token

**Endpoint:** `GET /api/auth/verify`

**Description:** Verifies a JWT token and returns the user information.

**Headers:**
- `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "John Doe",
    "email": "user@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5..."
}
```

## Orders API

All order endpoints require authentication (Bearer token).

### Create a New Order

**Endpoint:** `POST /api/v1/orders`

**Description:** Creates a new order with the specified items.

**Headers:**
- `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "items": [
    { "productId": "123e4567-e89b-12d3-a456-426614174000", "quantity": 2 },
    { "productId": "523e8967-f31b-12d3-a456-426614174088", "quantity": 1 }
  ]
}
```

**Response (201):**
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
    "url": "https://payment-provider.com/checkout/sess_abc12345"
  }
}
```

### Get All Orders (Paginated)

**Endpoint:** `GET /api/v1/orders?page=1&limit=10&status=PENDING`

**Description:** Retrieves a paginated list of orders with optional status filtering.

**Headers:**
- `Authorization: Bearer {token}`

**Query Parameters:**
- `page` (optional, default=1): Page number
- `limit` (optional, default=10): Items per page
- `status` (optional): Filter by order status ("PENDING", "PAID", "DELIVERED", "CANCELLED")

**Response (200):**
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

### Get Orders by Status

**Endpoint:** `GET /api/v1/orders/:status?page=1&limit=10`

**Description:** Retrieves a paginated list of orders filtered by status.

**Headers:**
- `Authorization: Bearer {token}`

**Path Parameters:**
- `status`: Order status ("PENDING", "PAID", "DELIVERED", "CANCELLED")

**Query Parameters:**
- `page` (optional, default=1): Page number
- `limit` (optional, default=10): Items per page

**Response (200):** Same format as Get All Orders.

### Get Order by ID

**Endpoint:** `GET /api/v1/orders/id/:id`

**Description:** Retrieves a specific order by its ID.

**Headers:**
- `Authorization: Bearer {token}`

**Path Parameters:**
- `id`: Order UUID

**Response (200):**
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
      "name": "Product Name" 
    },
    ...
  ],
  "createdAt": "2023-05-01T10:30:00Z",
  "updatedAt": "2023-05-01T10:30:00Z"
}
```

### Change Order Status

**Endpoint:** `PATCH /api/v1/orders/:id`

**Description:** Updates the status of an order.

**Headers:**
- `Authorization: Bearer {token}`

**Path Parameters:**
- `id`: Order UUID

**Request Body:**
```json
{
  "status": "DELIVERED"
}
```

**Response (200):**
```json
{
  "id": "abc12345-e89b-12d3-a456-426614174000",
  "status": "DELIVERED",
  "updatedAt": "2023-05-01T14:30:00Z",
  ...
}
```

## Swagger Documentation

Interactive API documentation is available via Swagger UI at:

```
http://localhost:3000/api-docs
```

This provides a user-friendly interface to explore and test all available API endpoints.

## Error Handling

The API follows standard HTTP status codes:

- `200/201`: Successful operation
- `400`: Bad request (invalid data)
- `401`: Unauthorized (invalid token)
- `404`: Resource not found
- `500`: Server error

Error responses have a consistent format:

```json
{
  "statusCode": 400,
  "message": "Invalid order data",
  "error": "Bad Request"
}
```

## Authentication Requirements

All order endpoints require a valid JWT token obtained through the `/auth/login` or `/auth/register` endpoints. The token must be included in the Authorization header as a Bearer token:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5...
```

Tokens expire after a certain period and must be refreshed using the `/auth/verify` endpoint.
