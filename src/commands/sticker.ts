import { Context, Telegraf } from "telegraf";
import { Update } from "telegraf/typings/core/types/typegram";
import { addTextToImage } from "../utils/sticker.js";
import { v4 as uuid } from "uuid";
import { STICKER_CHAT_ID } from "../constants.js";

const addTextToMeow = async (text: string) => {
  return addTextToImage({
    text,
    imagePath: "./src/assets/dennimeow.png",
    overlayPath: "./src/assets/dennimeow2.png",
    centerX: 257,
    centerY: 144,
    boundingBoxWidth: 416,
    boundingBoxHeight: 248,
    boundingBoxAngle: 0,
  });
};

const addTextToNom = async (text: string) => {
  return addTextToImage({
    text,
    imagePath: "./src/assets/denninom.png",
    centerX: 90,
    centerY: 97,
    boundingBoxWidth: 183,
    boundingBoxHeight: 111,
    boundingBoxAngle: 35,
  });
};

const addTextToHeart = async (text: string) => {
  return addTextToImage({
    text,
    imagePath: "./src/assets/denniheart.png",
    centerX: 274,
    centerY: 82,
    boundingBoxWidth: 167,
    boundingBoxHeight: 112,
    boundingBoxAngle: 0,
  });
};

export const registerNomCommand = (bot: Telegraf<Context<Update>>) => {
  bot.command("nom", async (ctx) => {
    const stickerImage = await addTextToNom(
      ctx.message.text.split(" ").slice(1).join(" ")
    );

    if (!stickerImage) {
      return;
    }

    ctx.replyWithSticker({
      source: stickerImage,
    });
  });
};

export const registerHeartCommand = (bot: Telegraf<Context<Update>>) => {
  bot.command("heart", async (ctx) => {
    const stickerImage = await addTextToHeart(
      ctx.message.text.split(" ").slice(1).join(" ")
    );

    if (!stickerImage) {
      return;
    }

    ctx.replyWithSticker({
      source: stickerImage,
    });
  });
};

export const registerMeowCommand = (bot: Telegraf<Context<Update>>) => {
  bot.command("meow", async (ctx) => {
    const stickerImage = await addTextToMeow(
      ctx.message.text.split(" ").slice(1).join(" ")
    );

    if (!stickerImage) {
      return;
    }

    ctx.replyWithSticker({
      source: stickerImage,
    });
  });
};

export const registerInlineCommand = (bot: Telegraf<Context<Update>>) => {
  bot.on("inline_query", async (ctx) => {
    if (!ctx.inlineQuery.query) {
      return;
    }

    const nomSticker = await addTextToNom(ctx.inlineQuery.query);

    if (!nomSticker) {
      return;
    }

    const nomStickerInstance = await ctx.telegram.sendSticker(STICKER_CHAT_ID, {
      source: nomSticker,
    });

    const heartSticker = await addTextToHeart(ctx.inlineQuery.query);

    if (!heartSticker) {
      return;
    }

    const heartStickerInstance = await ctx.telegram.sendSticker(
      STICKER_CHAT_ID,
      {
        source: heartSticker,
      }
    );

    const meowSticker = await addTextToMeow(ctx.inlineQuery.query);

    if (!meowSticker) {
      return;
    }

    const meowStickerInstance = await ctx.telegram.sendSticker(
      STICKER_CHAT_ID,
      {
        source: meowSticker,
      }
    );

    ctx.answerInlineQuery([
      {
        id: uuid(),
        type: "sticker",
        sticker_file_id: nomStickerInstance.sticker.file_id,
      },
      {
        id: uuid(),
        type: "sticker",
        sticker_file_id: heartStickerInstance.sticker.file_id,
      },
      {
        id: uuid(),
        type: "sticker",
        sticker_file_id: meowStickerInstance.sticker.file_id,
      },
    ]);
  });
};
