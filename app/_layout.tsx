import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as ScreenOrientation from 'expo-screen-orientation';
import React, { useEffect, useState, Component, ErrorInfo, ReactNode } from 'react';
import 'react-native-reanimated';
import { useColorScheme } from '../src/hooks/useColorScheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { useWindowDimensions, View, StyleSheet, Text, ActivityIndicator } from 'react-native';
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

// Error Boundary Component
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('❌ ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFDAB9', padding: 20 }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333' }}>
            Oops! Something went wrong
          </Text>
          <Text style={{ fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 20 }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </Text>
          <Text style={{ fontSize: 14, color: '#999', textAlign: 'center' }}>
            Please restart the app
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded, fontError] = useFonts({
    LuckiestGuy_400Regular,
    SUSE_400Regular,
    SUSE_700Bold,
  });
  const [fontLoadTimeout, setFontLoadTimeout] = useState(false);

  // Timeout for font loading - if fonts don't load within 5 seconds, proceed anyway
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!loaded && !fontError) {
        console.warn('⚠️ Font loading timeout - proceeding without fonts');
        setFontLoadTimeout(true);
        SplashScreen.hideAsync();
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, [loaded, fontError]);

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
    if (loaded || fontLoadTimeout) {
      SplashScreen.hideAsync();
    }
  }, [loaded, fontLoadTimeout]);

  // Log font loading errors
  useEffect(() => {
    if (fontError) {
      console.error('❌ Font loading error:', fontError);
      // Proceed even if fonts fail to load
      setFontLoadTimeout(true);
      SplashScreen.hideAsync();
    }
  }, [fontError]);

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

  // Show loading screen while fonts load (but with timeout fallback)
  // Proceed if fonts loaded, if there was an error (proceed without fonts), or if timeout occurred
  if (!loaded && !fontError && !fontLoadTimeout) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFDAB9' }}>
        <ActivityIndicator size="large" color="#FF8C00" />
      </View>
    );
  }

  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D2B48C',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
