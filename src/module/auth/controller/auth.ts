import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Provide,
} from '@midwayjs/decorator';
import { CaptchaService } from '@midwayjs/captcha';
import { AuthService } from '../service/auth';
import { CaptchaDTO, LoginDTO } from '../dto/login';
import { R } from '../../../common/base.error.util';
import { ApiResponse } from '@midwayjs/swagger';
import * as NodeRSA from 'node-rsa';
import { RedisService } from '@midwayjs/redis';
import { RefreshTokenDTO } from '../dto/refresh.token';
import { NotLogin } from '../../../decorator/not.login';
@Provide()
@Controller('/auth', { tagName: '登录' })
export class AuthController {
  @Inject()
  AuthService: AuthService;
  @Inject()
  captchaService: CaptchaService;
  @Inject()
  redisService: RedisService;

  @Post('/login', { description: '登录', summary: '登录' })
  @NotLogin()
  async login(@Body() loginDTO: LoginDTO) {
    const { captchaId, captchaCode } = loginDTO;
    // 验证码验证
    const result = await this.captchaService.check(captchaId, captchaCode);
    if (!result) {
      throw R.error('验证码错误');
    }

    return await this.AuthService.login(loginDTO);
  }

  @Get('/captcha', { description: '获取验证码', summary: '获取验证码' })
  @ApiResponse({ type: CaptchaDTO })
  @NotLogin()
  async getImageCaptcha(): Promise<CaptchaDTO> {
    const { id, imageBase64 } = await this.captchaService.image({
      width: 100,
      height: 40,
    });

    return {
      id,
      imageBase64,
    };
  }

  @Get('/publicKey')
  @ApiResponse({ type: String })
  @NotLogin()
  async getPublicKey() {
    //   生成公钥
    const nodeRSA = new NodeRSA({ b: 512 });
    const publicKey = nodeRSA.exportKey('public');
    //   私钥存入redis
    const privateKey = nodeRSA.exportKey('private');
    this.redisService.set(`publicKey:${publicKey}`, privateKey);
    return publicKey;
  }

  @Post('/refreshToken', { summary: '刷新token' })
  @NotLogin()
  async refreshToken(@Body() refreshTokenDTO: RefreshTokenDTO) {
    return await this.AuthService.refreshToken(refreshTokenDTO);
  }

  @Get('/logout', { summary: '退出登录' })
  @ApiResponse({ type: String })
  async logout() {
    return await this.AuthService.logout();
  }
}
