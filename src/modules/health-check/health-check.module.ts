import { Module } from '@nestjs/common';
import { HealthCheckController } from './controllers';

@Module({
  controllers: [HealthCheckController],
})
export class HealthCheckModule {}
