import Jimp from "jimp";
import Path from "path";
import { XMLParser } from "fast-xml-parser";
import type { Font, FontChar, FontCommon, FontInfo } from "../types";
import fs from "fs";

const loadPages = async (dir: string, pages: string[]) => {
  const newPages = pages.map((page) => {
    return Jimp.read(dir + "/" + page);
  });

  return Promise.all(newPages);
};

export const loadFont = async (file: string): Promise<Font> => {
  const parsedFont = parseBMFontXML(fs.readFileSync(file).toString());

  const chars: Font["chars"] = {};
  const kernings: Font["kernings"] = {};

  parsedFont.chars.forEach((char: FontChar) => {
    chars[char.id] = char;
  });

  for (let i = 0; i < parsedFont.kernings.length; i++) {
    const firstString = parsedFont.kernings[i].first;
    kernings[firstString] = kernings[firstString] || {};
    kernings[firstString][parsedFont.kernings[i].second] =
      parsedFont.kernings[i].amount;
  }

  const pages = await loadPages(Path.dirname(file), parsedFont.pages);

  return {
    chars,
    kernings,
    pages,
    common: parsedFont.common,
    info: parsedFont.info,
  };
};

function parseAttributes(obj: any) {
  for (const k in obj) {
    if (k === "face" || k === "charset" || k === "id") continue;
    else if (k === "padding" || k === "spacing") obj[k] = parseIntList(obj[k]);
    else obj[k] = parseInt(obj[k], 10);
  }
  return obj;
}

function parseIntList(data: any) {
  return data.split(",").map(function (val: any) {
    return parseInt(val, 10);
  });
}

export const parseBMFontXML = (data: string) => {
  data = data.toString().trim();

  var output: any = {
    chars: [],
    kernings: [],
    pages: [],
  };

  const parsedXml = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
  }).parse(data);
  const font = parsedXml.font;

  // console.log(JSON.stringify(parsedXml));

  output.common = parseAttributes(font.common) as FontCommon;

  output.info = parseAttributes(font.info) as FontInfo;

  for (var i = 0; i < font.pages.page.length; i++) {
    var p = font.pages.page[i];

    if (typeof p.id === "undefined")
      throw new Error("malformed file -- needs page id=N");
    if (typeof p.file !== "string")
      throw new Error('malformed file -- needs page file="path"');

    output.pages[parseInt(p.id, 10)] = p.file;
  }

  if (font.chars) {
    var chrArray = font.chars.char || [];
    for (var i = 0; i < chrArray.length; i++) {
      output.chars.push(parseAttributes(chrArray[i]));
    }
  }

  if (font.kernings) {
    var kernArray = font.kernings.kerning || [];
    for (var i = 0; i < kernArray.length; i++) {
      output.kernings.push(parseAttributes(kernArray[i]));
    }
  }

  return output;
};
