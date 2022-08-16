import { getFileFromFileId } from "../utils/telegram";
import { loadImage } from "../utils/image";

import type { Bot, GenericContext, RegisterCommand, State } from "../types";

const onMessageHandler = async (ctx: GenericContext) => {
  // Check if the message exists and contains a file
  if (!ctx.message) {
    return;
  }

  if (!("document" in ctx.message)) {
    ctx.reply("Please send the image as a file.");
    return;
  }

  // Get the received file as a buffer
  const inputFileBuffer = await getFileFromFileId(
    ctx,
    ctx.message.document.file_id
  );

  // Check if the received file is an image
  const originalImage = loadImage(inputFileBuffer);

  if (!originalImage) {
    return ctx.reply("Please send an image.");
  }

  // Resize and return the image to the user
  const resizedImage = await originalImage
    .resize(512, 512, { fit: "inside" })
    .png()
    .toBuffer();

  const newFilename =
    ctx.message.document.file_name?.split(".").slice(0, -1).join(".") +
    "_512px.png";

  return await ctx.replyWithDocument({
    source: resizedImage,
    filename: newFilename,
  });
};

export const registerResizeCommand: RegisterCommand = (
  bot: Bot,
  state: State
): string => {
  bot.command("resize", async (ctx) => {
    // Add action which is triggered on any message sent by the current user
    state.pendingActions[ctx.message.from.id] = async (ctx) => {
      await onMessageHandler(ctx);
    };

    return await ctx.reply(
      "Send the image you would like to have resized. Please send the image as a file."
    );
  });

  return `/resize \\- Resizes a given image to be the format of a Telegram sticker\\.`;
};
