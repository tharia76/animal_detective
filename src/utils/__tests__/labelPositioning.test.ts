import { getLabelPositioning, shouldRenderLabel, getLandscapeDeviceType } from '../labelPositioning';

// Mock react-native Dimensions
jest.mock('react-native', () => ({
  Dimensions: {
    get: jest.fn()
  }
}));

describe('Label Positioning Utility', () => {
  describe('getLandscapeDeviceType', () => {
    it('should detect tablet correctly', () => {
      // Mock Dimensions.get('window') to return tablet dimensions
      const mockDimensions = { width: 1024, height: 768 };
      require('react-native').Dimensions.get.mockReturnValue(mockDimensions);

      const deviceType = getLandscapeDeviceType();
      expect(deviceType.isTablet).toBe(true);
      expect(deviceType.isPhone).toBe(false);
      expect(deviceType.minDimension).toBe(768);
      expect(deviceType.maxDimension).toBe(1024);
    });

    it('should detect phone correctly', () => {
      // Mock Dimensions.get('window') to return phone dimensions
      const mockDimensions = { width: 800, height: 600 };
      require('react-native').Dimensions.get.mockReturnValue(mockDimensions);

      const deviceType = getLandscapeDeviceType();
      expect(deviceType.isTablet).toBe(false);
      expect(deviceType.isPhone).toBe(true);
      expect(deviceType.minDimension).toBe(600);
      expect(deviceType.maxDimension).toBe(800);
    });
  });

  describe('getLabelPositioning', () => {
    const mockScreenW = 800;
    const mockScreenH = 600;

    it('should return default positioning when not in landscape mode', () => {
      const result = getLabelPositioning('ocean', mockScreenW, mockScreenH, false);
      
      expect(result.top).toBe(0);
      expect(result.fontSize).toBe(18);
      expect(result.paddingVertical).toBe(8);
      expect(result.paddingHorizontal).toBe(16);
      expect(result.borderRadius).toBe(16);
    });

    it('should return correct positioning for tablet in landscape mode', () => {
      // Mock Dimensions to return tablet dimensions
      require('react-native').Dimensions.get.mockReturnValue({ width: 1024, height: 768 });
      
      const result = getLabelPositioning('ocean', mockScreenW, mockScreenH, true);
      
      expect(result.top).toBe(mockScreenH * 0.01);
      expect(result.fontSize).toBe(18);
      expect(result.paddingVertical).toBe(8);
      expect(result.paddingHorizontal).toBe(16);
      expect(result.borderRadius).toBe(16);
    });

    it('should return correct positioning for phone in landscape mode', () => {
      // Mock Dimensions to return phone dimensions
      require('react-native').Dimensions.get.mockReturnValue({ width: 800, height: 600 });
      
      const result = getLabelPositioning('forest', mockScreenW, mockScreenH, true);
      
      expect(result.top).toBe(mockScreenH * 0.01);
      expect(result.fontSize).toBe(18);
      expect(result.paddingVertical).toBe(8);
      expect(result.paddingHorizontal).toBe(16);
      expect(result.borderRadius).toBe(16);
    });

    it('should return same positioning for all levels in landscape mode', () => {
      // Mock Dimensions to return phone dimensions
      require('react-native').Dimensions.get.mockReturnValue({ width: 800, height: 600 });
      
      const levels = ['ocean', 'forest', 'desert', 'jungle', 'savannah', 'farm', 'birds', 'insects', 'arctic'];
      
      levels.forEach(level => {
        const result = getLabelPositioning(level, mockScreenW, mockScreenH, true);
        expect(result.top).toBe(mockScreenH * 0.01);
        expect(result.fontSize).toBe(18);
        expect(result.paddingVertical).toBe(8);
        expect(result.paddingHorizontal).toBe(16);
        expect(result.borderRadius).toBe(16);
      });
    });
  });

  describe('shouldRenderLabel', () => {
    it('should return true when all conditions are met', () => {
      const result = shouldRenderLabel(true, { name: 'test' }, false, true);
      expect(result).toBe(true);
    });

    it('should return false when showName is false', () => {
      const result = shouldRenderLabel(false, { name: 'test' }, false, true);
      expect(result).toBe(false);
    });

    it('should return false when currentAnimal is null', () => {
      const result = shouldRenderLabel(true, null, false, true);
      expect(result).toBe(false);
    });

    it('should return false when isTransitioning is true', () => {
      const result = shouldRenderLabel(true, { name: 'test' }, true, true);
      expect(result).toBe(false);
    });

    it('should return false when canRenderLabel is false', () => {
      const result = shouldRenderLabel(true, { name: 'test' }, false, false);
      expect(result).toBe(false);
    });
  });
});
