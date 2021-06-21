import {Context, Telegraf, Telegram} from "telegraf";
import {ChatInfo, findActiveChats, StatInfo} from "@/models/ChatInfo";
import {isGroup} from "@/middlewares/isGroup";
import {getUserLink, mapUser, UserFrontInfo} from "@/helpers/user";
import moment = require("moment");
import { scheduleJob } from "node-schedule";
import {DocumentType} from "@typegoose/typegoose";
import {MyContext} from "@/types/telegraf";

const randomInteger = require('random-int')

function registerChatMemberListener(bot: Telegraf<MyContext>) {
    bot.on('message', isGroup, async (ctx, next) => {
        const userId = ctx.from.id;
        const chatInfo = ctx.chatInfo;
        let userInfo: StatInfo = chatInfo.stats.find(value => value.userId == userId)
        if (!userInfo) {
            userInfo = new StatInfo();
            userInfo.userId = userId;
            const index = chatInfo.stats.push(userInfo);
            userInfo = chatInfo.stats[index-1]
        }
        if (!userInfo.infoFilled) {
            userInfo.firstName = ctx.from.first_name
            userInfo.lastName = (ctx.from.last_name || '')
            userInfo.username = ctx.from.username
            userInfo.infoFilled = true
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
            const member = ctx.chatInfo.stats.find(val => val.userId == lastPidorOfTheDay)
            if (member && member.infoFilled) {
                await ctx.replyWithHTML('Сегодня пидор дня - ' + getUserLink({
                    id: member.userId,
                    lastName: member.lastName,
                    firstName: member.firstName,
                    username: member.username
                }))
            } else {
                const member = await ctx.getChatMember(lastPidorOfTheDay);
                await ctx.replyWithHTML('Сегодня пидор дня - ' + getUserLink(mapUser(member.user)))
            }
        }
    })
}

async function electNewPidor(tlgrm: Telegram, chatInfo: DocumentType<ChatInfo>) {
    tlgrm.sendMessage(chatInfo.id, 'Выбираем нового пидора...')
    let randomUserIndex: number;
    let randomUser: StatInfo = null;
    let member: UserFrontInfo;
    while (randomUser == null) {
        randomUserIndex = randomInteger(0, chatInfo.stats.length - 1);
        randomUser = chatInfo.stats[randomUserIndex];
        try {
            if (randomUser.infoFilled) {
                member = {id: randomUser.userId, lastName: randomUser.lastName, firstName: randomUser.firstName, username: randomUser.username}
            } else {
                const chatMember = await tlgrm.getChatMember(chatInfo.id, randomUser.userId);
                member = mapUser(chatMember.user)
            }
        } catch (e) {
            console.warn(e)
            randomUser = null
        }
    }
    randomUser.pidorCount++
    chatInfo.lastPidorOfTheDay = randomUser.userId
    chatInfo.lastChooseDate = moment().startOf('days').toDate()
    await chatInfo.save()
    setTimeout(async () => await tlgrm.sendMessage(chatInfo.id, 'Сегодня пидор дня - ' + getUserLink(member), {parse_mode: 'HTML'}), 2000)
}

function pidorStats(bot: Telegraf<MyContext>) {
    bot.command('stats', async ctx => {
        const results = await ctx.chatInfo.stats
            .sort((a, b) => b.pidorCount - a.pidorCount)
            .map(async (value, index) => {
                try {
                    if (value.infoFilled) {
                        return `${value.firstName} ${value.lastName || ''} - ${value.pidorCount}`
                    }
                    const user = (await ctx.getChatMember(value.userId)).user;
                    return `${user.first_name} ${user.last_name || ''} - ${value.pidorCount}`;
                } catch (e) {
                    console.warn(e)
                }
                return null
            })
        const resultstr = (await Promise.all(results))
            .filter(value => value != null)
            .map((value, index) => `${index + 1}. ${value}`)
            .join("\n")
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