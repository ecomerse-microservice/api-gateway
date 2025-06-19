import { Module } from '@nestjs/common';
import { NatsOrderAdapter } from './infrastructure/clients-proxies/nats-order.adapter';
import { NatsModule } from 'src/transports/nats.module';
import { OrdersController } from './infrastructure/controllers';

@Module({
  controllers: [OrdersController],
  providers: [
    {
      provide: 'OrderServicePort',
      useClass: NatsOrderAdapter,
    },
  ],
})
export class OrdersModule {}
