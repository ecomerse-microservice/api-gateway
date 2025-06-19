import { PartialType } from '@nestjs/swagger'; // Use swagger PartialType for proper schema generation
import { CreateProductDto } from './create-product.dto';
import { ApiProperty } from '@nestjs/swagger';

/**
 * @class UpdateProductDto
 * @extends PartialType(CreateProductDto)
 * @description Defines the potential fields for updating a product. All fields are optional.
 */
export class UpdateProductDto extends PartialType(CreateProductDto) {}
