import { Rule, RuleType } from '@midwayjs/validate';
import { ApiProperty } from '@midwayjs/swagger';
import { R } from '../../../common/base.error.util';
import {
  email,
  phone,
  requiredString,
} from '../../../common/common.validate.rules';
import { UserEntity } from '../entity/user';
import { BaseDTO } from '../../../common/base.dto';

export class UserDTO extends BaseDTO<UserEntity> {
  @ApiProperty({ description: '用户名称' })
  @Rule(requiredString.error(R.validateError('用户名称不能为空')))
  userName: string;
  @ApiProperty({ description: '用户昵称' })
  @Rule(requiredString.error(R.validateError('用户昵称不能为空')))
  nickName: string;
  @ApiProperty({ description: '手机号' })
  @Rule(phone.error(R.validateError('手机号格式不正确')))
  mobile: string;
  @ApiProperty({ description: '邮箱' })
  @Rule(email.error(R.validateError('无效的邮箱格式')))
  email: string;
  @ApiProperty({ description: '头像', nullable: true })
  @Rule(RuleType.allow(null))
  avatar?: string;
  @ApiProperty({ description: '性别0:女 1：男', nullable: true })
  @Rule(RuleType.allow(null))
  sex?: number;
}
