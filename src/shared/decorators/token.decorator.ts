import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

const logger = new Logger('TokenDecorator');

/**
 * @decorator Token
 * @description Extracts the 'token' property attached to the request object by AuthGuard.
 * Throws InternalServerErrorException if AuthGuard hasn't run or failed to attach the token.
 */
export const Token = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    const token = request.token; // Access token attached by AuthGuard

    if (!token) {
      logger.error(
        'Token not found in request. Ensure AuthGuard is used before this decorator.',
      );
      throw new InternalServerErrorException(
        'Token not found in request (AuthGuard malfunction?)',
      );
    }

    return token;
  },
);
