import { User } from "telegraf/typings/telegram-types";

export function getUserLink(user: User): string {
    if (user.username) return `@${user.username}`
    return `<a href="tg://user?id=${user.id}">${user.first_name} ${user.last_name}</a>`
}