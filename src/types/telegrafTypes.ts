import type { Context, NarrowedContext, Telegraf } from "telegraf";
import type { Update } from "telegraf/typings/core/types/typegram";
import type {
  MessageSubType,
  MountMap,
  UpdateType,
} from "telegraf/typings/telegram-types";

export type GenericContext = NarrowedContext<
  Context<Update>,
  MountMap[UpdateType]
>;

export type SpecifiedContext<T extends UpdateType | MessageSubType> =
  NarrowedContext<Context<Update>, MountMap[T]>;

export type Bot = Telegraf<Context<Update>>;

// TODO: Figure out how I can rename this file to telegraf.ts without causing a circular import with esnext
