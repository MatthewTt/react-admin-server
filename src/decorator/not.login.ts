import {
  ApplicationContext,
  attachClassMetadata,
  Autoload,
  CONTROLLER_KEY,
  getClassMetadata,
  IMidwayContainer,
  Init,
  listModule,
  MidwayWebRouterService,
  Singleton,
} from '@midwayjs/core';
import { Inject } from '@midwayjs/decorator';

export const NOT_LOGIN_KEY = 'decorator:not.login';

export function NotLogin() {
  return (target, key, descriptor: PropertyDescriptor) => {
    attachClassMetadata(NOT_LOGIN_KEY, { methodName: key }, target);
    return descriptor;
  };
}

@Autoload()
@Singleton()
export class NotLoginDecorator {
  @Inject()
  webRouterService: MidwayWebRouterService;

  @ApplicationContext()
  applicationContext: IMidwayContainer;
  @Init()
  async init() {
    // 获取controller
    const controllerModules = listModule(CONTROLLER_KEY);
    // whitelist
    const whitelist = [];
    for (const module of controllerModules) {
      const methodNames = getClassMetadata(NOT_LOGIN_KEY, module) || [];
      const className = module.name[0].toLowerCase() + module.name.slice(1);
      // console.log(methodNames, className, module.name);
      whitelist.push(
        ...methodNames.map(method => `${className}.${method.methodName}`)
      );
    }

    const routerInfos = await this.webRouterService.getFlattenRouterTable();
    const whiteRouters = routerInfos.filter(router =>
      whitelist.includes(router.handlerName)
    );
    this.applicationContext.registerObject('notLoginRouters', whiteRouters);
  }
}
