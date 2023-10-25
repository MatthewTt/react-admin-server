# my_midway_project

## QuickStart

<!-- add docs here for user -->

see [midway docs][midway] for more detail.

### Development

```bash
$ npm i
$ npm run dev
$ open http://localhost:7001/
```

### Deploy

```bash
$ npm start
```

### npm scripts

- Use `npm run lint` to check code style.
- Use `npm test` to run unit test.

[midway]: https://midwayjs.org

## dependencies
### Mysql
```shell
docker run -p 3306:3306 --name mysql -e MYSQL_ROOT_PASSWORD=123456 -d mysql:5.7
```


### TypeORM
> TypeORM是node.js现有社区最成熟的对象关系映射器（ORM ）。

安装：`npm i typeorm @midwayjs/orm --save`

```ts
import * as orm from '@midwayjs/typeorm';
import { Configuration } from "@midwayjs/core";

// /src/configuration.ts
@Configuration({
  imports: [
    // ... 其他省略
    orm
  ]
})
```
```ts

// /src/config/config.default.ts
export default {
  typeorm: {
    dataSource: {
      default: {
        type: 'mysql',
        host: 'localhost',
        port: 3306,
        username: 'root',
        password: '123456',
        database: 'test',
        synchronize: true, // 自动同步数据库表结构
        logging: false,
        entities: ['**/entity/*{.ts,.js}'],
        migrations: ['**/migration/*.ts'],
        cli: {
          migrationsDir: 'migration',
        },
      },
    },
  },
}
```
### Redis
> Redis 是一个开源的内存数据结构存储系统，也是一种 NoSQL 数据库。它支持多种数据结构，包括字符串、哈希表、列表、集合和有序集合，并提供了丰富的操作接口。
Redis 主要用于以下几个方面：

> 缓存：Redis 可以将热点数据存储在内存中，加速读写访问速度。对于需要频繁读取的数据，将其缓存到 Redis 中可以大大降低数据库的访问负载，提高性能。
分布式锁：Redis 的原子性操作保证了分布式锁的实现，在分布式环境下确保资源的互斥访问，防止因并发访问而导致的数据错乱或冲突。
消息队列：Redis 提供了 List 和 Pub/Sub 两种模式，可以实现简单的消息队列与发布订阅功能。
计数器：使用 Redis 的自增或者自减操作可以实现计数器的功能。在高并发场景下，使用 Redis 实现计数器可以避免线程安全问题。
搜索引擎：Redis 的 Sorted Set 可以很好地支持搜索引擎的实现。例如，可以将文章的关键词作为 Score 存储到 Sorted Set 中，然后根据用户的搜索关键字来查询相关文章。
游戏服务器：Redis 可以存储游戏中的数据、状态等信息，并提供快速的读写访问能力，支持高并发的游戏服务器。
总之，Redis 作为一种高性能的内存数据库，可以用于多种场景下的数据存储和处理。它具有高效、可扩展、易用等特点，在互联网领域得到广泛应用。

安装：
```shell
docker run -p 6379:6379 --name redis -d redis
# 项目安装
pnpm i @midwayjs/redis@3 --save
```
```ts
import { Configuration } from '@midwayjs/core';
import * as redis from '@midwayjs/redis';
import { join } from 'path';

@Configuration({
  imports: [
    // ...
    redis       // 导入 redis 组件
  ],
  importConfigs: [
    join(__dirname, 'config')
  ],
})
export class MainConfiguration {
}
```
配置redis
```ts
// config/config.default.ts
export default {
  redis: {
    client: {
        port: 6379,          // Redis port
        host: 'localhost',
        password: '123456',
        db: 0,
    }
  }
}
```
使用案例
```ts
import { Controller, Get, Inject } from '@midwayjs/core';
import { RedisService } from '@midwayjs/redis';

@Controller('/')
export class HomeController {
  // 自动注入redis服务
  @Inject()
  redisService: RedisService;

  @Get('/')
  async home(): Promise<string> {
    // 设置值
    await this.redisService.set('foo', 'bar');
    // 获取值
    return await this.redisService.get('foo');
  }
}
```
### swagger-ui
安装:
```shell
pnpm install @midwayjs/swagger@3 --save
pnpm install swagger-ui-dist --save-dev
```
配置：
```ts
// src/configuration.ts
import { Configuration } from '@midwayjs/core';
import * as swagger from '@midwayjs/swagger';

@Configuration({
  imports: [
    // ...
    {
      component: swagger,
      enabledEnvironment: ['local']
    }
  ]
})
```
swagger地址： http://127.0.0.1:7001/swagger-ui/index.html

## 项目目录
- controller 控制器
- entity 数据库实体 （建表）
- service 服务层
- dto 数据传输对象 前端向后端传输数据模型
- config 配置文件
### 案例
#### 创建实体 entity
```ts
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
```
#### 创建controller
```ts
@Provide()
@Controller('/user')
export class UserController {
  @Inject()
  userService: UserService;
  @Inject()
  ctx: Context;

  @Post('/', { description: '新建' })
  async create(@Body() data: UserDTO) {
    return await this.userService.createUser(data);
  }
}
```
#### 创建service
```ts
import { Provide } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '../../../common/base.service';
import { UserEntity } from '../entity/user';
import { UserVO } from '../vo/user';
import { R } from '../../../common/base.error.util';
import { hashSync } from 'bcryptjs';
import { omit } from 'lodash';
import { UserDTO } from '../dto/user';

@Provide()
export class UserService extends BaseService<UserEntity> {
  @InjectEntityModel(UserEntity)
  userModel: Repository<UserEntity>;

  getModel(): Repository<UserEntity> {
    return this.userModel;
  }

  async createUser(userDTO: UserDTO): Promise<UserVO> {
    const entity = userDTO.toEntity();
    const { userName, mobile, email } = userDTO;
    let isExist = (await this.userModel.countBy({ userName })) > 0;
    if (isExist) {
      throw R.error('当前用户已存在');
    }
    isExist = (await this.userModel.countBy({ mobile })) > 0;
    if (isExist) {
      throw R.error('当前手机号已存在');
    }

    isExist = (await this.userModel.countBy({ email })) > 0;
    if (isExist) {
      throw R.error('当前邮箱已存在');
    }

    entity.password = hashSync('123456', 10);
    await this.userModel.save(entity);

    return omit(entity, ['password']);
  }

  async editUser(userDTO: UserDTO): Promise<void | UserVO> {
    const { userName, mobile, email, id } = userDTO;
    let user = await this.userModel.findOneBy({ userName });
    if (user && user.id !== id) {
      throw R.error('当前用户已存在');
    }
    user = await this.userModel.findOneBy({ mobile });

    if (user && user.id !== id) {
      throw R.error('当前手机号已存在');
    }

    user = await this.userModel.findOneBy({ email });

    if (user && user.id !== id) {
      throw R.error('当前邮箱已存在');
    }
    await this.userModel.save(userDTO);

    return omit(userDTO, ['password']);
  }
}

```
#### 创建dto
```ts
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
```
## 问题
### `init-databae` 未执行完发现数据库被关闭
将原来回调的方式改为同步的方式，引入 `mysql2/promise`
```ts
async function connect() {
  const host = process.env.DB_HOST;
  const user = process.env.DB_USERNAME;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_DATABASE || 'react-admin';

  const connection = await mysql.createConnection({
    host,
    user,
    password,
  });

  await connection.connect().catch(err => {
    console.log(`host: ${host}`);
    console.log(`user: ${user}`);
    console.log(`password: ${password}`);
    console.log('数据库链接失败，正在重试...');
    console.log(err);
    setTimeout(() => {
      if (count >= 60) {
        console.log('数据库链接失败，重试超过60次，退出程序');
        return;
      }

      connect();
      count++;
    }, 1000);
  });

  console.log('数据库链接成功');
  const [rows] = await connection.query(
    `SELECT * FROM information_schema.SCHEMATA where SCHEMA_NAME = '${database}'`
  );

  if (rows.length === 0) {
    console.log(`数据库${database}不存在，正在创建...`);
    await connection.query(`CREATE DATABASE \`${database}\``);
    console.log(`数据库${database}创建成功`);
  } else {
    console.log(`数据库${database}已存在`);
    process.exit();
  }

  await connection.end();
}

```
### 多容器网络通信问题
新建一个网络
```shell
docker network create --subnet=172.0.5.0/24 my-network
# subnet=[广播地址]/[子网掩码位数]
```
把 `Mysql` 和 `redis` 放到同一个网络中(`--network my-network`)
```shell
docker run -p 3306:3306 --name mysql --network my-network -e MYSQL_ROOT_PASSWORD=123456 -d mysql:5.7
docker run -p 6379:6379 --name redis --network my-network -d redis
```
把启动的前端和后端容器也链接到同一个网络中即可

固定IP方式
```shell
docker run -p 3306:3306 --name mysql --network my-network --ip 172.28.0.4 ...
```
docker-compose 方式

```yaml
version: '3'
services:
  mysql:
    image: mysql:5.7
    container_name: mysql
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: 123456
    ports:
      - "3306:3306"
    networks:
      my-network:
        ipv4_address: 172.28.0.4
  redis:
    image: redis
    container_name: redis
    restart: always
    ports:
      - "6379:6379"
    networks:
      my-network:
        ipv4_address: 172.28.0.5
networks:
  my-network:
    # name: my-network
    external: true
```
### 数据迁移部分，遇见 `Cannot use import statement outside a module`
https://stackoverflow.com/questions/59435293/typeorm-entity-in-nestjs-cannot-use-import-statement-outside-a-module

目前解决方案是把 `tsconfig.ts` 的 `module` 改为 `commonjs`
```json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "target": "es2017",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "paths": {
      "*": ["node_modules/*", "src/types/*"]
    },
    "lib": ["es2017", "dom"],
    "typeRoots": ["node_modules/@types"],
    "esModuleInterop": true
  },
  "exclude": ["node_modules", "dist"]
}
```

### 前端接口访问不通 `/api`
修改nginx配置，增加一个 `rewrite` 规则
```conf
server {
  listen 80;
  server_name localhost;

  location /api {
    将/api删除
    rewrite ^/api/(.*)$ /$1 break;
  }
}
```
