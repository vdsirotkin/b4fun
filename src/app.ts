// Setup @/ aliases for modules
import 'module-alias/register'
// Config dotenv
import * as dotenv from 'dotenv'
import * as expand from 'dotenv-expand'

if (process.env.ENV == 'production') {
  const config = dotenv.config({ path: `${__dirname}/../.env.production` });
  expand(config)
} else {
  dotenv.config({ path: `${__dirname}/../.env` });
}
// Dependencies
import { bot } from '@/helpers/bot'
import { checkTime } from '@/middlewares/checkTime'
import { setupHelp } from '@/commands/help'
import { setupI18N } from '@/helpers/i18n'
import {attachChat} from "@/middlewares/attachChat";
import {setupPidor} from "@/commands/pidor";
import {logEverything} from "./middlewares/logEverything";

// Check time
bot.use(logEverything)
bot.use(checkTime)
bot.use(attachChat)
// Setup localization
setupI18N(bot)
// Setup commands
setupHelp(bot)
setupPidor(bot)

// Start bot
bot.launch().then(() => {
  console.info('Bot is up and running')
})