import { AnimalType } from '../data/AnimalType';

/**
 * Collects all assets that need to be preloaded for a level
 */
export function getLevelAssets(
  levelName: string,
  animals: AnimalType[]
): Array<any> {
  const assets: Array<any> = [];

  // Static background image
  const staticBgMap: Record<string, any> = {
    farm: require('../assets/images/level-backgrounds/farm.webp'),
    forest: require('../assets/images/level-backgrounds/forest.webp'),
    ocean: require('../assets/images/level-backgrounds/ocean.webp'),
    desert: require('../assets/images/level-backgrounds/desert.webp'),
    arctic: require('../assets/images/level-backgrounds/arctic.webp'),
    insects: require('../assets/images/level-backgrounds/insect.webp'),
    savannah: require('../assets/images/level-backgrounds/savannah.webp'),
    jungle: require('../assets/images/level-backgrounds/jungle.webp'),
    birds: require('../assets/images/level-backgrounds/birds.webp'),
  };

  const levelKey = levelName.toLowerCase();
  if (staticBgMap[levelKey]) {
    assets.push(staticBgMap[levelKey]);
  }

  // Moving background image (same as static for most levels)
  const movingBgMap: Record<string, any> = {
    farm: require('../assets/images/level-backgrounds/farm.webp'),
    forest: require('../assets/images/level-backgrounds/forest.webp'),
    ocean: require('../assets/images/level-backgrounds/ocean.webp'),
    desert: require('../assets/images/level-backgrounds/desert.webp'),
    arctic: require('../assets/images/level-backgrounds/arctic.webp'),
    insects: require('../assets/images/level-backgrounds/insect.webp'),
    savannah: require('../assets/images/level-backgrounds/savannah.webp'),
    jungle: require('../assets/images/level-backgrounds/jungle.webp'),
    birds: require('../assets/images/level-backgrounds/birds.webp'),
  };

  if (movingBgMap[levelKey]) {
    assets.push(movingBgMap[levelKey]);
  }

  // All animal sprites for this level
  animals.forEach(animal => {
    if (animal.source) {
      assets.push(animal.source);
    }
  });

  // Level-specific animation assets
  if (levelKey === 'forest') {
    // Falling leaves
    assets.push(
      require('../assets/images/level-backgrounds/leaves/leaf1.png'),
      require('../assets/images/level-backgrounds/leaves/leaf2.png'),
      require('../assets/images/level-backgrounds/leaves/leaf3.png')
    );
  } else if (levelKey === 'birds') {
    // Falling feathers
    assets.push(
      require('../assets/images/level-backgrounds/feathers/1.png'),
      require('../assets/images/level-backgrounds/feathers/2.png'),
      require('../assets/images/level-backgrounds/feathers/3.png')
    );
  } else if (levelKey === 'insects') {
    // Falling flowers
    assets.push(
      require('../assets/images/level-backgrounds/flowers/1.png'),
      require('../assets/images/level-backgrounds/flowers/2.png'),
      require('../assets/images/level-backgrounds/flowers/3.png')
    );
  }

  // Common UI assets used in all levels
  assets.push(
    require('../assets/images/hand.png'),
    require('../assets/images/home_icon.png'),
    require('../assets/images/list_icon.png'),
    require('../assets/images/discovered_number.png'),
    require('../assets/images/congrats.png')
  );

  // Sound effects (preload for instant playback)
  assets.push(
    require('../assets/sounds/other/yay.mp3'),
    require('../assets/sounds/other/animal_click.mp3'),
    require('../assets/sounds/other/button.mp3')
  );

  // Note: Background music is handled by BackgroundMusicManager and doesn't need preloading here

  return assets;
}

