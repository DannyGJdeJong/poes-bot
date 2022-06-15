import { Telegraf } from "telegraf";

import { BOT_TOKEN } from "./constants";
import {
  registerInlineCommand,
  registerStickerCommands,
} from "./commands/sticker";

import type { Bot, State } from "./types";

const bot: Bot = new Telegraf(BOT_TOKEN);

const state: State = {
  pendingActions: {},
};

bot.start(async (ctx) => {
  ctx.reply("Hello " + ctx.from.first_name + "!");
});

bot.help((ctx) => {
  ctx.replyWithMarkdownV2(`
*Commands*:
/nom \\[text\\] \\- Creates a sticker from text
/heart \\[text\\] \\- Creates a sticker from text
/meow \\[text\\] \\- Creates a sticker from text

/nom - Follow up with text, a sticker or an image
/heart - Follow up with text, a sticker or an image
/meow - Follow up with text, a sticker or an image

*Auxiliary commands*:
/start \\- Starts the bot
/help \\- Displays this help message
  `);
});

bot.command("quit", (ctx) => {});

registerInlineCommand(bot);
registerStickerCommands(bot, state);

bot.on("sticker", async (ctx) => {
  const pendingAction =
    state.pendingActions[ctx.message.from.id.toString()] || (async () => {});

  await pendingAction(ctx);
});

bot.on("text", async (ctx) => {
  const pendingAction =
    state.pendingActions[ctx.message.from.id.toString()] || (async () => {});

  await pendingAction(ctx);
});

bot.on("photo", async (ctx) => {
  const pendingAction =
    state.pendingActions[ctx.message.from.id.toString()] || (async () => {});

  await pendingAction(ctx);
});

bot.launch();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
