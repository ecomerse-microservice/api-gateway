import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { RpcException } from '@nestjs/microservices';

interface StandardHttpError {
  statusCode: number;
  message: string | object;
  timestamp: string;
  path: string;
}

/**
 * @class AllHttpExceptionsFilter
 * @implements ExceptionFilter
 * @description Catches HttpExceptions, RpcExceptions bubbled up from clients, and other errors for HTTP requests.
 */
@Catch()
export class AllHttpExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('HttpExceptionFilter');

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const path = request?.url || 'N/A';
    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | object = 'Internal server error';

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      message = exception.getResponse();
    } else if (exception instanceof RpcException) {
      // Attempt to translate RpcException to HTTP status
      const rpcError = exception.getError();
      if (typeof rpcError === 'object' && rpcError !== null) {
        statusCode = (rpcError as any).status ?? HttpStatus.BAD_GATEWAY; // 502 if downstream fails badly
        message = (rpcError as any).message ?? 'Error communicating with downstream service.';
      } else {
        message = rpcError;
        statusCode = HttpStatus.BAD_GATEWAY;
      }
      // Log specifically that this was an RPC error translation
      this.logger.error(
        `[http<-rpc] ${statusCode} ${path} | RPC Error: ${JSON.stringify(rpcError)}`,
        exception.stack,
      );
    } else if (exception instanceof Error) {
      // Standard Error
      message = exception.message;
      this.logger.error(
        `[http] 500 ${path} | Unhandled Error: ${message}`,
        exception.stack,
      );
    } else {
      // Unknown exception type
      this.logger.error(
        `[http] 500 ${path} | Unknown exception type caught: ${JSON.stringify(exception)}`,
      );
    }

    const errorResponse: StandardHttpError = {
      statusCode: statusCode,
      message: message,
      timestamp: new Date().toISOString(),
      path: path,
    };

    if (!response.headersSent) {
      response.status(statusCode).json(errorResponse);
    } else {
      this.logger.warn(
        `[http] Headers already sent for path ${path}, cannot send error response.`,
      );
    }
  }
}
