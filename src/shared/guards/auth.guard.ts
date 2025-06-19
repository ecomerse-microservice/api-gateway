import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthServicePort } from '../../modules/auth/application/ports/auth.service.port';

/**
 * @class AuthGuard
 * @implements CanActivate
 * @description Verifies JWT token from request header via the Auth Service Port.
 * Attaches user payload and refreshed token to the request object upon success.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(
    @Inject('AuthServicePort')
    private readonly authServicePort: AuthServicePort,
  ) {}

  /**
   * Determines if the current request is authorized.
   * @async
   * @param {ExecutionContext} context - The execution context.
   * @returns {Promise<boolean>} True if authorized, otherwise throws UnauthorizedException.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      this.logger.warn('Authorization token not found in header.');
      throw new UnauthorizedException('Token not found');
    }

    try {
      this.logger.debug('Verifying token via AuthServicePort...');
      // Call the auth service port (implemented by NatsAuthAdapter)
      const { user, token: newToken } =
        await this.authServicePort.verifyToken(token);

      if (!user) {
        this.logger.warn('Token verification successful but no user returned.');
        throw new UnauthorizedException(
          'Invalid user data returned from auth service',
        );
      }

      // Attach user and potentially refreshed token to the request object
      // Ensure 'user' and 'token' properties are allowed on the Express Request type if using strict TS checks
      (request as any)['user'] = user;
      (request as any)['token'] = newToken;
      this.logger.debug(`Token verified successfully for user: ${user.email}`);
    } catch (error: any) {
      this.logger.warn(`Token verification failed: ${error.message ?? error}`);
      // Throw standard UnauthorizedException regardless of the underlying RpcException details
      throw new UnauthorizedException('Invalid or expired token');
    }
    return true; // Access granted
  }

  /**
   * Extracts the Bearer token from the Authorization header.
   * @private
   * @param {Request} request - The incoming HTTP request.
   * @returns {string | undefined} The token string or undefined if not found/invalid format.
   */
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
