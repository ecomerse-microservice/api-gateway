import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Inject,
  ParseUUIDPipe,
  Query,
  Patch,
  UseGuards,
  Version,
} from '@nestjs/common';
import { PaginationDto } from '../../../../shared/dtos';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { OrderServicePort } from '../../application/ports';
import { AuthGuard } from 'src/shared/guards';
import { CreateOrderDto, OrderPaginationDto, StatusDto } from '../dtos';

/**
 * @class OrdersController
 * @description Exposes REST endpoints for order operations, proxied to the Order MS via NATS.
 */
@ApiTags('orders')
@Controller('orders') // Base path /api/v1/orders
@UseGuards(AuthGuard) // Secure all order routes by default
@ApiBearerAuth('JWT-auth')
export class OrdersController {
  /**
   * @constructor
   * @param {OrderServicePort} orderServicePort - Injected order service port implementation.
   */
  constructor(
    @Inject('OrderServicePort')
    private readonly orderServicePort: OrderServicePort,
  ) {}

  /**
   * Handles POST /api/v1/orders requests.
   * @param {CreateOrderDto} createOrderDto - Order data.
   * @returns {Promise<any>} Response from the order microservice.
   */
  @Post()
  @Version('1')
  @ApiOperation({ summary: 'Create a new order' })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({
    status: 201,
    description: 'Order created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid order data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or expired token',
  })
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.orderServicePort.createOrder(createOrderDto);
  }

  /**
   * Handles GET /api/v1/orders requests.
   * @param {OrderPaginationDto} orderPaginationDto - Pagination and status filter query params.
   * @returns {Promise<any>} Paginated list of orders.
   */
  @Get()
  @Version('1')
  @ApiOperation({ summary: 'Get paginated list of orders' })
  @ApiResponse({
    status: 200,
    description: 'Order list retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or expired token',
  })
  findAll(@Query() orderPaginationDto: OrderPaginationDto) {
    // The controller receives validated DTO (including status if provided)
    // The port adapter will send this DTO to the NATS microservice
    return this.orderServicePort.findAllOrders(orderPaginationDto);
  }

  /**
   * Handles GET /api/v1/orders/id/:id requests.
   * @param {string} id - Order ID (UUID/CUID) from URL parameter.
   * @returns {Promise<any>} The requested order details.
   */
  @Get('id/:id') // Changed route to avoid conflict with :status
  @Version('1')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiParam({
    name: 'id',
    description: 'Order ID (UUID)',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Order retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or expired token',
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
  })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    // Assuming Order ID is UUID
    return this.orderServicePort.findOneOrder(id);
  }

  /**
   * Handles GET /api/v1/orders/:status requests.
   * @param {StatusDto} statusDto - Status from URL parameter.
   * @param {PaginationDto} paginationDto - Pagination query parameters.
   * @returns {Promise<any>} Paginated list of orders filtered by status.
   */
  @Get(':status') // This route now correctly captures status
  @Version('1')
  @ApiOperation({ summary: 'Get paginated list of orders by status' })
  @ApiParam({
    name: 'status',
    description: 'Order status (PENDING, PAID, DELIVERED, CANCELLED)',
    enum: ['PENDING', 'PAID', 'DELIVERED', 'CANCELLED'],
  })
  @ApiResponse({
    status: 200,
    description: 'Filtered order list retrieved successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid order status',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or expired token',
  })
  findAllByStatus(
    @Param() statusDto: StatusDto, // Validate status from Param
    @Query() paginationDto: PaginationDto, // Validate pagination from Query
  ) {
    const orderPagination: OrderPaginationDto = {
      ...paginationDto,
      status: statusDto.status,
    };
    return this.orderServicePort.findAllOrders(orderPagination);
  }

  /**
   * Handles PATCH /api/v1/orders/:id requests.
   * @param {string} id - Order ID (UUID/CUID) from URL parameter.
   * @param {StatusDto} statusDto - New status from request body.
   * @returns {Promise<any>} The updated order details.
   */
  @Patch(':id')
  @Version('1')
  @ApiOperation({ summary: 'Change order status' })
  @ApiParam({
    name: 'id',
    description: 'Order ID (UUID)',
    type: 'string',
  })
  @ApiBody({ type: StatusDto })
  @ApiResponse({
    status: 200,
    description: 'Order status updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid order status',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or expired token',
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
  })
  changeStatus(
    @Param('id', ParseUUIDPipe) id: string, // Assuming Order ID is UUID
    @Body() statusDto: StatusDto, // Validate status from Body
  ) {
    return this.orderServicePort.changeOrderStatus(id, statusDto.status);
  }
}
