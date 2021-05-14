import {Context, Telegraf, Telegram} from "telegraf";
import {ChatInfo, findActiveChats, StatInfo} from "@/models/ChatInfo";
import {isGroup} from "@/middlewares/isGroup";
import {getUserLink} from "@/helpers/user";
import moment = require("moment");
import { scheduleJob } from "node-schedule";
import {DocumentType} from "@typegoose/typegoose";
import {MyContext} from "../types/telegraf";

const randomInteger = require('random-int')

function registerChatMemberListener(bot: Telegraf<MyContext>) {
    bot.on('message', isGroup, async (ctx, next) => {
        const userId = ctx.from.id;
        const chatInfo = ctx.chatInfo;
        if (!chatInfo.stats.map(value => value.userId).includes(userId)) {
            const info = new StatInfo();
            info.userId = userId
            chatInfo.stats.push(info)
            await chatInfo.save()
        }
        return next()
    })
}

function findPidor(bot: Telegraf<MyContext>) {
    bot.command(['pidor'], isGroup, async (ctx) => {
        const chatInfo = ctx.chatInfo;
        if (chatInfo.stats.length <= 1) {
            return ctx.reply(ctx.i18n.t('not_enough_users'))
        }
        if (moment(chatInfo.lastChooseDate).isBefore(moment().startOf('days'))) {
            await electNewPidor(bot.telegram, chatInfo);
        } else {
            const lastPidorOfTheDay = ctx.chatInfo.lastPidorOfTheDay;
            const member = await ctx.getChatMember(lastPidorOfTheDay);
            await ctx.replyWithHTML('Сегодня пидор дня - ' + getUserLink(member.user))
        }
    })
}

async function electNewPidor(tlgrm: Telegram, chatInfo: DocumentType<ChatInfo>) {
    tlgrm.sendMessage(chatInfo.id, 'Выбираем нового пидора...')
    const randomUserIndex = randomInteger(0, chatInfo.stats.length - 1);
    const randomUser = chatInfo.stats[randomUserIndex];
    randomUser.pidorCount++
    chatInfo.lastPidorOfTheDay = randomUser.userId
    chatInfo.lastChooseDate = moment().startOf('days').toDate()
    await chatInfo.save()
    const member = await tlgrm.getChatMember(chatInfo.id, randomUser.userId);
    setTimeout(async () => await tlgrm.sendMessage(chatInfo.id, 'Сегодня пидор дня - ' + getUserLink(member.user), {parse_mode: 'HTML'}), 2000)
}

function pidorStats(bot: Telegraf<MyContext>) {
    bot.command('stats', async ctx => {
        const results = await ctx.chatInfo.stats
            .sort((a, b) => b.pidorCount - a.pidorCount)
            .map(async (value, index) => {
                const user = (await ctx.getChatMember(value.userId)).user;
                return `${index + 1}. ${user.first_name} ${user.last_name} - ${value.pidorCount}`;
            })
        const resultstr = (await Promise.all(results)).join("\n")
        ctx.reply(`Результаты:\n\n` + resultstr)
    })
}

function schedulePidor(bot: Telegraf<MyContext>) {
    scheduleJob(
        // '0 */1 * * * *',
        '0 15 * * *',
        async () => {
        const chats = await findActiveChats();
        chats.forEach(obj => {
            electNewPidor(bot.telegram, obj)
        })
    })
}

export function setupPidor(bot: Telegraf<MyContext>) {
    registerChatMemberListener(bot)
    findPidor(bot)
    pidorStats(bot)
    schedulePidor(bot)
}