import Jimp from "jimp";

export interface FontChar {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  xoffset: number;
  yoffset: number;
  xadvance: number;
  page: number;
  chnl: number;
}

export interface FontInfo {
  face: string;
  size: number;
  bold: number;
  italic: number;
  charset: string;
  unicode: number;
  stretchH: number;
  smooth: number;
  aa: number;
  padding: [number, number, number, number];
  spacing: [number, number];
}

export interface FontCommon {
  lineHeight: number;
  base: number;
  scaleW: number;
  scaleH: number;
  pages: number;
  packed: number;
  alphaChnl: number;
  redChnl: number;
  greenChnl: number;
  blueChnl: number;
}

export interface Font {
  chars: {
    [codePoint: string]: FontChar;
  };
  kernings: {
    [firstString: string]: {
      [secondString: string]: number;
    };
  };
  pages: Jimp[];
  common: FontCommon;
  info: FontInfo;
}
