import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as ScreenOrientation from 'expo-screen-orientation';
import React, { useEffect } from 'react';
import 'react-native-reanimated';
import { useColorScheme } from '../src/hooks/useColorScheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { useWindowDimensions, View, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import { LuckiestGuy_400Regular } from '@expo-google-fonts/luckiest-guy';
import { SUSE_400Regular, SUSE_700Bold } from '@expo-google-fonts/suse';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    LuckiestGuy_400Regular,
    SUSE_400Regular,
    SUSE_700Bold,
  });

  // Listen to orientation changes using useWindowDimensions
  // This will cause a re-render on orientation change, making sure children get new dimensions
  const window = useWindowDimensions();
  
  // Smooth orientation transition animation
  const orientationProgress = useSharedValue(0);
  
  useEffect(() => {
    // Trigger smooth transition animation on dimension change
    orientationProgress.value = withSpring(1, {
      damping: 25,
      stiffness: 400,
      mass: 0.8,
    }, () => {
      orientationProgress.value = 0;
    });
  }, [window.width, window.height]);

  // Animated style for smooth orientation transitions
  const animatedContainerStyle = useAnimatedStyle(() => {
    const progress = orientationProgress.value;
    
    return {
      transform: [
        {
          scale: interpolate(
            progress,
            [0, 0.5, 1],
            [1, 0.98, 1],
            Extrapolate.CLAMP
          )
        }
      ],
      opacity: interpolate(
        progress,
        [0, 0.1, 0.9, 1],
        [1, 0.95, 0.95, 1],
        Extrapolate.CLAMP
      ),
    };
  }, []);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Simple landscape lock for all devices
  useEffect(() => {
    const lockOrientation = async () => {
      try {
        console.log('Locking orientation to landscape');
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        console.log('Orientation locked to landscape');
      } catch (error) {
        console.warn('Failed to lock orientation:', error);
      }
    };

    lockOrientation();

    // Cleanup function
    return () => {
      ScreenOrientation.unlockAsync().catch((error) => {
        console.warn('Failed to unlock orientation:', error);
      });
    };
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Animated.View style={[
        styles.container, 
        { 
          width: window.width, 
          height: window.height,
          backgroundColor: '#D2B48C' // Stable background color
        },
        animatedContainerStyle
      ]}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </GestureHandlerRootView>
      </Animated.View>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D2B48C',
  },
});
