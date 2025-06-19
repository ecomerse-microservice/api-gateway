import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  Version,
} from '@nestjs/common';
import { ProductServicePort } from '../../application/ports/product.service.port';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/shared/guards';
import { CreateProductDto, UpdateProductDto } from '../dto';
import { PaginationDto } from 'src/shared/dtos';

/**
 * @class ProductsController
 * @description Exposes REST endpoints for product operations, proxied to the Product MS via NATS.
 */
@ApiTags('products')
@Controller('products') // Base path /api/products
export class ProductsController {
  /**
   * @constructor
   * @param {ProductServicePort} productServicePort - Injected product service port implementation.
   */
  constructor(
    @Inject('ProductServicePort')
    private readonly productServicePort: ProductServicePort,
  ) {}

  /**
   * Handles POST /api/products requests. Requires authentication.
   * @param {CreateProductDto} createProductDto - Data for the new product.
   * @returns {Promise<any>} Response from the product microservice.
   */
  @Post()
  @Version('1')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({
    status: 201,
    description: 'Product created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid product data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or expired token',
  })
  createProduct(@Body() createProductDto: CreateProductDto) {
    // Errors (like RpcException) thrown by the port/adapter will be caught by the global HTTP filter
    return this.productServicePort.createProduct(createProductDto);
  }

  /**
   * Handles GET /api/products requests. Publicly accessible (example).
   * @param {PaginationDto} paginationDto - Query parameters for pagination.
   * @returns {Promise<any>} Paginated list of products from the microservice.
   */
  @Get()
  @Version('1')
  @ApiOperation({ summary: 'Get paginated list of products' })
  @ApiQuery({
    name: 'page',
    description: 'Page number',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Products per page',
    required: false,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'List of products obtained successfully',
  })
  findAllProducts(@Query() paginationDto: PaginationDto) {
    return this.productServicePort.findAllProducts(paginationDto);
  }

  /**
   * Handles GET /api/products/:id requests. Publicly accessible (example).
   * @param {string} id - Product ID from URL parameter.
   * @returns {Promise<any>} The requested product data.
   */
  @Get(':id')
  @Version('1')
  @ApiOperation({ summary: 'Get a product by ID' })
  @ApiParam({
    name: 'id',
    description: 'Product ID (UUID)',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Product obtained successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productServicePort.findOneProduct(id);
  }

  /**
   * Handles PATCH /api/products/:id requests. Requires authentication.
   * @param {string} id - Product ID from URL parameter.
   * @param {UpdateProductDto} updateProductDto - Data for updating the product.
   * @returns {Promise<any>} The updated product data.
   */
  @Patch(':id')
  @Version('1')
  @UseGuards(AuthGuard) // Example: Secure this endpoint
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a product' })
  @ApiParam({
    name: 'id',
    description: 'Product ID (UUID)',
    type: 'string',
  })
  @ApiBody({ type: UpdateProductDto })
  @ApiResponse({
    status: 200,
    description: 'Product updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid product data',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productServicePort.updateProduct(id, updateProductDto);
  }

  /**
   * Handles DELETE /api/products/:id requests. Requires authentication.
   * @param {string} id - Product ID from URL parameter.
   * @returns {Promise<any>} Confirmation response from the microservice.
   */
  @Delete(':id')
  @Version('1')
  @UseGuards(AuthGuard) // Example: Secure this endpoint
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a product (soft-delete)' })
  @ApiParam({
    name: 'id',
    description: 'Product ID (UUID)',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Product deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  @HttpCode(204)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productServicePort.deleteProduct(id);
  }
}
