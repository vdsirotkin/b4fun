import { Telegraf, Context } from 'telegraf'
import {MyContext} from "../types/telegraf";

export function setupHelp(bot: Telegraf<MyContext>) {
  bot.command(['help', 'start'], (ctx) => {
    console.log("received help message")
    ctx.replyWithHTML(ctx.i18n.t('help'))
  })
}
