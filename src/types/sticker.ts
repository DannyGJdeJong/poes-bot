export type SpeechBubbleOptions = {
  imagePath: string;
  overlayPath?: string;
  centerX: number;
  centerY: number;
  boundingBoxWidth: number;
  boundingBoxHeight: number;
  boundingBoxAngle: number;
};

export type StickerCommandOptions = {
  name: string;
  command: string;
  speechBubbleOptions: SpeechBubbleOptions;
};
