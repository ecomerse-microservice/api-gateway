import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

/**
 * @class HealthCheckController
 * @description Provides a simple HTTP GET endpoint for health checks.
 */
@ApiTags('health')
@Controller('/') // Route for the root path
export class HealthCheckController {
  /**
   * Handles GET requests to the root path.
   * @returns {string} A simple health status message.
   */
  @Get()
  @ApiOperation({ summary: 'Check the operational status of the API Gateway' })
  @ApiResponse({
    status: 200,
    description: 'API Gateway operativo',
    schema: {
      type: 'string',
      example: 'API Gateway is up and running!',
    },
  })
  healthCheck(): string {
    return 'API Gateway is up and running!';
  }
}
