import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../../../shared/dtos/pagination.dto'; // Use shared DTO
import { ApiProperty } from '@nestjs/swagger';

// Define the enum locally or import from a shared place if possible
enum OrderStatus {
  PENDING = 'PENDING',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  PAID = 'PAID',
}
const OrderStatusList = [
  OrderStatus.PENDING,
  OrderStatus.PAID,
  OrderStatus.DELIVERED,
  OrderStatus.CANCELLED,
];

/**
 * @class OrderPaginationDto
 * @extends PaginationDto
 * @description Extends common pagination with optional order status filtering.
 */
export class OrderPaginationDto extends PaginationDto {
  /**
   * @property {OrderStatus} [status] - Optional status to filter orders by.
   * @decorator IsOptional
   * @decorator IsEnum
   */
  @IsOptional()
  @IsEnum(OrderStatusList, {
    message: `Valid status are ${OrderStatusList.join(', ')}`,
  })
  @IsString() // Ensure it's treated as a string from query param
  @ApiProperty({
    description: 'Filter orders by status',
    enum: OrderStatusList,
    example: OrderStatus.PENDING,
    required: false,
  })
  status?: OrderStatus;
}
