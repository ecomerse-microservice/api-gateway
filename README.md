# API Gateway (`api-gateway`)

> **🌍 Documentación en Español:** Si prefieres leer esta documentación en español, consulta [README_ES.md](./README_ES.md)
> 
> **📚 API Documentation:** For comprehensive API documentation, see [API-DOCS.md](./API-DOCS.md) | Para documentación de API en español, ver [API-DOCS_ES.md](./API-DOCS_ES.md)

## 1. Overview

This project implements the **API Gateway** for the microservices ecosystem using **NestJS**. It serves as the single entry point for external clients (e.g., web frontends, mobile applications) interacting with the backend system. Its primary responsibilities are:

* **Request Routing:** Receiving incoming HTTP requests and routing them to the appropriate downstream microservice (Auth, Products, Orders, Payments) via **NATS** messaging.
* **Protocol Translation:** Translating synchronous HTTP requests into asynchronous NATS messages (requests/replies).
* **API Aggregation/Facade:** Providing a unified and consistent HTTP API interface over potentially diverse microservice APIs.
* **Authentication & Authorization:** Handling initial JWT verification by delegating to the Auth microservice (`AuthGuard`).
* **API Documentation:** Exposing a consolidated view of the available HTTP endpoints via Swagger UI.
* **Cross-Cutting Concerns:** Applying global concerns like request validation, standardized error handling, response formatting/logging, and potentially rate limiting (not implemented yet).

This gateway acts as a crucial layer for decoupling clients from the internal microservice architecture, enhancing security and manageability. The gateway integrates with a PostgreSQL-based microservices ecosystem, providing seamless access to persistent data through the underlying services.

---

## 2. Architectural Approach

The API Gateway primarily follows the **API Gateway pattern**. It doesn't typically possess its own complex domain logic but focuses on routing, aggregation, and applying cross-cutting concerns.

* **Infrastructure Layer Focus:** The gateway mainly consists of infrastructure components:
    * **Controllers (`src/modules/*/infrastructure/controllers`):** Receive HTTP requests, validate DTOs, apply guards, and use injected client adapters (ports) to communicate with downstream services via NATS.
    * **Client Adapters (`src/modules/*/infrastructure/client-proxies`):** Implement service-specific ports (e.g., `AuthServicePort`, `ProductServicePort`) using the NestJS `ClientProxy` to send messages over NATS. These adapters abstract the NATS communication details.
    * **Shared Infrastructure (`src/shared`):** Contains common elements like the `AuthGuard`, custom decorators (`@User`, `@Token`), global filters (`AllHttpExceptionsFilter`), and global interceptors (`ResponseSanitizerInterceptor`).
* **Proxy Modules (`src/modules`):** Each downstream microservice has a corresponding module in the gateway (e.g., `AuthModule`, `ProductsModule`, `OrdersModule`). These modules bundle the controller and the NATS client adapter responsible for communicating with that specific service.
* **NATS Transport (`src/transports`):** The `NatsModule` configures the `ClientProxy` needed for NATS communication.

**Benefits:**

* **Single Entry Point:** Simplifies client interaction and centralizes cross-cutting concerns.
* **Decoupling:** Clients are unaware of the internal microservice decomposition.
* **Protocol Translation:** Bridges HTTP and NATS protocols.
* **Centralized Authentication:** Initial token verification occurs at the gateway.
* **Simplified Service Discovery:** Clients only need to know the gateway's address.

---

## 3. Project Structure

```
src/
├── modules/                  # Feature Proxy Modules
│   ├── auth/                 # --- Auth Service Proxy ---
│   │   ├── application/      # Ports defining communication contract
│   │   │   └── ports/        # --> AuthServicePort
│   │   ├── infrastructure/     # Implementation details for proxy
│   │   │   ├── client-proxies/ # --> NatsAuthAdapter (Calls Auth MS via NATS)
│   │   │   ├── controllers/    # --> AuthController (HTTP Endpoints: /register, /login, /verify)
│   │   │   └── dto/            # --> LoginUserDto, RegisterUserDto (for HTTP request validation)
│   │   └── auth.module.ts      # Module definition
│   ├── orders/               # --- Orders Service Proxy ---
│   │   ├── application/
│   │   │   └── ports/        # --> OrderServicePort
│   │   ├── infrastructure/
│   │   │   ├── clients-proxies/ # --> NatsOrderAdapter (Calls Orders MS via NATS)
│   │   │   ├── controllers/    # --> OrdersController (HTTP Endpoints: CRUD, status change)
│   │   │   └── dtos/           # --> CreateOrderDto, OrderPaginationDto, StatusDto
│   │   └── orders.module.ts    # Module definition
│   ├── products/             # --- Products Service Proxy ---
│   │   ├── application/
│   │   │   └── ports/        # --> ProductServicePort
│   │   ├── infrastructure/
│   │   │   ├── client-proxies/ # --> NatsProductAdapter (Calls Products MS via NATS)
│   │   │   ├── controllers/    # --> ProductsController (HTTP Endpoints: CRUD)
│   │   │   └── dto/            # --> CreateProductDto, UpdateProductDto, OrderItemDto
│   │   └── products.module.ts  # Module definition
│   └── health-check/         # --- Health Check ---
│       ├── controllers/      # --> HealthCheckController (HTTP Endpoint: /)
│       └── health-check.module.ts # Module definition
├── shared/                   # Shared components across Gateway modules
│   ├── decorators/           # --> @User, @Token decorators
│   ├── dtos/                 # --> PaginationDto
│   ├── guards/               # --> AuthGuard
│   └── infrastructure/
│       ├── filters/          # --> AllHttpExceptionsFilter
│       └── interceptors/     # --> ResponseSanitizerInterceptor
├── config/                   # Configuration (envs, services, swagger, versioning)
├── transports/               # NATS client configuration (NatsModule)
├── app.module.ts             # Root Application Module
└── main.ts                   # Application Bootstrap (HTTP Server)
```

---

## 4. Key Technologies & Dependencies

* **Node.js:** Runtime environment.
* **TypeScript:** Primary language.
* **NestJS (`@nestjs/*`):** Core framework, including microservices client capabilities and Swagger integration.
* **NATS (`nats`, `@nestjs/microservices`):** Used by `ClientProxy` to communicate with downstream microservices.
* **Swagger (`@nestjs/swagger`):** For generating OpenAPI documentation for the gateway's HTTP API.
* **Class Validator / Class Transformer:** For validating incoming HTTP request DTOs.
* **Dotenv / Joi:** Environment variable loading and validation.

---

## 5. Setup and Running

### 5.1. Prerequisites

* Node.js (v16.13 or later recommended)
* NPM or Yarn
* NATS Server instance running and accessible by the gateway and downstream services.
* Running instances of the downstream microservices (Auth, Products, Orders, Payments).

### 5.2. Installation

```bash
npm install
# or
yarn install
```

### 5.3. Environment Configuration

Create a `.env` file in the project root. Required variables are defined in `src/config/envs.ts`:

```dotenv
# .env example
PORT=3000 # Port the API Gateway will listen on

# NATS Configuration (Must match downstream services)
NATS_SERVERS=nats://localhost:4222 # Comma-separated list if applicable
```

### 5.4. Running the Service

* **Development (with hot-reloading):**
    ```bash
    # Ensure NATS server and ALL downstream microservices are running first
    npm run start:dev
    ```
* **Production:**
    ```bash
    npm run build
    npm run start:prod
    ```

The API Gateway will start listening for HTTP requests on the configured `PORT`.

---

## 6. API Documentation & Endpoints

The gateway exposes a versioned RESTful API.

* **Base Path:** `/api`
* **Versioning:** URI-based, prefixed with `v` (e.g., `/api/v1/...`). Default version is `v1`.
* **Swagger Documentation:** Available at `/api/docs`.

**Main Resource Endpoints (Version 1):**

* **`GET /`:** Health check endpoint.
* **`POST /api/v1/auth/register`:** Register a new user.
* **`POST /api/v1/auth/login`:** Authenticate a user.
* **`GET /api/v1/auth/verify`:** Verify JWT token (requires `Authorization: Bearer <token>`).
* **`POST /api/v1/products`:** Create a new product (requires auth).
* **`GET /api/v1/products`:** Get a paginated list of products.
* **`GET /api/v1/products/:id`:** Get a product by ID.
* **`PATCH /api/v1/products/:id`:** Update a product (requires auth).
* **`DELETE /api/v1/products/:id`:** Delete a product (requires auth).
* **`POST /api/v1/orders`:** Create a new order (requires auth).
* **`GET /api/v1/orders`:** Get a paginated list of orders (requires auth).
* **`GET /api/v1/orders/id/:id`:** Get an order by ID (requires auth).
* **`GET /api/v1/orders/:status`:** Get orders filtered by status (requires auth).
* **`PATCH /api/v1/orders/:id`:** Change order status (requires auth).

*(Refer to the Swagger documentation at `/api/docs` for detailed request/response schemas and parameters).*

---

## 7. Authentication

* **Mechanism:** JWT Bearer Tokens.
* **Flow:**
    1. Client obtains a JWT from `/api/v1/auth/login` or `/api/v1/auth/register`.
    2. For protected routes, the client includes the token in the `Authorization: Bearer <token>` header.
    3. The `AuthGuard` intercepts the request.
    4. The guard extracts the token and uses the `AuthServicePort` (implemented by `NatsAuthAdapter`) to send a `auth.verify.user` message to the Auth microservice via NATS.
    5. If the Auth microservice confirms the token is valid, it returns the user payload and a potentially refreshed token.
    6. The `AuthGuard` attaches the `user` payload and the `token` to the incoming `request` object.
    7. Controller handlers can access this data using the custom `@User()` and `@Token()` decorators.
    8. If verification fails at any step, the guard throws an `UnauthorizedException`, which is handled by the global HTTP exception filter.

---

## 8. Error Handling

* **Global HTTP Filter:** The `AllHttpExceptionsFilter` catches all errors within the HTTP request lifecycle.
* **RPC Error Translation:** Crucially, this filter also catches `RpcException`s that bubble up from the NATS client adapters when downstream microservices return errors. It translates these RPC errors into appropriate HTTP status codes and formats them into the standard HTTP error response. (e.g., an RPC error with status 404 becomes an HTTP 404 response).
* **Validation Errors:** The global `ValidationPipe` handles DTO validation errors, returning HTTP 400 responses automatically.

---

## 9. Best Practices Employed

* **API Gateway Pattern:** Centralized entry point, routing, facade.
* **Decoupling:** Gateway is decoupled from downstream service implementations via NATS messaging and client adapters/ports.
* **Centralized Authentication:** Handles initial token verification via `AuthGuard`.
* **API Versioning:** Ensures backward compatibility for clients.
* **API Documentation:** Uses Swagger/OpenAPI for clear documentation.
* **Standardized Error Handling:** Consistent error responses via global filters.
* **Request Validation:** Global pipes ensure data integrity using DTOs.
* **Configuration Management:** Environment variables loaded and validated centrally.

---

## 10. Testing Strategy

* **End-to-End (E2E) Tests (`test/`):** The most valuable tests for the gateway. These tests should make HTTP requests to the gateway's endpoints and assert the expected responses. Downstream microservices can be:
    * Running in a test environment.
    * Mocked at the NATS transport layer (using techniques like overriding `ClientProxy` providers). The existing `products.e2e-spec.ts` demonstrates mocking the service port.
* **Unit Tests:** Less critical for the gateway itself compared to downstream services, but can be used for specific components like complex guards or utility functions if needed.