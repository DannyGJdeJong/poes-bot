import Jimp from "jimp";
import sharp from "sharp";
import { SpeechBubbleOptions } from "../types";
import { FONT_PATH } from "../constants";
import { loadFont } from "./load-font";
import { measureText, measureTextHeight, print } from "./print";

export type TextToImageOptions = {
  text: string;
} & SpeechBubbleOptions;

export type ImageToImageOptions = {
  image: Jimp;
} & SpeechBubbleOptions;

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

export const addImageToImage = async ({
  image,
  imagePath,
  overlayPath,
  centerX,
  centerY,
  boundingBoxWidth,
  boundingBoxHeight,
  boundingBoxAngle,
}: ImageToImageOptions) => {
  const targetImage = await Jimp.read(imagePath);
  const imageWidth = image.getWidth();
  const imageHeight = image.getHeight();

  const newWidth = Math.sqrt(
    Math.pow(boundingBoxHeight, 2) /
      (Math.pow(imageHeight, 2) / Math.pow(imageWidth, 2) +
        Math.pow(boundingBoxHeight, 2) / Math.pow(boundingBoxWidth, 2))
  );

  const newHeight = newWidth * (imageHeight / imageWidth);

  try {
    image.scaleToFit(newWidth, newHeight);

    image.rotate(boundingBoxAngle);

    const padLeft = image.bitmap.width / 2;
    const padTop = image.bitmap.height / 2;

    targetImage.blit(image, centerX - padLeft, centerY - padTop);

    if (overlayPath) {
      targetImage.blit(await Jimp.read(overlayPath), 0, 0);
    }
  } catch (e) {
    console.error(e);
    return null;
  }

  return await sharp(await targetImage.getBufferAsync(Jimp.MIME_PNG))
    .webp()
    .toBuffer();
};
