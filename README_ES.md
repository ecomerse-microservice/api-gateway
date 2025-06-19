# API Gateway (`api-gateway`)

> **🌍 English Documentation:** If you prefer to read this documentation in English, see [README.md](./README.md)
> 
> **📚 Documentación de API:** Para documentación completa de la API, ver [API-DOCS_ES.md](./API-DOCS_ES.md) | For API documentation in English, see [API-DOCS.md](./API-DOCS.md)

## 1. Descripción General

Este proyecto implementa el **API Gateway** para el ecosistema de microservicios usando **NestJS**. Sirve como el punto de entrada único para clientes externos (ej., frontends web, aplicaciones móviles) que interactúan con el sistema backend. Sus responsabilidades principales son:

* **Enrutamiento de Solicitudes:** Recibir solicitudes HTTP entrantes y enrutarlas al microservicio downstream apropiado (Auth, Products, Orders, Payments) vía mensajería **NATS**.
* **Traducción de Protocolos:** Traducir solicitudes HTTP síncronas en mensajes NATS asíncronos (solicitudes/respuestas).
* **Agregación/Fachada de API:** Proporcionar una interfaz de API HTTP unificada y consistente sobre APIs de microservicios potencialmente diversos.
* **Autenticación y Autorización:** Manejar verificación inicial de JWT delegando al microservicio Auth (`AuthGuard`).
* **Documentación de API:** Exponer una vista consolidada de los endpoints HTTP disponibles vía Swagger UI.
* **Preocupaciones Transversales:** Aplicar preocupaciones globales como validación de solicitudes, manejo estandarizado de errores, formateo/logging de respuestas, y potencialmente limitación de velocidad (aún no implementada).

Este gateway actúa como una capa crucial para desacoplar clientes de la arquitectura interna de microservicios, mejorando la seguridad y manejabilidad. El gateway se integra con un ecosistema de microservicios basado en PostgreSQL, proporcionando acceso transparente a datos persistentes a través de los servicios subyacentes.

---

## 2. Enfoque Arquitectónico

El API Gateway sigue principalmente el **patrón API Gateway**. Típicamente no posee su propia lógica de dominio compleja sino que se enfoca en enrutamiento, agregación y aplicación de preocupaciones transversales.

* **Enfoque en Capa de Infraestructura:** El gateway consiste principalmente en componentes de infraestructura:
    * **Controladores (`src/modules/*/infrastructure/controllers`):** Reciben solicitudes HTTP, validan DTOs, aplican guards, y usan adaptadores de cliente inyectados (puertos) para comunicarse con servicios downstream vía NATS.
    * **Adaptadores de Cliente (`src/modules/*/infrastructure/client-proxies`):** Implementan puertos específicos de servicio (ej., `AuthServicePort`, `ProductServicePort`) usando el `ClientProxy` de NestJS para enviar mensajes sobre NATS. Estos adaptadores abstraen los detalles de comunicación NATS.
    * **Infraestructura Compartida (`src/shared`):** Contiene elementos comunes como el `AuthGuard`, decoradores personalizados (`@User`, `@Token`), filtros globales (`AllHttpExceptionsFilter`), e interceptores globales (`ResponseSanitizerInterceptor`).
* **Módulos Proxy (`src/modules`):** Cada microservicio downstream tiene un módulo correspondiente en el gateway (ej., `AuthModule`, `ProductsModule`, `OrdersModule`). Estos módulos agrupan el controlador y el adaptador de cliente NATS responsable de comunicarse con ese servicio específico.
* **Transporte NATS (`src/transports`):** El `NatsModule` configura el `ClientProxy` necesario para comunicación NATS.

**Beneficios:**

* **Punto de Entrada Único:** Simplifica la interacción del cliente y centraliza preocupaciones transversales.
* **Desacoplamiento:** Los clientes no conocen la descomposición interna de microservicios.
* **Traducción de Protocolos:** Conecta protocolos HTTP y NATS.
* **Autenticación Centralizada:** La verificación inicial de tokens ocurre en el gateway.
* **Descubrimiento de Servicios Simplificado:** Los clientes solo necesitan conocer la dirección del gateway.

---

## 3. Estructura del Proyecto

```
src/
├── modules/                  # Módulos Proxy de Características
│   ├── auth/                 # --- Proxy del Servicio Auth ---
│   │   ├── application/      # Puertos definiendo contrato de comunicación
│   │   │   └── ports/        # --> AuthServicePort
│   │   ├── infrastructure/     # Detalles de implementación para proxy
│   │   │   ├── client-proxies/ # --> NatsAuthAdapter (Llama Auth MS vía NATS)
│   │   │   ├── controllers/    # --> AuthController (Endpoints HTTP: /register, /login, /verify)
│   │   │   └── dto/            # --> LoginUserDto, RegisterUserDto (para validación de solicitud HTTP)
│   │   └── auth.module.ts      # Definición del módulo
│   ├── orders/               # --- Proxy del Servicio Orders ---
│   │   ├── application/
│   │   │   └── ports/        # --> OrderServicePort
│   │   ├── infrastructure/
│   │   │   ├── clients-proxies/ # --> NatsOrderAdapter (Llama Orders MS vía NATS)
│   │   │   ├── controllers/    # --> OrdersController (Endpoints HTTP: CRUD, cambio de estado)
│   │   │   └── dtos/           # --> CreateOrderDto, OrderPaginationDto, StatusDto
│   │   └── orders.module.ts    # Definición del módulo
│   ├── products/             # --- Proxy del Servicio Products ---
│   │   ├── application/
│   │   │   └── ports/        # --> ProductServicePort
│   │   ├── infrastructure/
│   │   │   ├── client-proxies/ # --> NatsProductAdapter (Llama Products MS vía NATS)
│   │   │   ├── controllers/    # --> ProductsController (Endpoints HTTP: CRUD)
│   │   │   └── dto/            # --> CreateProductDto, UpdateProductDto, OrderItemDto
│   │   └── products.module.ts  # Definición del módulo
│   └── health-check/         # --- Health Check ---
│       ├── controllers/      # --> HealthCheckController (Endpoint HTTP: /)
│       └── health-check.module.ts # Definición del módulo
├── shared/                   # Componentes compartidos entre módulos Gateway
│   ├── decorators/           # --> Decoradores @User, @Token
│   ├── dtos/                 # --> PaginationDto
│   ├── guards/               # --> AuthGuard
│   └── infrastructure/
│       ├── filters/          # --> AllHttpExceptionsFilter
│       └── interceptors/     # --> ResponseSanitizerInterceptor
├── config/                   # Configuración (envs, services, swagger, versioning)
├── transports/               # Configuración del cliente NATS (NatsModule)
├── app.module.ts             # Módulo Raíz de la Aplicación
└── main.ts                   # Bootstrap de la Aplicación (Servidor HTTP)
```

---

## 4. Tecnologías y Dependencias Clave

* **Node.js:** Entorno de ejecución.
* **TypeScript:** Lenguaje principal.
* **NestJS (`@nestjs/*`):** Framework central, incluyendo capacidades de cliente de microservicios e integración Swagger.
* **NATS (`nats`, `@nestjs/microservices`):** Usado por `ClientProxy` para comunicarse con microservicios downstream.
* **Swagger (`@nestjs/swagger`):** Para generar documentación OpenAPI para la API HTTP del gateway.
* **Class Validator / Class Transformer:** Para validar DTOs de solicitudes HTTP entrantes.
* **Dotenv / Joi:** Carga y validación de variables de entorno.

---

## 5. Configuración y Ejecución

### 5.1. Prerrequisitos

* Node.js (v16.13 o posterior recomendado)
* NPM o Yarn
* Instancia de servidor NATS ejecutándose y accesible por el gateway y servicios downstream.
* Instancias ejecutándose de los microservicios downstream (Auth, Products, Orders, Payments).

### 5.2. Instalación

```bash
npm install
# o
yarn install
```

### 5.3. Configuración del Entorno

Crea un archivo `.env` en la raíz del proyecto. Las variables requeridas están definidas en `src/config/envs.ts`:

```dotenv
# Ejemplo de .env
PORT=3000 # Puerto en el que el API Gateway escuchará

# Configuración NATS (Debe coincidir con servicios downstream)
NATS_SERVERS=nats://localhost:4222 # Lista separada por comas si aplica
```

### 5.4. Ejecutar el Servicio

* **Desarrollo (con recarga en caliente):**
    ```bash
    # Asegurar que el servidor NATS y TODOS los microservicios downstream estén ejecutándose primero
    npm run start:dev
    ```
* **Producción:**
    ```bash
    npm run build
    npm run start:prod
    ```

El API Gateway comenzará a escuchar solicitudes HTTP en el `PORT` configurado.

---

## 6. Documentación de API y Endpoints

El gateway expone una API RESTful versionada.

* **Ruta Base:** `/api`
* **Versionado:** Basado en URI, prefijado con `v` (ej., `/api/v1/...`). La versión por defecto es `v1`.
* **Documentación Swagger:** Disponible en `/api/docs`.

**Endpoints de Recursos Principales (Versión 1):**

* **`GET /`:** Endpoint de verificación de salud.
* **`POST /api/v1/auth/register`:** Registrar un nuevo usuario.
* **`POST /api/v1/auth/login`:** Autenticar un usuario.
* **`GET /api/v1/auth/verify`:** Verificar token JWT (requiere `Authorization: Bearer <token>`).
* **`POST /api/v1/products`:** Crear un nuevo producto (requiere auth).
* **`GET /api/v1/products`:** Obtener una lista paginada de productos.
* **`GET /api/v1/products/:id`:** Obtener un producto por ID.
* **`PATCH /api/v1/products/:id`:** Actualizar un producto (requiere auth).
* **`DELETE /api/v1/products/:id`:** Eliminar un producto (requiere auth).
* **`POST /api/v1/orders`:** Crear una nueva orden (requiere auth).
* **`GET /api/v1/orders`:** Obtener una lista paginada de órdenes (requiere auth).
* **`GET /api/v1/orders/id/:id`:** Obtener una orden por ID (requiere auth).
* **`GET /api/v1/orders/:status`:** Obtener órdenes filtradas por estado (requiere auth).
* **`PATCH /api/v1/orders/:id`:** Cambiar estado de orden (requiere auth).

*(Consulta la documentación Swagger en `/api/docs` para esquemas detallados de solicitud/respuesta y parámetros).*

---

## 7. Autenticación

* **Mecanismo:** Tokens JWT Bearer.
* **Flujo:**
    1. El cliente obtiene un JWT de `/api/v1/auth/login` o `/api/v1/auth/register`.
    2. Para rutas protegidas, el cliente incluye el token en el encabezado `Authorization: Bearer <token>`.
    3. El `AuthGuard` intercepta la solicitud.
    4. El guard extrae el token y usa el `AuthServicePort` (implementado por `NatsAuthAdapter`) para enviar un mensaje `auth.verify.user` al microservicio Auth vía NATS.
    5. Si el microservicio Auth confirma que el token es válido, retorna el payload del usuario y un token potencialmente refrescado.
    6. El `AuthGuard` adjunta el payload del `user` y el `token` al objeto `request` entrante.
    7. Los manejadores de controlador pueden acceder a estos datos usando los decoradores personalizados `@User()` y `@Token()`.
    8. Si la verificación falla en cualquier paso, el guard lanza una `UnauthorizedException`, que es manejada por el filtro de excepciones HTTP global.

---

## 8. Manejo de Errores

* **Filtro HTTP Global:** El `AllHttpExceptionsFilter` captura todos los errores dentro del ciclo de vida de solicitud HTTP.
* **Traducción de Errores RPC:** Crucialmente, este filtro también captura `RpcException`s que burbujean desde los adaptadores de cliente NATS cuando los microservicios downstream retornan errores. Traduce estos errores RPC en códigos de estado HTTP apropiados y los formatea en la respuesta de error HTTP estándar. (ej., un error RPC con estado 404 se convierte en una respuesta HTTP 404).
* **Errores de Validación:** El `ValidationPipe` global maneja errores de validación de DTO, retornando respuestas HTTP 400 automáticamente.

---

## 9. Mejores Prácticas Empleadas

* **Patrón API Gateway:** Punto de entrada centralizado, enrutamiento, fachada.
* **Desacoplamiento:** El gateway está desacoplado de implementaciones de servicios downstream vía mensajería NATS y adaptadores/puertos de cliente.
* **Autenticación Centralizada:** Maneja verificación inicial de tokens vía `AuthGuard`.
* **Versionado de API:** Asegura compatibilidad hacia atrás para clientes.
* **Documentación de API:** Usa Swagger/OpenAPI para documentación clara.
* **Manejo Estandarizado de Errores:** Respuestas de error consistentes vía filtros globales.
* **Validación de Solicitudes:** Pipes globales aseguran integridad de datos usando DTOs.
* **Gestión de Configuración:** Variables de entorno cargadas y validadas centralmente.

---

## 10. Estrategia de Pruebas

* **Pruebas End-to-End (E2E) (`test/`):** Las pruebas más valiosas para el gateway. Estas pruebas deben hacer solicitudes HTTP a los endpoints del gateway y afirmar las respuestas esperadas. Los microservicios downstream pueden estar:
    * Ejecutándose en un entorno de prueba.
    * Mockeados en la capa de transporte NATS (usando técnicas como sobrescribir proveedores `ClientProxy`). El `products.e2e-spec.ts` existente demuestra mockear el puerto de servicio.
* **Pruebas Unitarias:** Menos críticas para el gateway mismo comparado con servicios downstream, pero pueden usarse para componentes específicos como guards complejos o funciones de utilidad si es necesario. 