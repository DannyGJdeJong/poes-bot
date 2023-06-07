import axios from "axios";
import sharp from "sharp";
import Jimp from "jimp";
import { v4 as uuid } from "uuid";

import { addImageToImage, addTextToImage } from "../utils/sticker";
import { SpeechBubbleOptions, StickerCommandOptions } from "sticker";
import { STICKER_CHAT_ID } from "../constants";

import type { Bot, GenericContext, SpecifiedContext, State } from "../types";

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
      boundingBoxShape: "ellipse",
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
      boundingBoxShape: "ellipse",
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
      boundingBoxShape: "ellipse",
    },
  },
  {
    name: "nerd",
    command: "nerd",
    speechBubbleOptions: {
      imagePath: "./src/assets/denninerd.png",
      centerX: 245,
      centerY: 82,
      boundingBoxWidth: 414,
      boundingBoxHeight: 132,
      boundingBoxAngle: 0,
      boundingBoxShape: "rectangle",
    },
  },
  {
    name: "admire",
    command: "admire",
    speechBubbleOptions: {
      imagePath: "./src/assets/denniadmire.png",
      overlayPath: "./src/assets/denniadmire2.png",
      centerX: 104,
      centerY: 128,
      boundingBoxWidth: 335,
      boundingBoxHeight: 220,
      boundingBoxAngle: 49,
      boundingBoxShape: "ellipse",
    },
  },
  {
    name: "certified",
    command: "certified",
    speechBubbleOptions: {
      imagePath: "./src/assets/dennicertified.png",
      centerX: 155,
      centerY: 209,
      boundingBoxWidth: 132,
      boundingBoxHeight: 60,
      boundingBoxAngle: 11,
      boundingBoxShape: "rectangle",
    },
  },
];

const onStickerHandler = async (
  ctx: SpecifiedContext<"sticker">,
  speechBubbleOptions: SpeechBubbleOptions
) => {
  const inputStickerUrl = await ctx.telegram.getFileLink(
    ctx.message.sticker.file_id
  );

  const inputStickerBuffer = (
    await axios({
      url: inputStickerUrl.href,
      responseType: "arraybuffer",
    })
  ).data as Buffer;

  const inputStickerImage = await Jimp.read(
    await sharp(inputStickerBuffer).png().toBuffer()
  );

  const stickerImage = await addImageToImage({
    image: inputStickerImage,
    ...speechBubbleOptions,
  });

  if (!stickerImage) {
    return;
  }

  ctx.replyWithSticker({
    source: stickerImage,
  });
};

const onTextHandler = async (
  ctx: SpecifiedContext<"text">,
  speechBubbleOptions: SpeechBubbleOptions
) => {
  const stickerImage = await addTextToImage({
    text: ctx.message.text,
    ...speechBubbleOptions,
  });

  if (!stickerImage) {
    return;
  }

  ctx.replyWithSticker({
    source: stickerImage,
  });
};

const onPhotoHandler = async (
  ctx: SpecifiedContext<"photo">,
  speechBubbleOptions: SpeechBubbleOptions
) => {
  const inputPhotoUrl = await ctx.telegram.getFileLink(
    ctx.message.photo[0].file_id
  );

  const inputPhotoBuffer = (
    await axios({
      url: inputPhotoUrl.href,
      responseType: "arraybuffer",
    })
  ).data as Buffer;

  const inputPhotoImage = await Jimp.read(
    await sharp(inputPhotoBuffer).png().toBuffer()
  );

  const stickerImage = await addImageToImage({
    image: inputPhotoImage,
    ...speechBubbleOptions,
  });

  if (!stickerImage) {
    return;
  }

  ctx.replyWithSticker({
    source: stickerImage,
  });
};

const onMessageHandler = async (
  ctx: GenericContext,
  speechBubbleOptions: SpeechBubbleOptions
) => {
  if (!ctx.message) {
    return;
  }

  if ("sticker" in ctx.message) {
    await onStickerHandler(
      ctx as SpecifiedContext<"sticker">,
      speechBubbleOptions
    );
  }

  if ("text" in ctx.message) {
    await onTextHandler(ctx as SpecifiedContext<"text">, speechBubbleOptions);
  }

  if ("photo" in ctx.message) {
    await onPhotoHandler(ctx as SpecifiedContext<"photo">, speechBubbleOptions);
  }
};

export const registerStickerCommands = (bot: Bot, state: State): string => {
  const stickerCommands = stickers.map((sticker) => {
    bot.command(sticker.command, async (ctx) => {
      // Split the command from the input text
      // e.g. "/nom test" becomes "test"
      const inputText = ctx.message.text.split(" ").slice(1).join(" ");

      // If no input text is defined, add pending action and return
      if (!inputText) {
        state.pendingActions[ctx.message.from.id] = async (ctx) =>
          await onMessageHandler(ctx, sticker.speechBubbleOptions);
        return;
      }

      // If input text is defined, handle normally
      const stickerImage = await addTextToImage({
        text: inputText,
        ...sticker.speechBubbleOptions,
      });

      if (!stickerImage) {
        return;
      }

      ctx.replyWithSticker({
        source: stickerImage,
      });
    });
    return sticker.command;
  });

  return `${stickerCommands
    .map(
      (command) =>
        `/${command} \\[text\\] \\- Creates a sticker from supplied text\\.`
    )
    .join("\n")}
If no text is provided, any subsequent messages \\(text, stickers and images\\) are used to create stickers\\.`;
};

export const registerInlineCommand = (bot: Bot) => {
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
