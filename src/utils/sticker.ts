import Jimp from "jimp";
import sharp from "sharp";
import { FONT_PATH } from "../constants.js";
import { loadFont } from "./load-font.js";
import { measureText, measureTextHeight, print } from "./print.js";

export interface TextToImageOptions {
  text: string;
  imagePath: string;
  overlayPath?: string;
  centerX: number;
  centerY: number;
  boundingBoxWidth: number;
  boundingBoxHeight: number;
  boundingBoxAngle: number;
}

const font = await (loadFont(FONT_PATH) as ReturnType<typeof Jimp.loadFont>);

export const addTextToImage = async ({
  text,
  imagePath,
  overlayPath,
  centerX,
  centerY,
  boundingBoxWidth,
  boundingBoxHeight,
  boundingBoxAngle,
}: TextToImageOptions) => {
  const image = await Jimp.read(imagePath);

  const fontCanvasWidth = boundingBoxWidth * 4;
  const fontCanvasHeight = boundingBoxHeight * 4;

  const fontCanvas = await Jimp.create(fontCanvasWidth, fontCanvasHeight);

  const textWidth = Math.min(fontCanvasWidth, measureText(font, text));
  const textHeight = Math.min(
    fontCanvasHeight,
    measureTextHeight(font, text, fontCanvasWidth)
  );

  const newWidth = Math.sqrt(
    Math.pow(boundingBoxHeight, 2) /
      (Math.pow(textHeight, 2) / Math.pow(textWidth, 2) +
        Math.pow(boundingBoxHeight, 2) / Math.pow(boundingBoxWidth, 2))
  );

  const newHeight = newWidth * (textHeight / textWidth);

  try {
    print(
      fontCanvas,
      font,
      0,
      0,
      {
        text,
        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
        alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
      },
      fontCanvasWidth,
      fontCanvasHeight
    )
      .crop(
        (fontCanvasWidth - textWidth) / 2,
        (fontCanvasHeight - textHeight) / 2,
        textWidth,
        textHeight
      )
      .scaleToFit(newWidth, newHeight);

    fontCanvas.rotate(boundingBoxAngle);

    const padLeft = fontCanvas.bitmap.width / 2;
    const padTop = fontCanvas.bitmap.height / 2;

    image.blit(fontCanvas, centerX - padLeft, centerY - padTop);

    if (overlayPath) {
      image.blit(await Jimp.read(overlayPath), 0, 0);
    }
  } catch (e) {
    console.error(e);
    return null;
  }

  return await sharp(await image.getBufferAsync(Jimp.MIME_PNG))
    .webp()
    .toBuffer();
};
