import type { GenericContext } from "./telegrafTypes";

export * from "./font";
export * from "./sticker";
export * from "./telegrafTypes";

export type State = {
  // Mapping of UserId -> Action
  pendingActions: Record<string, (ctx: GenericContext) => Promise<void>>;
};
