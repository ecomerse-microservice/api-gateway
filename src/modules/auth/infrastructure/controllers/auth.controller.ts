import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';

import { AuthGuard } from '../../../../shared/guards/auth.guard';
import { Token, User } from '../../../../shared/decorators';
import { AuthServicePort, UserPayload } from '../../application/ports';
import { LoginUserDto, RegisterUserDto } from '../dto';
/**
 * @interface AuthenticatedRequest
 * @description Extends Express Request to include user and token properties added by AuthGuard.
 */
interface AuthenticatedRequest extends Request {
  user: UserPayload;
  token: string;
}

@ApiTags('auth')
@Controller('auth') // Base path /api/auth (due to global prefix)
export class AuthController {
  /**
   * @constructor
   * @param {AuthServicePort} authServicePort - Injected auth service port implementation (NatsAuthAdapter).
   */
  constructor(
    @Inject('AuthServicePort')
    private readonly authServicePort: AuthServicePort,
  ) {}

  /**
   * Handles POST /api/auth/register requests. Proxies to auth microservice.
   * @param {RegisterUserDto} registerUserDto - User registration data.
   * @returns {Promise<any>} Response from the auth microservice.
   */
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterUserDto })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    schema: {
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
          },
        },
        token: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid registration data',
  })
  @ApiResponse({
    status: 409,
    description: 'Email already registered',
  })
  async registerUser(@Body() registerUserDto: RegisterUserDto) {
    // Using async/await for cleaner promise handling with the port
    try {
      return await this.authServicePort.register(registerUserDto);
    } catch (error: any) {
      // The HttpExceptionFilter will catch this RpcException
      throw error; // Re-throw the RpcException caught by the adapter
    }
  }

  /**
   * Handles POST /api/auth/login requests. Proxies to auth microservice.
   * @param {LoginUserDto} loginUserDto - User login credentials.
   * @returns {Promise<any>} Response from the auth microservice.
   */
  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({ type: LoginUserDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
          },
        },
        token: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
  })
  async loginUser(@Body() loginUserDto: LoginUserDto) {
    try {
      return await this.authServicePort.login(loginUserDto);
    } catch (error: any) {
      throw error; // Re-throw the RpcException
    }
  }

  /**
   * Handles GET /api/auth/verify requests. Requires a valid Bearer token.
   * Uses AuthGuard to verify token and decorators to extract user/token.
   * @param {UserPayload} user - User payload injected by @User decorator.
   * @param {string} token - Token injected by @Token decorator.
   * @returns {object} The user payload and the (potentially refreshed) token.
   */
  @UseGuards(AuthGuard) // Apply the guard to this route
  @Get('verify')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Verify and renew JWT token' })
  @ApiResponse({
    status: 200,
    description: 'Token verified successfully',
    schema: {
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
          },
        },
        token: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired token',
  })
  verifyToken(@User() user: UserPayload, @Token() token: string) {
    // AuthGuard already performed verification and attached user/token
    // We just return the data attached to the request by the guard/decorators
    return { user, token };
  }
}
