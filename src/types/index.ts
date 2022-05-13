import { GenericContext } from "./telegrafTypes.js";

export * from "./font.js";
export * from "./sticker.js";
export * from "./telegrafTypes.js";

export type State = {
  // Mapping of UserId -> Action
  pendingActions: Record<string, (ctx: GenericContext) => Promise<void>>;
};
