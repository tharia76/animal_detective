import React, { useMemo, useState, useEffect } from 'react';
import { 
  ImageBackground, 
  View, 
  StyleSheet, 
  Dimensions,
  Platform,
  StatusBar 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  getDeviceInfo, 
  getResponsiveBackgroundStyles, 
  getResponsiveLevelBackgroundColor,
  DeviceInfo 
} from '../utils/responsiveBackgroundSystem';

interface ResponsiveLevelBackgroundProps {
  levelName: string;
  backgroundSource: any;
  isMoving?: boolean;
  children?: React.ReactNode;
  style?: any;
  fallbackColor?: string;
  onLayout?: (event: any) => void;
  onLoad?: () => void;
  onError?: (error?: any) => void;
}

const ResponsiveLevelBackground: React.FC<ResponsiveLevelBackgroundProps> = ({
  levelName,
  backgroundSource,
  isMoving = false,
  children,
  style,
  fallbackColor,
  onLayout,
  onLoad,
  onError
}) => {
  const safeAreaInsets = useSafeAreaInsets();
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);

  // Listen for orientation changes
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });

    return () => subscription?.remove();
  }, []);

  // Calculate device info and styles
  const deviceInfo: DeviceInfo = useMemo(() => {
    return getDeviceInfo(safeAreaInsets);
  }, [safeAreaInsets, dimensions]);

  const backgroundStyles = useMemo(() => {
    return getResponsiveBackgroundStyles(levelName, deviceInfo, isMoving);
  }, [levelName, deviceInfo, isMoving]);

  const backgroundColor = useMemo(() => {
    return fallbackColor || getResponsiveLevelBackgroundColor(levelName);
  }, [levelName, fallbackColor]);

  // Handle image loading
  const handleImageLoad = () => {
    setIsImageLoaded(true);
    setImageLoadError(false);
    onLoad?.();
  };

  const handleImageError = (error: any) => {
    console.warn(`Failed to load background for ${levelName}:`, error);
    setImageLoadError(true);
    setIsImageLoaded(false);
    onError?.(error);
  };

  // Enhanced container style with proper safe area handling
  const containerStyle = useMemo(() => {
    const baseStyle = {
      ...StyleSheet.absoluteFillObject,
      backgroundColor,
    };

    // Handle status bar on Android
    if (Platform.OS === 'android') {
      const statusBarHeight = StatusBar.currentHeight || 0;
      if (!deviceInfo.isLandscape && statusBarHeight > 0) {
        baseStyle.paddingTop = statusBarHeight;
      }
    }

    return [baseStyle, style];
  }, [backgroundColor, style, deviceInfo.isLandscape]);



  return (
    <View style={containerStyle} onLayout={onLayout}>
      {/* Background Image with responsive positioning */}
      <ImageBackground
        source={backgroundSource}
        style={[
          {
            position: backgroundStyles.position,
            top: backgroundStyles.top,
            left: backgroundStyles.left,
            right: backgroundStyles.right,
            height: backgroundStyles.height,
            width: backgroundStyles.width,
          },
          backgroundStyles.transform && { transform: backgroundStyles.transform }
        ]}
        resizeMode={backgroundStyles.resizeMode}
        onLoad={handleImageLoad}
        onError={handleImageError}
        blurRadius={0}
      >
        {/* Fallback color overlay when image is loading or fails to load */}
        {!isImageLoaded && (
          <View 
            style={[
              StyleSheet.absoluteFillObject,
              { backgroundColor }
            ]} 
          />
        )}
      </ImageBackground>

      {/* Content overlay */}
      {children && (
        <View style={styles.contentContainer}>
          {children}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    position: 'relative',
    zIndex: 1,
  },
});

export default ResponsiveLevelBackground;

// Higher-order component for easy integration
export const withResponsiveBackground = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  levelName: string,
  backgroundSource: any,
  isMoving: boolean = false
) => {
  return React.forwardRef<any, P>((props, ref) => (
    <ResponsiveLevelBackground
      levelName={levelName}
      backgroundSource={backgroundSource}
      isMoving={isMoving}
    >
      <WrappedComponent {...props} ref={ref} />
    </ResponsiveLevelBackground>
  ));
};