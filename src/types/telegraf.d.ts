import I18N from 'telegraf-i18n'
import { DocumentType } from '@typegoose/typegoose'
import { Middleware } from 'telegraf'
import { TelegrafContext } from 'telegraf/typings/context'
import {ChatInfo} from "@/models/ChatInfo";

declare module 'telegraf' {
  export class Context {
    chatInfo: DocumentType<ChatInfo>
    i18n: I18N
  }

  export interface Composer<TContext extends Context> {
    action(
      action: string | string[] | RegExp,
      middleware: Middleware<TelegrafContext>,
      ...middlewares: Array<Middleware<TelegrafContext>>
    ): Composer<TContext>
  }
}
