import { ApiProperty } from '@midwayjs/swagger';
import { BaseEntity } from './base.entity';
import { Rule, RuleType } from '@midwayjs/validate';
import { omit } from 'lodash';

export class BaseDTO<T extends BaseEntity> {
  @ApiProperty({ description: 'id' })
  @Rule(RuleType.allow(null))
  id?: number;
  @ApiProperty({ description: '创建时间' })
  @Rule(RuleType.allow(null))
  create_time?: Date;
  @ApiProperty({ description: '更新时间' })
  @Rule(RuleType.allow(null))
  update_time?: Date;

  /**
   * 转换为实体
   */
  toEntity(): T {
    return omit(this, ['createDate', 'updateDate']) as unknown as T;
  }
}
