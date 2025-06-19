import { Injectable, Inject, Logger } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError, firstValueFrom, throwError } from 'rxjs';
import { OrderServicePort } from '../../application/ports/order.service.port';
import { PaginationDto } from 'src/shared/dtos';
import { NATS_SERVICE } from 'src/config';

// Re-declare minimal DTO interfaces or import from a shared location if possible
interface CreateOrderDto {
  items: { productId: string; quantity: number }[];
}
interface OrderPaginationDto extends PaginationDto {
  status?: string;
}

@Injectable()
export class NatsOrderAdapter implements OrderServicePort {
  private readonly logger = new Logger(NatsOrderAdapter.name);

  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {}

  async createOrder(createOrderDto: CreateOrderDto): Promise<any> {
    this.logger.log('Sending "createOrder" request via NATS');
    return firstValueFrom(
      this.client
        .send('createOrder', createOrderDto)
        .pipe(catchError((err) => throwError(() => new RpcException(err)))),
    );
  }

  async findAllOrders(paginationDto: OrderPaginationDto): Promise<any> {
    this.logger.log('Sending "findAllOrders" request via NATS');
    return firstValueFrom(
      this.client
        .send('findAllOrders', paginationDto)
        .pipe(catchError((err) => throwError(() => new RpcException(err)))),
    );
  }

  async findOneOrder(id: string): Promise<any> {
    this.logger.log(`Sending "findOneOrder" request for ID ${id} via NATS`);
    return firstValueFrom(
      this.client
        .send('findOneOrder', { id })
        .pipe(catchError((err) => throwError(() => new RpcException(err)))),
    );
  }

  async changeOrderStatus(id: string, status: string): Promise<any> {
    this.logger.log(
      `Sending "changeOrderStatus" request for ID ${id} to status ${status} via NATS`,
    );
    return firstValueFrom(
      this.client
        .send('changeOrderStatus', { id, status })
        .pipe(catchError((err) => throwError(() => new RpcException(err)))),
    );
  }
}
