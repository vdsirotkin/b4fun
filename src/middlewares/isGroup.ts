import {Context} from "telegraf";
import {MyContext} from "../types/telegraf";

export function isGroup(ctx: MyContext, next) {
    if (['group', 'supergroup'].includes(ctx.chat.type)) {
        return next()
    } else {
        ctx.reply(ctx.i18n.t('group_only'))
    }
}