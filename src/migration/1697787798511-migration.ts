import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1697787798511 implements MigrationInterface {
  name = 'Migration1697787798511';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "CREATE TABLE `sys_user` (`id` int NOT NULL AUTO_INCREMENT, `create_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `update_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `userName` varchar(255) NOT NULL COMMENT '用户名称', `nickName` varchar(255) NOT NULL COMMENT '用户昵称', `mobile` varchar(255) NOT NULL COMMENT '手机号', `email` varchar(255) NOT NULL COMMENT '邮箱', `avatar` varchar(255) NULL COMMENT '头像', `sex` int NULL COMMENT '性别0:女 1：男', `password` varchar(255) NOT NULL COMMENT '密码', PRIMARY KEY (`id`)) ENGINE=InnoDB"
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `sys_user`');
  }
}
