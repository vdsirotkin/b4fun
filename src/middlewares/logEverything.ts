import {Context} from "telegraf";

export function logEverything(ctx: Context, next) {
    console.log(ctx.update)
    return next()
}