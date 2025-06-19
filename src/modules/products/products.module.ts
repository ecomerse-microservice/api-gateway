import { Module } from '@nestjs/common';
import { ProductsController } from './infrastructure/controllers';
import { NatsProductAdapter } from './infrastructure/client-proxies';

@Module({
  controllers: [ProductsController],
  providers: [
    {
      provide: 'ProductServicePort',
      useClass: NatsProductAdapter,
    },
  ],
})
export class ProductsModule {}
