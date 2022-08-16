import { Telegraf } from "telegraf";

import { BOT_TOKEN } from "./constants";
import { registerCommandFunctions, registerInlineCommand } from "./commands";

import type { Bot, State } from "./types";

const bot: Bot = new Telegraf(BOT_TOKEN);

const state: State = {
  pendingActions: {},
};

registerInlineCommand(bot);
const commandsHelpText = registerCommandFunctions
  .map((registerCommand) => registerCommand(bot, state))
  .join("\n");

bot.start(async (ctx) => {
  ctx.reply("Hello " + ctx.from.first_name + "!");
});

bot.help((ctx) => {
  ctx.replyWithMarkdownV2(`
*Commands*:
${commandsHelpText}

*Auxiliary commands*:
/start \\- Starts the bot
/help \\- Displays this help message
  `);
});

bot.command("quit", (ctx) => {});

bot.on("message", async (ctx) => {
  const pendingAction =
    state.pendingActions[ctx.message.from.id.toString()] || (async () => {});

  await pendingAction(ctx);
});

bot.launch();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
