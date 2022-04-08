import { Context, Telegraf } from "telegraf";
import { Update } from "typegram";

import { BOT_TOKEN } from "./constants.js";
import {
  registerHeartCommand,
  registerInlineCommand,
  registerMeowCommand,
  registerNomCommand,
} from "./commands/sticker.js";

const bot: Telegraf<Context<Update>> = new Telegraf(BOT_TOKEN);

bot.start(async (ctx) => {
  ctx.reply("Hello " + ctx.from.first_name + "!");
});

bot.help((ctx) => {
  ctx.replyWithMarkdownV2(`
*Commands*:
/nom \\[text\\] \\- Creates a sticker from text
/heart \\[text\\] \\- Creates a sticker from text
/meow \\[text\\] \\- Creates a sticker from text

*Auxiliary commands*:
/start \\- Starts the bot
/help \\- Displays this help message
  `);
});

bot.command("quit", (ctx) => {});
bot.on("text", (ctx) => {});

registerNomCommand(bot);
registerHeartCommand(bot);
registerMeowCommand(bot);
registerInlineCommand(bot);

bot.launch();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
