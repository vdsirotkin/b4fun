import { User } from "telegraf/typings/core/types/typegram"

export interface UserFrontInfo {
    id: number
    username?: string
    firstName?: string
    lastName?: String
}

export function mapUser(user: User): UserFrontInfo {
    return  {
        id: user.id,
        lastName: user.last_name,
        firstName: user.first_name,
        username: user.username
    }
}

export function getUserLink(user: UserFrontInfo): string {
    if (user.username) return `@${user.username}`
    return `<a href="tg://user?id=${user.id}">${user.firstName || ''} ${user.lastName || ''}</a>`
}