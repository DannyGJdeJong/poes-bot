import { registerResizeCommand } from "./resize";
import {
  registerStickerCommands,
  registerInlineCommand as _registerInlineCommand,
} from "./sticker";

import type { RegisterCommand } from "../types";

export const registerCommandFunctions: RegisterCommand[] = [
  registerStickerCommands,
  registerResizeCommand,
];
export const registerInlineCommand = _registerInlineCommand;
