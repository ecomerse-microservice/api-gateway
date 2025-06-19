import { Injectable, Inject, Logger } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError, firstValueFrom, throwError } from 'rxjs';
import { NATS_SERVICE } from '../../../../config';
import { ProductServicePort } from '../../application/ports';
import { PaginationDto } from 'src/shared/dtos';

@Injectable()
export class NatsProductAdapter implements ProductServicePort {
  private readonly logger = new Logger(NatsProductAdapter.name);

  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {}

  async createProduct(createProductDto: any): Promise<any> {
    this.logger.log('Sending "create_product" request via NATS');
    return firstValueFrom(
      this.client
        .send({ cmd: 'create_product' }, createProductDto)
        .pipe(catchError((err) => throwError(() => new RpcException(err)))),
    );
  }

  async findAllProducts(paginationDto: PaginationDto): Promise<any> {
    this.logger.log('Sending "find_all_products" request via NATS');
    return firstValueFrom(
      this.client
        .send({ cmd: 'find_all_products' }, paginationDto)
        .pipe(catchError((err) => throwError(() => new RpcException(err)))),
    );
  }

  async findOneProduct(id: string): Promise<any> {
    this.logger.log(`Sending "find_one_product" request for ID ${id} via NATS`);
    return firstValueFrom(
      this.client
        .send({ cmd: 'find_one_product' }, { id })
        .pipe(catchError((err) => throwError(() => new RpcException(err)))),
    );
  }

  async updateProduct(id: string, updateProductDto: any): Promise<any> {
    this.logger.log(`Sending "update_product" request for ID ${id} via NATS`);
    return firstValueFrom(
      this.client
        .send({ cmd: 'update_product' }, { id, ...updateProductDto })
        .pipe(catchError((err) => throwError(() => new RpcException(err)))),
    );
  }

  async deleteProduct(id: string): Promise<any> {
    this.logger.log(`Sending "delete_product" request for ID ${id} via NATS`);
    return firstValueFrom(
      this.client
        .send({ cmd: 'delete_product' }, { id })
        .pipe(catchError((err) => throwError(() => new RpcException(err)))),
    );
  }
}
