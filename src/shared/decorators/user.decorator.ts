import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { UserPayload } from '../../modules/auth/application/ports/auth.service.port'; // Import the UserPayload type

const logger = new Logger('UserDecorator');

/**
 * @decorator User
 * @description Extracts the 'user' property attached to the request object by AuthGuard.
 * Throws InternalServerErrorException if AuthGuard hasn't run or failed to attach the user.
 * @returns {UserPayload} The user payload extracted from the verified token.
 */
export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserPayload => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user; // Access user attached by AuthGuard

    if (!user) {
      logger.error(
        'User not found in request. Ensure AuthGuard is used before this decorator.',
      );
      throw new InternalServerErrorException(
        'User not found in request (AuthGuard malfunction?)',
      );
    }

    return user; // Return the user object of type UserPayload
  },
);
