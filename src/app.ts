// Setup @/ aliases for modules
import 'module-alias/register'
// Config dotenv
import * as dotenv from 'dotenv'

if (process.env.ENV == 'production') {
  dotenv.config({ path: `${__dirname}/../.env.production` });
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

// Check time
bot.use(checkTime)
bot.use(attachChat)
// Setup localization
setupI18N(bot)
// Setup commands
setupHelp(bot)
// setupLanguage(bot)
setupPidor(bot)

// Start bot
bot.launch().then(() => {
  console.info('Bot is up and running')
})