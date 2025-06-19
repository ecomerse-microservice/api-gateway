import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';
import { apiVersions } from './api-versioning';

/**
 * Configures and initializes Swagger documentation for the API.
 * @param {INestApplication} app - The NestJS application instance.
 */
export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Microservices API Gateway')
    .setDescription(
      `
      API Gateway for the sales microservices system
      
      ## API Versions
      
      This API is versioned. Routes follow the format: \`/api/v{version}/{resource}\`
      
      Available versions:
      ${apiVersions.map((v) => `- v${v}`).join('\n')}
      
      The current default version is v${apiVersions[0]}
    `,
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter your JWT token',
        in: 'header',
      },
      'JWT-auth', // This is the name to reference in controllers
    )
    .addTag('auth', 'Authentication operations')
    .addTag('products', 'Product management')
    .addTag('orders', 'Purchase order management')
    .addTag('health', 'System health checks')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    explorer: true,
    swaggerOptions: {
      filter: true,
      showRequestDuration: true,
    },
  });
}
