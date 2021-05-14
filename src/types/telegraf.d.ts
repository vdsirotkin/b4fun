import I18N from 'telegraf-i18n'
import { DocumentType } from '@typegoose/typegoose'
import { Context, Middleware } from 'telegraf'
import {ChatInfo} from "@/models/ChatInfo";

export class MyContext extends Context {
  chatInfo: DocumentType<ChatInfo>
  i18n: I18N
}
