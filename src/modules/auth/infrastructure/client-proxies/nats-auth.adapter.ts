import { Injectable, Inject, Logger } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError, firstValueFrom, throwError } from 'rxjs';
import { NATS_SERVICE } from '../../../../config';
import {
  AuthServicePort,
  VerifyUserResponse,
} from '../../application/ports/auth.service.port';

@Injectable()
export class NatsAuthAdapter implements AuthServicePort {
  private readonly logger = new Logger(NatsAuthAdapter.name);

  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {}

  async verifyToken(token: string): Promise<VerifyUserResponse> {
    this.logger.log(`Sending "auth.verify.user" request via NATS`);
    try {
      // Type assertion for the expected response structure
      const response = await firstValueFrom(
        this.client
          .send<VerifyUserResponse>('auth.verify.user', token)
          .pipe(catchError((err) => throwError(() => new RpcException(err)))),
      );
      this.logger.log(`Received "auth.verify.user" response successfully`);
      return response;
    } catch (error) {
      this.logger.error(
        `Error calling "auth.verify.user": ${error instanceof RpcException ? JSON.stringify(error.getError()) : error}`,
      );
      throw error; // Re-throw RpcException or wrapped error
    }
  }

  async register(registerDto: any): Promise<any> {
    this.logger.log(`Sending "auth.register.user" request via NATS`);
    return firstValueFrom(
      this.client
        .send('auth.register.user', registerDto)
        .pipe(catchError((err) => throwError(() => new RpcException(err)))),
    );
  }

  async login(loginDto: any): Promise<any> {
    this.logger.log(`Sending "auth.login.user" request via NATS`);
    return firstValueFrom(
      this.client
        .send('auth.login.user', loginDto)
        .pipe(catchError((err) => throwError(() => new RpcException(err)))),
    );
  }
}
