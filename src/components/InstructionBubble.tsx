import { View, Text, Animated, Image, ImageSourcePropType, useWindowDimensions } from 'react-native';
import { useDynamicStyles } from '../styles/styles';
import React, { useEffect, useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';

// Device detection and responsive scaling functions
const isTablet = (width: number, height: number) => {
  const aspectRatio = height / width;
  return aspectRatio <= 1.6;
};

const getScaleFactor = (width: number, height: number): number => {
  const baseWidth = 375;
  const baseHeight = 667;
  
  if (isTablet(width, height)) {
    const tabletBaseWidth = 768;
    const tabletBaseHeight = 1024;
    const widthScale = width / tabletBaseWidth;
    const heightScale = height / tabletBaseHeight;
    return Math.min(widthScale, heightScale, 1.5);
  } else {
    const widthScale = width / baseWidth;
    const heightScale = height / baseHeight;
    return Math.min(widthScale, heightScale);
  }
};

const getResponsiveSpacing = (baseSpacing: number, scaleFactor: number): number => {
  return Math.round(baseSpacing * scaleFactor);
};

const getResponsiveFontSize = (baseSize: number, scaleFactor: number): number => {
  const scaledSize = baseSize * scaleFactor;
  return Math.max(Math.min(scaledSize, baseSize * 1.5), baseSize * 0.7);
};

export default function InstructionBubble({
  text,
  arrowAnim,
  image
}: {
  text: string,
  arrowAnim: Animated.Value, // This value is already animated in a loop by the parent
  image?: ImageSourcePropType
}) {
  // 1️⃣ Hoist your hook: only call it once, at the top level
  const dynamicStyles = useDynamicStyles();
  const { width, height } = useWindowDimensions();
  const scaleFactor = getScaleFactor(width, height);
  const isLandscape = width > height;

  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  // Orange gradient colors
  const gradientColors = ['#FF8C00', '#FFA500', '#FFE4B5'] as const; // Dark orange to orange to moccasin

  // Set up animations
  useEffect(() => {
    // Gentle pulsing animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );

    // Floating animation
    const floatAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    pulseAnimation.start();
    floatAnimation.start();

    return () => {
      pulseAnimation.stop();
      floatAnimation.stop();
    };
  }, [pulseAnim, floatAnim]);

  // Animated styles
  const animatedContainerStyle = {
    transform: [
      { scale: pulseAnim },
      {
        translateY: floatAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -8], // Float up and down by 8 pixels
        }),
      },
    ],
  };

  return (
    <Animated.View 
      style={[
        dynamicStyles.instructionBubble, 
        { zIndex: 100 },
        animatedContainerStyle,
      ]}
    >
      <LinearGradient
        colors={gradientColors}
        style={[
          dynamicStyles.instructionBubbleGradient,
          {
            paddingVertical: getResponsiveSpacing(12, scaleFactor),
            paddingHorizontal: getResponsiveSpacing(18, scaleFactor),
          }
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          {/* Text centered independently */}
          <Text style={{ 
            fontSize: getResponsiveFontSize(isLandscape ? 22 : 18, scaleFactor), // Bigger text - increased from 18/14 to 22/18
            color: '#FFFFFF', // White text for better contrast on orange
            textAlign: 'center', 
            marginBottom: getResponsiveSpacing(isLandscape ? 18 : 12, scaleFactor), 
            marginTop: getResponsiveSpacing(isLandscape ? 10 : 8, scaleFactor), 
            fontWeight: 'bold',
            textShadowColor: 'rgba(0, 0, 0, 0.5)', // Dark shadow for better readability on orange
            textShadowOffset: { width: 1, height: 1 },
            textShadowRadius: 2,
          }}>
            {text}
          </Text>
          
          {/* Image positioned absolutely so it doesn't affect text layout */}
          {image && (
            <Animated.View
                              style={{
                  position: 'absolute',
                  right: getResponsiveSpacing(350, scaleFactor), // Position from right edge - decreased to move image further right
                  // The transform uses the continuously looping arrowAnim value from the parent
                  transform: [{ translateY: arrowAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 5] }) }],
                }}
            >
              <Image
                source={image}
                style={{ 
                  width: Math.max(getResponsiveSpacing(60, scaleFactor), isTablet(width, height) ? 65 : 65), // Ensure minimum size on phones
                  height: Math.max(getResponsiveSpacing(60, scaleFactor), isTablet(width, height) ? 65 : 65), // Ensure minimum size on phones
                }} // Define image size here
                resizeMode="contain"
              />
            </Animated.View>
          )}
        </View>
      </LinearGradient>
    </Animated.View>
  );
}
