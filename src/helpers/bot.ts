import { Telegraf } from 'telegraf'
import {MyContext} from "../types/telegraf";

export const bot = new Telegraf<MyContext>(process.env.TOKEN)
