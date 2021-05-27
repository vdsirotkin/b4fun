import {getModelForClass, prop} from "@typegoose/typegoose";
import moment = require("moment");

export class StatInfo {
    @prop({required: true})
    userId: number

    @prop({required: true, default: ''})
    firstName: string

    @prop({required: true, default: ''})
    lastName: string

    @prop({default: null})
    username: string

    @prop({required: true, default: false})
    infoFilled: boolean

    @prop({required: true, default: 0})
    pidorCount: number
}

export class ChatInfo {
    @prop({required: true, unique: true, index: true})
    id: number

    @prop({required: true, default: [], type: () => StatInfo})
    stats: StatInfo[]

    @prop({required: true, default: 'ru'})
    language: string

    @prop({required: true, default: moment().subtract(1, 'days').startOf('day')})
    lastChooseDate: Date

    @prop()
    lastPidorOfTheDay: number
}

const ChatModel = getModelForClass(ChatInfo, {schemaOptions: {timestamps: true}})

export async function getChatInfo(id: number) {
    let chat = await ChatModel.findOne({id});
    if (!chat) {
        chat = await new ChatModel({id}).save()
    }
    return chat
}

export async function findActiveChats() {
    return ChatModel.find({$and: [{$expr: {$gt: [{$size: "$stats"}, 1]}}, {$expr: {$lt: [{$dayOfYear: "$lastChooseDate"}, {$dayOfYear: new Date()}]}}]});
}
