import {
  IMiddleware,
  Middleware,
  MidwayWebRouterService,
  RouterInfo,
} from '@midwayjs/core';
import { Context, NextFunction } from '@midwayjs/koa';
import { R } from '../common/base.error.util';
import { Inject } from '@midwayjs/decorator';
import { RedisService } from '@midwayjs/redis';

@Middleware()
export class AuthMiddleware implements IMiddleware<Context, NextFunction> {
  @Inject()
  redisService: RedisService;
  @Inject('notLoginRouters')
  notLoginRouters: RouterInfo[];
  @Inject()
  webRouterService: MidwayWebRouterService;
  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      // 查询当前路由是否在路由表中注册
      const routerInfo = await this.webRouterService.getMatchedRouterInfo(
        ctx.path,
        ctx.method
      );
      if (!routerInfo) {
        await next();
        return;
      }

      // 判断当前路由是否在白名单中
      if (
        this.notLoginRouters.some(
          router =>
            router.requestMethod === routerInfo.requestMethod &&
            router.url === routerInfo.url
        )
      ) {
        await next();
        return;
      }

      const token = ctx.header.authorization?.replace('Bearer ', '');
      if (!token) {
        throw R.unauthorizedError('token 失效，请重新登录');
      }
      const userToken = await this.redisService.get(`token:${token}`);
      if (!userToken) {
        throw R.unauthorizedError('token 失效，请重新登录');
      }

      // 将用户信息挂载到ctx上
      ctx.userInfo = JSON.parse(userToken);
      ctx.token = token;

      return next();
    };
  }

  static getName(): string {
    return 'auth';
  }
}
