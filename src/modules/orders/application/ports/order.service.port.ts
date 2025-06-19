import { PaginationDto } from 'src/shared/dtos';

// Define DTOs mirrored from Order MS or use shared DTOs if applicable
interface CreateOrderDto {
  items: { productId: string; quantity: number }[];
} // Actualizado a string
interface OrderPaginationDto extends PaginationDto {
  status?: string;
}
interface StatusDto {
  status: string;
}

/**
 * @interface OrderServicePort
 * @description Contract for communicating with the order service.
 */
export interface OrderServicePort {
  /**
   * Sends a request to create an order.
   * @param {CreateOrderDto} createOrderDto - Data for the new order.
   * @returns {Promise<any>} The created order and payment session data.
   */
  createOrder(createOrderDto: CreateOrderDto): Promise<any>;

  /**
   * Sends a request to find all orders.
   * @param {OrderPaginationDto} paginationDto - Pagination and status filter.
   * @returns {Promise<any>} Paginated order data.
   */
  findAllOrders(paginationDto: OrderPaginationDto): Promise<any>;

  /**
   * Sends a request to find one order by ID.
   * @param {string} id - The order ID (UUID/CUID).
   * @returns {Promise<any>} The found order data.
   */
  findOneOrder(id: string): Promise<any>;

  /**
   * Sends a request to change an order's status.
   * @param {string} id - The order ID.
   * @param {string} status - The new status.
   * @returns {Promise<any>} The updated order data.
   */
  changeOrderStatus(id: string, status: string): Promise<any>;
}
