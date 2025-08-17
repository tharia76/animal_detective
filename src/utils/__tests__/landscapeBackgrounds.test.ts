// Test file for landscape background positioning system
// This demonstrates how the new system works

import { getLandscapeBackgroundStyles, getLandscapeDeviceType } from '../landscapeBackgrounds';

// Mock Dimensions for testing
jest.mock('react-native', () => ({
  Dimensions: {
    get: jest.fn(() => ({ width: 1024, height: 768 })) // Mock landscape tablet
  }
}));

describe('Landscape Background Positioning', () => {
  describe('Device Type Detection', () => {
    it('should correctly identify tablet in landscape mode', () => {
      const device = getLandscapeDeviceType();
      expect(device.isTablet).toBe(true);
      expect(device.isPhone).toBe(false);
      expect(device.width).toBe(1024); // Landscape width
      expect(device.height).toBe(768);  // Landscape height
    });
  });

  describe('Background Styles', () => {
    it('should return correct styles for forest level on tablet', () => {
      const styles = getLandscapeBackgroundStyles('forest', false); // Static background
      
      expect(styles.position).toBe('absolute');
      expect(styles.left).toBe(0);
      expect(styles.right).toBe(0);
      expect(styles.bottom).toBe(0);
      expect(styles.top).toBeLessThan(0); // Should be negative (pushed up)
      expect(styles.height).toBeGreaterThan(768); // Should be extended
    });

    it('should return correct styles for arctic level on phone', () => {
      // Mock phone dimensions
      jest.mocked(require('react-native').Dimensions.get).mockReturnValueOnce({
        width: 667, height: 375
      });
      
      const styles = getLandscapeBackgroundStyles('arctic', true); // Moving background
      
      expect(styles.position).toBe('absolute');
      expect(styles.top).toBeLessThan(0); // Should be negative
      expect(styles.height).toBeGreaterThan(375); // Should be extended
    });
  });

  describe('Level Presets', () => {
    it('should handle all level types', () => {
      const levels = ['forest', 'arctic', 'savannah', 'jungle', 'birds', 'farm', 'ocean', 'desert', 'insects'];
      
      levels.forEach(level => {
        const staticStyles = getLandscapeBackgroundStyles(level, false);
        const movingStyles = getLandscapeBackgroundStyles(level, true);
        
        expect(staticStyles.position).toBe('absolute');
        expect(movingStyles.position).toBe('absolute');
        expect(staticStyles.height).toBeGreaterThan(0);
        expect(movingStyles.height).toBeGreaterThan(0);
      });
    });
  });
});

// Example usage in components:
/*
import { getLandscapeBackgroundStyles } from '../utils/landscapeBackgrounds';

// In your component:
const backgroundStyles = getLandscapeBackgroundStyles('forest', isMoving);

// Use in your JSX:
<View style={[StyleSheet.absoluteFillObject, backgroundStyles]}>
  <ImageBackground source={backgroundImage} style={backgroundStyles} />
</View>
*/
