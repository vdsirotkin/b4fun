import {Context} from "telegraf";

export function isGroup(ctx: Context, next) {
    if (['group', 'supergroup'].includes(ctx.chat.type)) {
        return next()
    } else {
        ctx.reply(ctx.i18n.t('group_only'))
    }
}