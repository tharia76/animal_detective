import { ImageSourcePropType } from 'react-native';

export type FrameData = {
  filename: string;
  frame: { x: number; y: number; w: number; h: number };
  rotated: boolean;
  trimmed: boolean;
  spriteSourceSize: { x: number; y: number; w: number; h: number };
  sourceSize: { w: number; h: number };
};

export type AnimalType = {
  id: number;
  name: string;
  type: 'sprite' | 'image';
  animalType: 'Farm' | 'Forest' | 'Ocean';
  source: ImageSourcePropType;
  frames?: FrameData[];
  spriteSheetSize?: { w: number; h: number };
  sound: any;         // You can refine this further if you want
  labelSound: any;    // Same here
};
