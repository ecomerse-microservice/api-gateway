import { PaginationDto } from 'src/shared/dtos';

/**
 * @interface ProductServicePort
 * @description Contract for communicating with the product service.
 */
export interface ProductServicePort {
  /**
   * Sends a request to create a product.
   * @param {any} createProductDto - Data for the new product.
   * @returns {Promise<any>} The created product data.
   */
  createProduct(createProductDto: any): Promise<any>;

  /**
   * Sends a request to find all products with pagination.
   * @param {PaginationDto} paginationDto - Pagination parameters.
   * @returns {Promise<any>} Paginated product data.
   */
  findAllProducts(paginationDto: PaginationDto): Promise<any>;

  /**
   * Sends a request to find one product by ID.
   * @param {string} id - The product ID (UUID).
   * @returns {Promise<any>} The found product data.
   */
  findOneProduct(id: string): Promise<any>;

  /**
   * Sends a request to update a product.
   * @param {string} id - The product ID (UUID).
   * @param {any} updateProductDto - Data for updating the product.
   * @returns {Promise<any>} The updated product data.
   */
  updateProduct(id: string, updateProductDto: any): Promise<any>;

  /**
   * Sends a request to delete a product.
   * @param {string} id - The product ID (UUID).
   * @returns {Promise<any>} Confirmation or deleted product data.
   */
  deleteProduct(id: string): Promise<any>;
}
