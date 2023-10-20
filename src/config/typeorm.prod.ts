import { env } from 'process';

export default {
  typeorm: {
    dataSource: {
      default: {
        type: 'mysql',
        host: env.DB_HOST,
        port: env.DB_PORT || 3306,
        username: env.DB_USERNAME,
        password: env.DB_PASSWORD,
        database: env.DB_DATABASE || 'react-admin',
        synchronize: false, // 自动同步数据库表结构
        logging: false,
        entities: ['**/entity/*{.ts,.js}'],
        // 迁移存在的文件路径
        migrations: ['**/migration/*.ts'],
        cli: {
          migrationsDir: 'migration',
        },
      },
    },
  },
};
