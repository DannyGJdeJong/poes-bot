import Jimp from "jimp";
import Path from "path";
import bMFont from "load-bmfont";
import { Font, FontChar, FontCommon, FontInfo } from "../types/font";

const loadPages = async (dir: string, pages: string[]) => {
  const newPages = pages.map((page) => {
    return Jimp.read(dir + "/" + page);
  });

  return Promise.all(newPages);
};

export const loadFont = async (file: string): Promise<Font> => {
  return new Promise((resolve, reject) => {
    bMFont(
      file,
      async (
        err: any,
        font: {
          chars: FontChar[];
          kernings: { first: string; second: string; amount: number }[];
          pages: string[];
          common: FontCommon;
          info: FontInfo;
        }
      ) => {
        const chars: Font["chars"] = {};
        const kernings: Font["kernings"] = {};

        if (err) {
          return reject();
        }

        for (let i = 0; i < font.chars.length; i++) {
          chars[font.chars[i].id] = font.chars[i];
        }

        for (let i = 0; i < font.kernings.length; i++) {
          const firstString = font.kernings[i].first;
          kernings[firstString] = kernings[firstString] || {};
          kernings[firstString][font.kernings[i].second] =
            font.kernings[i].amount;
        }

        // TODO: bMFont does not read pages correctly
        const pages = await loadPages(Path.dirname(file), [
          "open-sans-128-black.png",
          "open-sans-128-emoji.png",
        ]);

        const loadedFont: Font = {
          chars,
          kernings,
          pages,
          common: font.common,
          info: font.info,
        };

        resolve(loadedFont);
      }
    );
  });
};
