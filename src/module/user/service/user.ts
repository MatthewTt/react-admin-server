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
