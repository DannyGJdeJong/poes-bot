import {
  registerStickerCommands,
  registerInlineCommand as _registerInlineCommand,
} from "./sticker";

export const registerCommandFunctions = [registerStickerCommands];
export const registerInlineCommand = _registerInlineCommand;
