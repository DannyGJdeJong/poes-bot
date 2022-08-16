import sharp from "sharp";

export const loadImage = (imageData: Buffer): sharp.Sharp | null => {
  try {
    return sharp(imageData);
  } catch {
    return null;
  }
};
