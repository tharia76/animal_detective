import AsyncStorage from '@react-native-async-storage/async-storage';

const ALL_LEVELS = [
  'farm', 'forest', 'jungle', 'desert', 'ocean', 
  'savannah', 'arctic', 'birds', 'insects'
];

export const setAllLevelsComplete = async () => {
  try {
    // Set all animals in each level as visited
    for (const level of ALL_LEVELS) {
      const progressKey = `animalProgress_${level}`;
      const allAnimalsVisited = Array.from({ length: 20 }, (_, i) => i); // Assume 20 animals per level
      await AsyncStorage.setItem(progressKey, JSON.stringify(allAnimalsVisited));
      
      // Set current index to last animal
      const indexKey = `animalCurrentIndex_${level}`;
      await AsyncStorage.setItem(indexKey, '19');
    }
    
    console.log('✅ All levels set to complete for debugging');
  } catch (error) {
    console.error('❌ Error setting levels to complete:', error);
  }
};

export const checkAllLevelsComplete = async (): Promise<boolean> => {
  try {
    for (const level of ALL_LEVELS) {
      const progressKey = `animalProgress_${level}`;
      const saved = await AsyncStorage.getItem(progressKey);
      if (!saved) return false;
      
      const visited = JSON.parse(saved);
      if (!Array.isArray(visited) || visited.length === 0) return false;
    }
    return true;
  } catch (error) {
    console.error('❌ Error checking levels completion:', error);
    return false;
  }
};

export const resetAllLevels = async () => {
  try {
    for (const level of ALL_LEVELS) {
      const progressKey = `animalProgress_${level}`;
      const indexKey = `animalCurrentIndex_${level}`;
      await AsyncStorage.removeItem(progressKey);
      await AsyncStorage.removeItem(indexKey);
    }
    console.log('🔄 All levels reset');
  } catch (error) {
    console.error('❌ Error resetting levels:', error);
  }
};

