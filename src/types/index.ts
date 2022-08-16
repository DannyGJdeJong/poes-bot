import type { Bot, GenericContext } from "./telegrafTypes";

export * from "./font";
export * from "./sticker";
export * from "./telegrafTypes";

export type State = {
  // Mapping of UserId -> Action
  pendingActions: Record<string, (ctx: GenericContext) => Promise<void>>;
};

export type RegisterCommand = (bot: Bot, state: State) => string;
