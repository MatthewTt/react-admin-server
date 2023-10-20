import {Catch} from "@midwayjs/core";
import {MidwayValidationError} from "@midwayjs/validate";
import {Context} from "@midwayjs/koa";

@Catch(MidwayValidationError)
export class ValidateErrorFilter {
  async catch(err: MidwayValidationError, ctx: Context) {
    console.log(err)
    ctx.status = 422;
    return {
      code: 422,
      message: err.message,
    }
  }
}
