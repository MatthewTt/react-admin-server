import { ApiProperty } from '@midwayjs/swagger';
import { Rule, RuleType } from '@midwayjs/validate';
import { requiredString } from '../../../common/common.validate.rules';
import { R } from '../../../common/base.error.util';

export class LoginDTO {
  @ApiProperty({ description: '登录账号' })
  @Rule(requiredString.error(R.validateError('登录账号不能为空')))
  accountNumber: string;
  @ApiProperty({ description: '登录密码' })
  @Rule(requiredString.error(R.validateError('登录密码不能为空')))
  password: string;
  @ApiProperty({ description: '验证码id' })
  @Rule(RuleType.string())
  captchaId: string;
  @ApiProperty({ description: '验证码' })
  @Rule(requiredString.error(R.validateError('验证码不能为空')))
  captchaCode: string; // 验证码
  @ApiProperty({ description: '公钥' })
  @Rule(RuleType.string())
  publicKey: string;
}

export class CaptchaDTO {
  @ApiProperty({ description: '验证码id', example: '12313' })
  @Rule(RuleType.string())
  id: string;
  @ApiProperty({ description: '图片url' })
  imageBase64: string;
}
