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

- Mysql
  1. docker 安装mysql 镜像并运行
      ```bash
      docker run -p 3306:3306 --name mysql -e MYSQL_ROOT_PASSWORD=123456 -d mysql:5.7
      ```
- TypeORM - typeOrm是node社区最成熟的对象关系映射器（ORM）
  - 安装：`npm i typeorm @midwayjs/orm --save`
    在`src/configuration.ts`中配置
  - 安装mysql驱动：`pnpm i mysql2 --save`
  - 修改`src/config/config.default.ts`中的配置
      ```ts
        @Configuration({
          imports: [
            orm({
              type: 'mysql',
              host: 'localhost',
              port: 3306,
              username: 'root',
              password: '123456',
              database: 'test',
              synchronize: true,
              logging: true,
              entities: ['src/entity/**/*.ts'],
            }),
          ],
        })
      ```
  - Redis
    - 安装同样在docker里安装
       ```bash
       pnpm i @midwayjs/redis@3 --save
      ```
      在`src/configuration.ts`中配置
      ```ts
        @Configuration({
          imports: [
            redis
          ]})
      ```
      在`src/config/config.default.ts`中配置
      ```ts
        config.redis = {
          client: {
            port: 6379, // Redis port
            host: locahost,
            password: '',
            db: 0,
          },
        };```
- swagger-ui 接口文档
- `@midwayjs/validate@3` 参数校验

## 使用的包
+  `nanoid` A tiny, secure, URL-friendly, unique string ID generator for JavaScript.

