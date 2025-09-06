// Mapping of level names to their corresponding intro videos
export const LEVEL_VIDEO_MAP: Record<string, any> = {
  'Farm': require('../assets/intro_videos/farm-vid1.mp4'),
  'Forest': require('../assets/intro_videos/forest.mp4'),
  'Ocean': require('../assets/intro_videos/water.mp4'),
  'Desert': require('../assets/intro_videos/desert-vid.mp4'),
  'Jungle': require('../assets/intro_videos/jungless.mp4'), // Note: filename has typo but keeping as is
  'Arctic': require('../assets/intro_videos/arctic-vid.mp4'),
  'Savannah': require('../assets/intro_videos/savan-vid.mp4'),
  'Birds': require('../assets/intro_videos/birds-vid.mp4'),
  'Insects': require('../assets/intro_videos/insects-vid.mp4'),
};

export const getLevelVideo = (levelName: string): any => {
  return LEVEL_VIDEO_MAP[levelName] || null;
};
