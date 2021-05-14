import {Context} from "telegraf";
import {getChatInfo} from "@/models";

export async function attachChat(ctx: Context, next) {
    if (ctx.chat) {
        console.log('chat id == ' + ctx.chat.id);
        ctx.chatInfo = await getChatInfo(ctx.chat.id)
    }
    return next()
}