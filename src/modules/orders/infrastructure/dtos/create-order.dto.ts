import { ArrayMinSize, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { OrderItemDto } from 'src/modules/products/infrastructure/dto/order-item.dto';

/**
 * @class CreateOrderDto
 * @description Defines the shape of data for creating a new order.
 */
export class CreateOrderDto {
  /**
   * @property {OrderItemDto[]} items - Array of items in the order.
   * @decorator IsArray
   * @decorator ArrayMinSize
   * @decorator ValidateNested
   * @decorator Type
   */
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  @ApiProperty({
    description: 'List of products in the order',
    type: [OrderItemDto],
    isArray: true,
    example: [
      { productId: '123e4567-e89b-12d3-a456-426614174000', quantity: 2 },
      { productId: '523e8967-f31b-12d3-a456-426614174088', quantity: 1 },
    ],
    minItems: 1,
  })
  items: OrderItemDto[];
}
