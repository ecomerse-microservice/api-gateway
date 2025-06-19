import { Type } from 'class-transformer';
import { IsOptional, IsPositive, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * @class PaginationDto
 * @description Defines standard pagination query parameters.
 */
export class PaginationDto {
  /**
   * @property {number} page - The page number to retrieve (defaults to 1).
   * @decorator IsOptional
   * @decorator IsPositive
   * @decorator Type
   * @decorator Min
   */
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  @Min(1)
  @ApiProperty({
    description: 'Page number to be retrieved',
    default: 1,
    minimum: 1,
    required: false,
    type: Number,
  })
  page?: number = 1;

  /**
   * @property {number} limit - The number of items per page (defaults to 10).
   * @decorator IsOptional
   * @decorator IsPositive
   * @decorator Type
   */
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  @ApiProperty({
    description: 'Number of items per page',
    default: 10,
    minimum: 1,
    required: false,
    type: Number,
  })
  limit?: number = 10;
}
