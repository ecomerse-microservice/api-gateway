import { Type } from 'class-transformer';
import { IsNumber, IsPositive, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * @class OrderItemDto
 * @description Defines the shape for an item in the create order payload.
 */
export class OrderItemDto {
  /**
   * @property {string} productId - The ID of the product (UUID).
   * @decorator IsString
   * @decorator IsUUID
   */
  @IsString()
  @IsUUID()
  @ApiProperty({
    description: 'ID del producto (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true,
    type: String,
  })
  productId: string;

  /**
   * @property {number} quantity - The quantity of the product.
   * @decorator IsNumber
   * @decorator IsPositive
   * @decorator Type
   */
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  @ApiProperty({
    description: 'Cantidad del producto',
    example: 2,
    required: true,
    minimum: 1,
    type: Number,
  })
  quantity: number;

  // Price is intentionally omitted here in the Gateway DTO as well,
  // matching the original structure. It's determined by the backend.
}
