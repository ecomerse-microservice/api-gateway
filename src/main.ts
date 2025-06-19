
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { envs } from './config';
import { Logger, ValidationPipe, RequestMethod } from '@nestjs/common';
import { AllHttpExceptionsFilter } from './shared/infrastructure/filters/http-exception.filter';
import { ResponseSanitizerInterceptor } from './shared/infrastructure/interceptors/response-sanitizer.interceptor';
import { setupSwagger } from './config/swagger.config';
import { versioningConfig } from './config/api-versioning';

async function bootstrap() {
  const logger = new Logger('Main-Gateway');

  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api', {
    exclude: [{ path: '', method: RequestMethod.GET }], // Exclude root health check
  });

  app.enableVersioning(versioningConfig);
  logger.log(
    `API versioning enabled: ${String(versioningConfig.type)} mode with default version ${String(versioningConfig.defaultVersion)}`,
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Apply Global Filters and Interceptors
  app.useGlobalFilters(new AllHttpExceptionsFilter());
  app.useGlobalInterceptors(new ResponseSanitizerInterceptor());
  logger.log('Applied global pipes, filters, and interceptors.');

  // Configure Swagger documentation
  setupSwagger(app);
  logger.log('Swagger documentation configured at /api/docs');

  await app.listen(envs.port);

  logger.log(`API Gateway running on port ${envs.port}`);
  logger.log('Health Check available at /');
  logger.log('API routes now available at /api/v1/*');
}
bootstrap();
