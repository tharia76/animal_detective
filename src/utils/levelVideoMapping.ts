// Mapping of level names to their corresponding intro videos
export const LEVEL_VIDEO_MAP: Record<string, any> = {
  
};

export const getLevelVideo = (levelName: string): any => {
  return LEVEL_VIDEO_MAP[levelName] || null;
};
