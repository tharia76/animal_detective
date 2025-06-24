import { View, Text, Animated, Image, ImageSourcePropType, useWindowDimensions } from 'react-native';
import { useDynamicStyles } from '../styles/styles';
import React from 'react';

// Device detection and responsive scaling functions
const isTablet = () => {
  const { width, height } = require('react-native').Dimensions.get('window');
  const aspectRatio = height / width;
  return aspectRatio <= 1.6;
};

const getScaleFactor = (width: number, height: number): number => {
  const baseWidth = 375;
  const baseHeight = 667;
  
  if (isTablet()) {
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

  return (
    <View style={[dynamicStyles.instructionBubble, { zIndex: 100 }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ 
          fontSize: getResponsiveFontSize(18, scaleFactor), 
          color: '#333', 
          textAlign: 'center', 
          marginBottom: getResponsiveSpacing(18, scaleFactor), 
          marginTop: getResponsiveSpacing(10, scaleFactor), 
          fontWeight: 'bold' 
        }}>
          {text}
        </Text>
        {/* Conditionally render the Animated.View only if there's an image */}
        {image && (
          <Animated.View
            style={{
              marginLeft: getResponsiveSpacing(5, scaleFactor), // Keep margin
              // The transform uses the continuously looping arrowAnim value from the parent
              transform: [{ translateY: arrowAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 5] }) }],
            }}
          >
            <Image
              source={image}
              style={{ 
                width: getResponsiveSpacing(40, scaleFactor), 
                height: getResponsiveSpacing(40, scaleFactor) 
              }} // Define image size here
              resizeMode="contain"
            />
          </Animated.View>
        )}
      </View>
    </View>
  );
}
