import axios from "axios";

import type { GenericContext } from "../types";

export const getFileFromFileId = async (
  ctx: GenericContext,
  fileId: string
): Promise<Buffer> => {
  const inputFileUrl = await ctx.telegram.getFileLink(fileId);

  return (
    await axios({
      url: inputFileUrl.href,
      responseType: "arraybuffer",
    })
  ).data as Buffer;
};
