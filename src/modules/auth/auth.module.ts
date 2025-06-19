import { Global, Module } from '@nestjs/common';
import { NatsModule } from 'src/transports/nats.module';
import { AuthGuard } from '../../shared/guards';
import { NatsAuthAdapter } from './infrastructure/client-proxies';
import { AuthController } from './infrastructure/controllers';

@Global()
@Module({
  controllers: [AuthController],
  providers: [
    AuthGuard,
    {
      provide: 'AuthServicePort',
      useClass: NatsAuthAdapter,
    },
  ],
  exports: [
    AuthGuard,
    {
      provide: 'AuthServicePort',
      useClass: NatsAuthAdapter,
    },
  ],
})
export class AuthModule {}
