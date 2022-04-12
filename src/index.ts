import { Context, Telegraf } from "telegraf";
import { Update } from "typegram";
import { BOT_TOKEN } from "./constants.js";
import {
  registerInlineCommand,
  registerStickerCommands,
} from "./commands/sticker.js";

const bot: Telegraf<Context<Update>> = new Telegraf(BOT_TOKEN);

const state: {
  pendingActions: Record<string, (ctx: any) => Promise<void>>;
} = {
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

/nom - Follow up with a sticker
/heart - Follow up with a sticker
/meow - Follow up with a sticker

*Auxiliary commands*:
/start \\- Starts the bot
/help \\- Displays this help message
  `);
});

bot.command("quit", (ctx) => {});

bot.on("sticker", async (ctx) => {
  const pendingAction =
    state.pendingActions[ctx.message.from.id.toString()] || (async () => {});

  await pendingAction(ctx);
});

// bot.on("text", async (ctx) => {
//   const pendingAction =
//     state.pendingActions[ctx.message.from.id.toString()] || (() => {});
//   pendingAction(ctx);

//   // delete state.pendingActions[ctx.message.from.id.toString()];
// });

registerInlineCommand(bot);
registerStickerCommands(bot, state);

bot.launch();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
