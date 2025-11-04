import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Text, Animated } from 'react-native';
import { Asset } from 'expo-asset';
import { LinearGradient } from 'expo-linear-gradient';

interface LoadingWrapperProps {
  children: React.ReactNode;
  assetsToLoad?: any[]; // Array of require() assets
  onAssetsLoaded?: () => void;
  loadingText?: string;
  backgroundColor?: string;
  minLoadingTime?: number; // Minimum time to show loading screen
}

export default function ScreenLoadingWrapper({
  children,
  assetsToLoad = [],
  onAssetsLoaded,
  loadingText = 'Loading...',
  backgroundColor = '#FFDAB9',
  minLoadingTime = 200 // Fast loading for better UX
}: LoadingWrapperProps) {
  // Start with loading enabled - show loading screen immediately
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isInteractive, setIsInteractive] = useState(true); // Track if overlay should block touches
  const [fadeAnim] = useState(() => new Animated.Value(1));

  useEffect(() => {
    let isMounted = true;
    
    const loadAssets = async () => {
      const startTime = Date.now();
      let needsDownload = false;
      
      try {
        if (assetsToLoad.length > 0) {
          // Filter out any undefined or null assets
          const validAssets = assetsToLoad.filter(asset => asset !== undefined && asset !== null);
          
          if (validAssets.length > 0) {
            // Check if any assets need downloading
            for (const asset of validAssets) {
              try {
                const assetObj = Asset.fromModule(asset);
                if (!assetObj.downloaded) {
                  needsDownload = true;
                  break;
                }
              } catch {
                needsDownload = true;
                break;
              }
            }
            
            // Load all assets in parallel
            const assetPromises = validAssets.map(async (asset, index) => {
              try {
                const assetObj = Asset.fromModule(asset);
                // Only download if not already cached
                if (!assetObj.downloaded) {
                  await assetObj.downloadAsync();
                }
                
                // Update progress only if component is still mounted
                if (isMounted) {
                  setLoadingProgress((index + 1) / validAssets.length);
                }
                
                return assetObj;
              } catch (error) {
                console.warn('Failed to load asset:', error);
                // Continue loading other assets even if one fails
                if (isMounted) {
                  setLoadingProgress((index + 1) / validAssets.length);
                }
                return null;
              }
            });
            
            await Promise.all(assetPromises);
          }
        }
        
        // Only wait minimum time if assets needed downloading
        const elapsedTime = Date.now() - startTime;
        let waitTime = 0;
        
        if (needsDownload) {
          // Assets were downloading - ensure minimum time
          waitTime = Math.max(0, minLoadingTime - elapsedTime);
        } else {
          // All cached - minimal delay for smooth transition
          waitTime = Math.max(0, 100 - elapsedTime);
        }
        
        if (waitTime > 0) {
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
        
        // Only proceed if component is still mounted
        if (!isMounted) return;
        
        // Call onAssetsLoaded
        onAssetsLoaded?.();
        
        // Wait for children to render
        await new Promise(resolve => requestAnimationFrame(resolve));
        await new Promise(resolve => requestAnimationFrame(resolve));
        
        // Only proceed if still mounted
        if (!isMounted) return;
        
        // Make overlay non-interactive so clicks pass through
        setIsInteractive(false);
        
        // Fade out the loading screen
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }).start(() => {
          // Hide loading screen after fade completes
          if (isMounted) {
            setIsLoading(false);
          }
        });
        
      } catch (error) {
        console.error('Error loading assets:', error);
        // Still hide loading screen on error, only if mounted
        if (isMounted) {
          setIsInteractive(false);
          setIsLoading(false);
          onAssetsLoaded?.();
        }
      }
    };

    loadAssets();
    
    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isMounted = false;
    };
  }, [assetsToLoad, onAssetsLoaded, minLoadingTime]);

  return (
    <>
      {/* Always render children - they'll be behind the loading overlay */}
      {children}
      
      {/* Show loading overlay on top while loading */}
      {isLoading && (
        <Animated.View 
          style={[
            styles.container, 
            { 
              opacity: fadeAnim,
              pointerEvents: isInteractive ? 'auto' : 'none' 
            }
          ]}
          pointerEvents={isInteractive ? 'auto' : 'none'}>
          <LinearGradient
            colors={[backgroundColor, backgroundColor]}
            style={StyleSheet.absoluteFillObject}
          />
          
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color="#FF8C00" />
            
            <Text style={styles.loadingText}>{loadingText}</Text>
            
            {assetsToLoad.length > 0 && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${Math.round(loadingProgress * 100)}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>
                  {Math.round(loadingProgress * 100)}%
                </Text>
              </View>
            )}
          </View>
        </Animated.View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  loadingContent: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  progressContainer: {
    marginTop: 15,
    width: 150,
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF8C00',
    borderRadius: 4,
  },
  progressText: {
    marginTop: 5,
    fontSize: 14,
    color: '#666',
  },
});
