import { Global, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { NATS_SERVICE, envs } from '../config';

/**
 * @module NatsModule
 * @description Configures the NATS client connection.
 */
@Global()
@Module({
  imports: [
    ClientsModule.register([
      {
        name: NATS_SERVICE, // Token for injection
        transport: Transport.NATS,
        options: { servers: envs.natsServers },
      },
    ]),
  ],
  exports: [
    // Export so other modules can inject the client
    ClientsModule.register([
      {
        name: NATS_SERVICE,
        transport: Transport.NATS,
        options: { servers: envs.natsServers },
      },
    ]),
  ],
})
export class NatsModule {}
