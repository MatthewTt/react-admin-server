import { MidwayConfig } from '@midwayjs/core';
import { TokenConfig } from '../module/auth/service/token.config';
import { env } from 'process';

export default {
  // use for cookie sign key, should change to your own and keep security
  keys: '1695553370404_9903',
  koa: {
    port: 7001,
  },
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
  redis: {
    client: {
      port: 6379, // Redis port
      host: env.REDIS_HOST || 'localhost', // Redis host
      password: env.REDIS_PASSWORD || '',
      db: 0,
    },
  },

  token: {
    expire: 60 * 60 * 2,
    refreshExpire: 60 * 60 * 24 * 7,
  } as TokenConfig,
} as MidwayConfig;
