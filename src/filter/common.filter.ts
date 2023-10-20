import {Catch} from "@midwayjs/core";
import {MidwayValidationError} from "@midwayjs/validate";
import {Context} from "@midwayjs/koa";
import {CommonError} from "../common/common.error";

@Catch(CommonError)
export class CommonErrorFilter {
  async catch(err: MidwayValidationError, ctx: Context) {
    ctx.status = 400;
    return {
      code: 400,
      message: err.message,
    }
  }
}
