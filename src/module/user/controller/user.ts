import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Provide,
  Query,
  Put,
  Param,
  Del,
} from '@midwayjs/decorator';
import { UserDTO } from '../dto/user';
import { UserService } from '../service/user';
import { Validate } from '@midwayjs/validate';
import { FindOptionsWhere } from 'typeorm';
import { UserEntity } from '../entity/user';
import { Context } from '@midwayjs/koa';
import { ApiResponse } from '@midwayjs/swagger';

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

  @Put('/', { description: '编辑' })
  @Validate()
  async edit(@Body() data: UserDTO) {
    // update
    return await this.userService.editUser(data);
  }

  @Del('/:id', { description: '删除' })
  async remove(@Param('id') id: number) {
    const user = await this.userService.getById(id);
    return await this.userService.remove(user);
  }

  @Get('/:id', { description: '根据id查询' })
  async getById(@Param('id') id: number) {
    return await this.userService.getById(id);
  }

  @Get('/page', { description: '分页查询' })
  async page(
    @Query('page') page: number,
    @Query('size') size: number,
    @Query('nickName') nickName: string,
    @Query('mobile') mobile: string
  ) {
    const query: FindOptionsWhere<UserEntity> = {};
    if (nickName) {
      query.nickName = nickName;
    }

    if (mobile) {
      query.mobile = mobile;
    }
    return await this.userService.page(page, size, query);
  }

  @Get('/list', { description: '查询全部' })
  async list() {
    return await this.userService.list();
  }

  @Get('/current/uesr', { summary: '获取当前用户信息' })
  @ApiResponse({ type: UserDTO })
  async getCurrentUser() {
    const user = await this.userService.getById(this.ctx.userInfo.userId);
    return user.toVO();
  }
}
