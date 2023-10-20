import { BaseEntity } from './base.entity';
import { Inject } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { FindOptionsWhere, Repository } from 'typeorm';

export abstract class BaseService<T extends BaseEntity> {
  @Inject()
  ctx: Context;

  abstract getModel(): Repository<T>;

  async create(entity: T) {
    return await this.getModel().save(entity);
  }

  async edit(entity: T) {
    return await this.getModel().save(entity);
  }

  async remove(entity: T) {
    return await this.getModel().remove(entity);
  }

  async getById(id: number): Promise<T> {
    return await this.getModel()
      .createQueryBuilder('model')
      .where('model.id = :id', { id })
      .getOne();
  }

  async page(page: number, size: number, where?: FindOptionsWhere<T>) {
    const order: any = { create_time: 'desc' };
    const [data, total] = await this.getModel().findAndCount({
      order,
      skip: (page - 1) * size,
      take: size,
      where,
    });
    return { data, total };
  }

  async list(where?: FindOptionsWhere<T>) {
    const order: any = { create_time: 'desc' };
    return await this.getModel().find({ where, order });
  }
}
