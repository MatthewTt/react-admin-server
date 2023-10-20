import { Config, Inject, Provide } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { LoginDTO } from '../dto/login';
import { UserEntity } from '../../user/entity/user';
import { R } from '../../../common/base.error.util';
import { compareSync } from 'bcryptjs';
import { TokenConfig } from './token.config';
import { uuid } from '../../../utils/uuid';
import { RedisService } from '@midwayjs/redis';
import * as NodeRSA from 'node-rsa';
import { RefreshTokenDTO } from '../dto/refresh.token';
import { Context } from '@midwayjs/koa';

@Provide()
export class AuthService {
  @InjectEntityModel(UserEntity)
  userModel: Repository<UserEntity>;
  @Config('token')
  tokenConfig: TokenConfig;
  @Inject()
  redisService: RedisService;
  @Inject()
  ctx: Context;

  async login(loginDto: LoginDTO) {
    const { accountNumber, publicKey } = loginDto;

    // 从请求中获取公钥，根据公钥获取私钥
    const privateKey = await this.redisService.get(`publicKey:${publicKey}`);
    if (!privateKey) {
      throw R.error('系统错误');
    }
    // 删除私钥
    await this.redisService.del(`publicKey:${publicKey}`);

    // 解密密码
    const nodeRSA = new NodeRSA(privateKey);
    nodeRSA.setOptions({ encryptionScheme: 'pkcs1' });
    const password = nodeRSA.decrypt(loginDto.password, 'utf8');

    if (!password) {
      throw R.error('系统错误');
    }

    loginDto.password = password;
    const user = await this.userModel
      .createQueryBuilder('user')
      .where('user.mobile = :accountNumber', { accountNumber })
      .orWhere('user.email = :accountNumber', { accountNumber })
      .orWhere('user.userName = :accountNumber', { accountNumber })
      .select(['user.password', 'user.id', 'user.userName'])
      .getOne();

    if (!user) {
      throw R.error('账号或密码错误！');
    }

    //    判断密码是否正确
    if (!compareSync(loginDto.password, user.password)) {
      throw R.error('账号或密码错误！');
    }
    const { expire, refreshExpire } = this.tokenConfig;

    const token = uuid();
    const refreshToken = uuid();

    await this.redisService
      .multi()
      .set(`token:${token}`, JSON.stringify({ userId: user.id, refreshToken }))
      .expire(`token:${token}`, expire)
      .set(`refreshToken:${refreshToken}`, user.id)
      .expire(`refreshToken:${refreshToken}`, refreshExpire)
      .exec();

    return {
      token,
      expire,
      refreshToken,
      refreshExpire,
    };
  }

  async refreshToken({ refreshToken }: RefreshTokenDTO) {
    const userId = await this.redisService.get(`refreshToken:${refreshToken}`);
    if (!userId) {
      throw R.error('refreshToken错误');
    }

    // 如果refresh没失效， 重新生成token
    const { expire } = this.tokenConfig;
    const token = uuid();

    await this.redisService
      .multi()
      .set(`token:${token}`, JSON.stringify({ userId, refreshToken }))
      .expire(`token:${token}`, expire)
      .exec();

    const refreshExpire = await this.redisService.ttl(
      `refreshToken:${refreshToken}`
    );

    return {
      expire,
      token,
      refreshToken,
      refreshExpire,
    };
  }

  async logout() {
    // 清除token 和 refreshToken
    const res = await this.redisService
      .multi()
      .del(`token:${this.ctx.token}`)
      .del(`refreshToken:${this.ctx.userInfo.refreshToken}`)
      .exec();
    if (res.some(item => item[0])) {
      throw R.error('退出登录失败');
    }
    return true;
  }
}
