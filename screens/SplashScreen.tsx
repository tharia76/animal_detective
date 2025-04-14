// SplashScreen.tsx
import React from 'react';
import { View, Text, ActivityIndicator, Animated } from 'react-native';
import { styles } from '../app/styles/styles';

type Props = {
  titleAnim: Animated.Value;
};

export default function SplashScreen({ titleAnim }: Props) {
  return (
    <View style={styles.loadingContainer}>
      <Animated.View style={{ opacity: titleAnim, marginBottom: 50, alignItems: 'center' }}>
       
          <Animated.Image
            source={require('../assets/images/catlogo.png')}
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
              styles.loadingText,
              {
                fontSize: 50,
                fontFamily: 'TitleFont',
                transform: [{
                  translateY: titleAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [20, -10, 0]
                  })
                }]
              }
            ]}
          >
            Loading...
          </Animated.Text>
      </Animated.View>
      <ActivityIndicator size="large" color="orange" />
    </View>
  );
}
