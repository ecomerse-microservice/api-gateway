import { IsEnum, IsString } from 'class-validator';
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
 * @class StatusDto
 * @description Defines the expected status field in the request body or params.
 */
export class StatusDto {
  /**
   * @property {OrderStatus} status - The new status.
   * @decorator IsEnum
   */
  @IsEnum(OrderStatusList, {
    message: `Valid status are ${OrderStatusList.join(', ')}`,
  })
  @IsString() // Ensure it's treated as a string
  @ApiProperty({
    description: 'Order status',
    enum: OrderStatusList,
    example: OrderStatus.PAID,
    required: true,
  })
  status: OrderStatus;
}
