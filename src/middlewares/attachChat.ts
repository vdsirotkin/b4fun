import {Context} from "telegraf";
import {getChatInfo} from "@/models";
import {MyContext} from "../types/telegraf";

export async function attachChat(ctx: MyContext, next) {
    let chatId
    if (ctx.chat) {
        console.log('chat id == ' + ctx.chat.id);
        chatId = ctx.chat.id
    } else if ("my_chat_member" in ctx.update) {
        console.log('chat id == ' + ctx.update.my_chat_member.chat.id);
        chatId = ctx.update.my_chat_member.chat.id
    }
    ctx.chatInfo = await getChatInfo(chatId)
    return next()
}