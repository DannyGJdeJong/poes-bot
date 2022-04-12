import { Context, Telegraf } from "telegraf";
import axios from "axios";
import sharp from "sharp";
import { Url } from "url";
import Jimp from "jimp";
import { v4 as uuid } from "uuid";
import { Update } from "telegraf/typings/core/types/typegram";

import { addImageToImage, addTextToImage } from "../utils/sticker.js";
import { SpeechBubbleOptions, StickerCommandOptions } from "sticker.js";
import { STICKER_CHAT_ID } from "../constants.js";

const stickers: StickerCommandOptions[] = [
  {
    name: "meow",
    command: "meow",
    speechBubbleOptions: {
      imagePath: "./src/assets/dennimeow.png",
      overlayPath: "./src/assets/dennimeow2.png",
      centerX: 257,
      centerY: 144,
      boundingBoxWidth: 416,
      boundingBoxHeight: 248,
      boundingBoxAngle: 0,
    },
  },
  {
    name: "nom",
    command: "nom",
    speechBubbleOptions: {
      imagePath: "./src/assets/denninom.png",
      centerX: 90,
      centerY: 97,
      boundingBoxWidth: 183,
      boundingBoxHeight: 111,
      boundingBoxAngle: 35,
    },
  },
  {
    name: "heart",
    command: "heart",
    speechBubbleOptions: {
      imagePath: "./src/assets/denniheart.png",
      centerX: 274,
      centerY: 82,
      boundingBoxWidth: 167,
      boundingBoxHeight: 112,
      boundingBoxAngle: 0,
    },
  },
];

export const replyWithSticker = async (
  ctx: any,
  speechBubbleOptions: SpeechBubbleOptions
) => {
  const stickerUrl: Url = await ctx.telegram.getFileLink(
    ctx.message.sticker.file_id
  );

  const inputImage = (
    await axios({
      url: stickerUrl.href,
      responseType: "arraybuffer",
    })
  ).data as Buffer;

  const sticker = await Jimp.read(await sharp(inputImage).png().toBuffer());

  const stickerImage = await addImageToImage({
    image: sticker,
    ...speechBubbleOptions,
  });

  if (!stickerImage) {
    return;
  }

  ctx.replyWithSticker({
    source: stickerImage,
  });
};

export const registerStickerCommands = (
  bot: Telegraf<Context<Update>>,
  state: {
    pendingActions: Record<string, (ctx: any) => void>;
  }
) => {
  stickers.forEach((sticker) => {
    bot.command(sticker.command, async (ctx) => {
      if (!ctx.message.text.split(" ").slice(1).join(" ")) {
        state.pendingActions[ctx.message.from.id] = async (ctx) => {
          await replyWithSticker(ctx, sticker.speechBubbleOptions);
        };
        return;
      }

      const stickerImage = await addTextToImage({
        text: ctx.message.text.split(" ").slice(1).join(" "),
        ...sticker.speechBubbleOptions,
      });

      if (!stickerImage) {
        return;
      }

      ctx.replyWithSticker({
        source: stickerImage,
      });
    });
  });
};

export const registerInlineCommand = (bot: Telegraf<Context<Update>>) => {
  bot.on("inline_query", async (ctx) => {
    if (!ctx.inlineQuery.query) {
      return;
    }

    const stickerBuffers = (
      await Promise.all(
        stickers.map((sticker) =>
          addTextToImage({
            text: ctx.inlineQuery.query,
            ...sticker.speechBubbleOptions,
          })
        )
      )
    ).filter((stickerBuffer) => stickerBuffer !== null) as Buffer[];

    const sentStickers = await Promise.all(
      stickerBuffers.map(async (stickerBuffer) => {
        return await ctx.telegram.sendSticker(STICKER_CHAT_ID, {
          source: stickerBuffer,
        });
      })
    );

    ctx.answerInlineQuery(
      sentStickers.map((sticker) => ({
        id: uuid(),
        type: "sticker",
        sticker_file_id: sticker.sticker.file_id,
      }))
    );
  });
};
