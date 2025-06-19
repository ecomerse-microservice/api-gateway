import { Module } from '@nestjs/common';
import { NatsModule } from './transports/nats.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProductsModule } from './modules/products/products.module';
import { OrdersModule } from './modules/orders';
import { HealthCheckModule } from './modules/health-check/health-check.module';

/**
 * @module AppModule
 * @description The root module, importing feature proxy modules and transport module.
 */
@Module({
  imports: [
    NatsModule,
    AuthModule,
    ProductsModule,
    OrdersModule,
    HealthCheckModule,
  ],
})
export class AppModule {}
