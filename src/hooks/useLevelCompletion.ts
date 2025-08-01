import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const COMPLETED_LEVELS_KEY = 'completed_levels';

export interface LevelCompletionHook {
  completedLevels: Set<string>;
  markLevelCompleted: (levelName: string) => Promise<void>;
  unmarkLevelCompleted: (levelName: string) => Promise<void>;
  isLevelCompleted: (levelName: string) => boolean;
  clearAllCompletions: () => Promise<void>;
}

export const useLevelCompletion = (): LevelCompletionHook => {
  const [completedLevels, setCompletedLevels] = useState<Set<string>>(new Set());

  // Load completed levels from AsyncStorage on mount
  useEffect(() => {
    const loadCompletedLevels = async () => {
      try {
        const stored = await AsyncStorage.getItem(COMPLETED_LEVELS_KEY);
        if (stored) {
          const levelArray = JSON.parse(stored) as string[];
          setCompletedLevels(new Set(levelArray));
        }
      } catch (error) {
        console.warn('Error loading completed levels:', error);
      }
    };
    
    loadCompletedLevels();
  }, []);

  // Save completed levels to AsyncStorage
  const saveCompletedLevels = useCallback(async (levels: Set<string>) => {
    try {
      await AsyncStorage.setItem(COMPLETED_LEVELS_KEY, JSON.stringify(Array.from(levels)));
    } catch (error) {
      console.warn('Error saving completed levels:', error);
    }
  }, []);

  // Mark a level as completed
  const markLevelCompleted = useCallback(async (levelName: string) => {
    const newCompleted = new Set(completedLevels);
    newCompleted.add(levelName.toLowerCase());
    setCompletedLevels(newCompleted);
    await saveCompletedLevels(newCompleted);
  }, [completedLevels, saveCompletedLevels]);

  // Unmark a level as completed (for reset functionality)
  const unmarkLevelCompleted = useCallback(async (levelName: string) => {
    const newCompleted = new Set(completedLevels);
    newCompleted.delete(levelName.toLowerCase());
    setCompletedLevels(newCompleted);
    await saveCompletedLevels(newCompleted);
  }, [completedLevels, saveCompletedLevels]);

  // Check if a level is completed
  const isLevelCompleted = useCallback((levelName: string) => {
    return completedLevels.has(levelName.toLowerCase());
  }, [completedLevels]);

  // Clear all completion status (for debugging/testing)
  const clearAllCompletions = useCallback(async () => {
    setCompletedLevels(new Set());
    try {
      await AsyncStorage.removeItem(COMPLETED_LEVELS_KEY);
    } catch (error) {
      console.warn('Error clearing completed levels:', error);
    }
  }, []);

  return {
    completedLevels,
    markLevelCompleted,
    unmarkLevelCompleted,
    isLevelCompleted,
    clearAllCompletions,
  };
}; 