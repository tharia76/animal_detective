// Persistent Image Registry - Pre-rendered components that never reload
import React from 'react';
import { Image, ImageStyle, ViewStyle } from 'react-native';

class PersistentImageRegistry {
  private static instance: PersistentImageRegistry;
  private imageComponents: Map<string, React.ReactElement> = new Map();
  
  static getInstance(): PersistentImageRegistry {
    if (!PersistentImageRegistry.instance) {
      PersistentImageRegistry.instance = new PersistentImageRegistry();
    }
    return PersistentImageRegistry.instance;
  }

  // Pre-create and cache Image components
  createPersistentImage(
    source: any, 
    key: string, 
    baseStyle: ImageStyle | ViewStyle,
    resizeMode: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center' = 'cover'
  ): React.ReactElement {
    if (this.imageComponents.has(key)) {
      const existingImage = this.imageComponents.get(key)!;
      // Clone with new style to allow dynamic sizing
      return React.cloneElement(existingImage, { style: baseStyle });
    }

    // Create the image component once
    const imageComponent = (
      <Image
        source={source}
        style={baseStyle}
        resizeMode={resizeMode}
        fadeDuration={0}
        key={key}
      />
    );

    this.imageComponents.set(key, imageComponent);
    return imageComponent;
  }

  // Get cached image component
  getPersistentImage(
    key: string, 
    style?: ImageStyle | ViewStyle
  ): React.ReactElement | null {
    const cached = this.imageComponents.get(key);
    if (cached && style) {
      // Return with updated style
      return React.cloneElement(cached, { style });
    }
    return cached || null;
  }

  // Pre-create all level background images
  preCreateLevelImages(levelBackgrounds: Record<string, any>): void {
    Object.entries(levelBackgrounds).forEach(([level, source]) => {
      const key = `level_bg_${level}`;
      if (!this.imageComponents.has(key)) {
        // Create base component with placeholder style
        this.createPersistentImage(
          source,
          key,
          { width: 100, height: 100 }, // Placeholder, will be overridden
          'cover'
        );
      }
    });
  }

  // Check if image is pre-created
  hasImage(key: string): boolean {
    return this.imageComponents.has(key);
  }

  // Get cache size for debugging
  getCacheSize(): number {
    return this.imageComponents.size;
  }

  // Clear cache if needed
  clearCache(): void {
    this.imageComponents.clear();
  }
}

export const ImageRegistry = PersistentImageRegistry.getInstance();