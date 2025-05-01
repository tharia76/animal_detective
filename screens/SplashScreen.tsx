// SplashScreen.tsx
import React from 'react';
import { View, Text, ActivityIndicator, Animated } from 'react-native';
import { useDynamicStyles } from '../app/styles/styles';

type Props = {
  titleAnim: Animated.Value;
};

export default function SplashScreen({ titleAnim }: Props) {
  // 1️⃣ Hoist your hook: only call it once, at the top level
  const dynamicStyles = useDynamicStyles();

  return (
    <View style={dynamicStyles.loadingContainer}>
      <Animated.View style={{ opacity: titleAnim, marginBottom: 50, alignItems: 'center' }}>
        <Animated.Image
          source={require('../assets/images/game-logo.png')}
          style={{
            width: 450,
            height: 450,
            resizeMode: 'contain',
            transform: [{
              translateY: titleAnim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [20, -10, 0]
              })
            }]
          }}
        />
        <Animated.Text
          style={[
            {
              fontSize: 50,
              fontFamily: 'TitleFont',
              color: 'black',
              textAlign: 'center',
              transform: [{
                translateY: titleAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [20, -10, 0]
                })
              }]
            }
          ]}
        >
        </Animated.Text>
      </Animated.View>
      <ActivityIndicator size="large" color="orange" />
    </View>
  );
}
