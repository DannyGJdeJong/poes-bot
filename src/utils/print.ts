import Jimp from "jimp";
import type { Font, FontChar } from "../types";

const constants = {
  AUTO: -1,
  HORIZONTAL_ALIGN_LEFT: 1,
  HORIZONTAL_ALIGN_CENTER: 2,
  HORIZONTAL_ALIGN_RIGHT: 4,
  VERTICAL_ALIGN_TOP: 8,
  VERTICAL_ALIGN_MIDDLE: 16,
  VERTICAL_ALIGN_BOTTOM: 32,
};

const xOffsetBasedOnAlignment = (
  font: Font,
  line: string,
  maxWidth: number,
  alignment: number
) => {
  if (alignment === constants.HORIZONTAL_ALIGN_LEFT) {
    return 0;
  }

  if (alignment === constants.HORIZONTAL_ALIGN_CENTER) {
    return (maxWidth - measureText(font, line)) / 2;
  }

  return maxWidth - measureText(font, line);
};

const textToCodepoints = (font: Font, text: string) => {
  let codePoints: number[] = [];

  for (let char of text) {
    const codePoint = char.codePointAt(0);

    if (!codePoint) {
      continue;
    }

    codePoints.push(codePoint);
  }

  codePoints = codePoints.filter((val) => val !== 65039);

  const ret = [];

  for (let i = 0; i < codePoints.length; i++) {
    if (codePoints[i] < 256) {
      ret.push(codePoints[i].toString());
      continue;
    }

    const nextChars = new Array(5)
      .fill(undefined)
      .map((_, x) => codePoints[i + x]);

    for (let x = 5; x > 0; x--) {
      const nextXChars = [...nextChars]
        .slice(0, x)
        .filter((a) => a > 0)
        .join("_");

      if (font.chars[nextXChars]) {
        ret.push(nextXChars);
        i += x - 1;
        break;
      }
    }
  }

  return ret;
};

const drawCharacter = async (
  image: Jimp,
  font: Font,
  x: number,
  y: number,
  char: FontChar
) => {
  if (char.width > 0 && char.height > 0) {
    const characterPage = font.pages[char.page];

    image.blit(
      characterPage,
      x + char.xoffset,
      y + char.yoffset,
      char.x,
      char.y,
      char.width,
      char.height
    );
  }

  return image;
};

export const measureText = (font: Font, text: string) => {
  let x = 0;

  const codePoints = textToCodepoints(font, text);

  for (let i = 0; i < codePoints.length; i++) {
    const codePointi = codePoints[i];
    const codePointi1 = codePoints[i + 1];

    if (font.chars[codePointi]) {
      const kerning =
        font.kernings[codePointi] && font.kernings[codePointi][codePointi1]
          ? font.kernings[codePointi][codePointi1]
          : 0;

      x += (font.chars[codePointi].xadvance || 0) + kerning;
    }
  }

  return x;
};

export const measureTextHeight = (
  font: Font,
  text: string,
  maxWidth: number
) => {
  const lines = splitLines(font, text, maxWidth);
  return lines.length * font.common.lineHeight;
};

const printText = (
  image: Jimp,
  font: Font,
  x: number,
  y: number,
  text: string,
  defaultCharWidth: number
) => {
  const codePoints = textToCodepoints(font, text);

  for (let i = 0; i < codePoints.length; i++) {
    let codePointString;

    if (font.chars[codePoints[i]]) {
      codePointString = codePoints[i];
    } else if (/\s/.test(String.fromCodePoint(parseInt(codePoints[i])))) {
      codePointString = "32"; // ""
    } else {
      codePointString = "63"; // ?
    }

    const fontChar = font.chars[codePointString] || {};
    const fontKerning = font.kernings[codePointString];

    drawCharacter(image, font, x, y, fontChar || {});

    const kerning =
      fontKerning && fontKerning[codePoints[i + 1]?.toString()]
        ? fontKerning[codePoints[i + 1].toString()]
        : 0;

    x += kerning + (fontChar.xadvance || defaultCharWidth);
  }
};

const splitLines = (font: Font, text: string, maxWidth: number) => {
  const words = text.split(" ");
  const lines: string[][] = [];
  let currentLine: string[] = [];

  words.forEach((word) => {
    const line = [...currentLine, word].join(" ");
    const length = measureText(font, line);

    if (length <= maxWidth) {
      currentLine.push(word);
    } else {
      lines.push(currentLine);
      currentLine = [word];
    }
  });

  lines.push(currentLine);

  return lines.filter((line) => line.length > 0);
};

export const print = (
  image: Jimp,
  font: Font,
  x: number,
  y: number,
  {
    text,
    alignmentX,
    alignmentY,
  }: { text: string; alignmentX: number; alignmentY: number },
  maxWidth: number,
  maxHeight: number
) => {
  if (
    maxHeight !== Infinity &&
    alignmentY === constants.VERTICAL_ALIGN_BOTTOM
  ) {
    y += maxHeight - measureTextHeight(font, text, maxWidth);
  } else if (
    maxHeight !== Infinity &&
    alignmentY === constants.VERTICAL_ALIGN_MIDDLE
  ) {
    y += maxHeight / 2 - measureTextHeight(font, text, maxWidth) / 2;
  }

  const defaultCharWidth = Object.entries(font.chars)[0][1].xadvance;
  const lines = splitLines(font, text, maxWidth);

  lines.forEach((line) => {
    const lineString = line.join(" ");
    const alignmentWidth = xOffsetBasedOnAlignment(
      font,
      lineString,
      maxWidth,
      alignmentX
    );

    printText(image, font, x + alignmentWidth, y, lineString, defaultCharWidth);

    y += font.common.lineHeight;
  });

  return image;
};
