import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { omit } from 'lodash';

@Entity('sys_user')
export class UserEntity extends BaseEntity {
  @Column({ comment: '用户名称' })
  userName: string;
  @Column({ comment: '用户昵称' })
  nickName: string;
  @Column({ comment: '手机号' })
  mobile: string;
  @Column({ comment: '邮箱' })
  email: string;
  @Column({ comment: '头像', nullable: true })
  avatar?: string;
  @Column({ comment: '性别0:女 1：男', nullable: true })
  sex?: number;
  @Column({ comment: '密码', select: false })
  password: string;

  toVO() {
    return omit(this, ['password']);
  }
}
