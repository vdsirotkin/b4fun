import { Telegraf, Context } from 'telegraf'

export function setupHelp(bot: Telegraf<Context>) {
  bot.command(['help', 'start'], (ctx) => {
    console.log("received help message")
    ctx.replyWithHTML(ctx.i18n.t('help'))
  })
}
