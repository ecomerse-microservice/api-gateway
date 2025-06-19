import { Type } from 'class-transformer';
import { IsNumber, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * @class CreateProductDto
 * @description Defines the shape of data for creating a new product.
 */
export class CreateProductDto {
  /**
   * @property {string} name - Product name.
   * @decorator IsString
   */
  @IsString()
  @ApiProperty({
    description: 'Nombre del producto',
    example: 'Laptop HP Pavilion',
    required: true,
  })
  public name: string;

  /**
   * @property {number} price - Product price. Must be a non-negative number.
   * @decorator IsNumber
   * @decorator Min
   * @decorator Type
   */
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  @Type(() => Number)
  @ApiProperty({
    description: 'Precio del producto (debe ser mayor o igual a 0)',
    example: 899.99,
    required: true,
    minimum: 0,
  })
  public price: number;
}
