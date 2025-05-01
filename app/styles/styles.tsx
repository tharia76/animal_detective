import { useWindowDimensions, StyleSheet } from 'react-native';
import { useMemo } from 'react';

export function useDynamicStyles() {
  const { width: screenW, height: screenH } = useWindowDimensions();
  const isPortrait = screenH >= screenW;

  return useMemo(() => {
    if (isPortrait) {
      // Portrait styles
      return StyleSheet.create({
        container: {
          flex: 1,
          position: 'relative',
          backgroundColor: 'transparent',
          padding: 20,
        },
        content: {
          flex: 1,
          marginTop: 100,
          justifyContent: 'center',
          paddingBottom: 5,
        },
        animalCard: {
          alignItems: 'center',
          justifyContent: 'center',
          height: screenH * 0.25,
          overflow: 'visible',
          marginTop: 150,
        },
        animalNameWrapper: {
          position: 'absolute',
          top: -100,
          width: '100%',
          alignItems: 'center',
        },
        animalName: {
          fontSize: 32,
          marginTop: 0,
          fontWeight: '700',
          backgroundColor: 'yellow',
          paddingVertical: 12,
          paddingHorizontal: 24,
          borderRadius: 22,
          textAlign: 'center',
          elevation: 3,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3,
          opacity: 0.9,
          borderWidth: 5,
          borderColor: '#FFD700',
        },
        navButton: {
          backgroundColor: 'green',
          paddingVertical: 8,
          paddingHorizontal: 15,
          borderRadius: 20,
          marginHorizontal: 20,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          elevation: 2,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.2,
          shadowRadius: 2,
          width: 100,
          height: 60,
        },
        buttonText: {
          color: '#fff',
          fontWeight: 'bold',
          marginHorizontal: 5,
          marginTop: 40,
          marginLeft: 10,
          marginRight: 10,
          marginBottom: 10,
          height: 20,
          width: 20,
        },
        loadingContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#FFDAB9',
        },
        background: {
          ...StyleSheet.absoluteFillObject,
          zIndex: 0,
        },
        loadingText: {
          marginTop: 10,
          fontSize: 18,
          color: '#333',
        },
        foreground: {
          ...StyleSheet.absoluteFillObject,
          zIndex: 1,
          elevation: 1,
        },
        animalLoadingContainer: {
          position: 'absolute',
          justifyContent: 'center',
          alignItems: 'center',
          width: screenW * 0.5,
          height: screenH * 0.25,
        },
        backgroundImageStyle: {
          flex: 1,
          backgroundColor: '#FFDAB9',
        },
        soundButton: {
          position: 'absolute',
          top: 100,
          right: 20,
          backgroundColor: 'rgba(220, 173, 30, 0.7)',
          borderRadius: 25,
          padding: 10,
          zIndex: 10,
          elevation: 5,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 3,
        },
        frameWindow: {
          overflow: 'hidden',
        },
        spriteImage: {
          position: 'absolute',
          left: 0,
          top: 0,
        },
        animalImage: {
          width: screenW * 0.8,
          height: screenH * 0.3,
          resizeMode: 'contain',
          marginTop: 150,
        },
        menuContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#73c2b9',
        },
        menuTitle: {
          fontSize: 20,
          fontWeight: 'bold',
          marginBottom: 20,
          marginTop: 20,
          marginRight: 10,
          color: '#612915',
        },
        levelGrid: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          paddingHorizontal: 10,
        },
        levelButton: {
          borderRadius: 15,
          width: '70%',
          aspectRatio: 1,
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOpacity: 0.2,
          shadowRadius: 5,
          elevation: 4,
          overflow: 'hidden',
        },
        levelButtonBackground: {
          position: 'absolute',
          width: '100%',
          height: '100%',
          borderRadius: 15,
          resizeMode: 'cover',
        },
        levelText: {
          color: 'white',
          fontSize: 15,
          fontWeight: 'bold',
          textAlign: 'center',
          paddingVertical: 5,
          paddingHorizontal: 10,
          borderRadius: 20,
          overflow: 'hidden',
          marginTop: 2,
        },
        backToMenuButton: {
          backgroundColor: 'orange',
          paddingVertical: 12,
          paddingHorizontal: 20,
          borderRadius: 25,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          elevation: 3,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 3,
          position: 'absolute',
          top: 50,
          left: 20,
          zIndex: 10,
        },
        instructionBubble: {
          position: 'absolute',
          left: 20,
          right: 20,
          top: 100,
          paddingVertical: 16,
          paddingHorizontal: 22,
          backgroundColor: 'white',
          borderRadius: 20,
          shadowColor: '#000',
          shadowOpacity: 0.18,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 2 },
          elevation: 6,
          zIndex: 20,
          // "Tail" effect: add a little triangle using a pseudo-element in the component, not here.
          // But for the bubble, add a little marginBottom for the tail to fit visually.
          marginBottom: 18,
          borderWidth: 2,
          borderColor: '#e0e0e0',
        },
        
        instructionText: {
          fontSize: 20,
          color: '#333',
          textAlign: 'center',
          marginBottom: 18,
          marginTop: 10,
          fontWeight: 'bold',
        },
      });
    // ─── updated landscape styles ───
    } else {
      return StyleSheet.create({
        container: {
          flex: 1,
          flexDirection: 'row',
          backgroundColor: 'transparent',
          padding: 20,
        },
        menuContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#73c2b9',
        },
        content: {
          flex: 2,
          justifyContent: 'flex-start',  // start at top
          alignItems: 'center',
          padding: 10,
        },

        // 3. animal card: push down further (increase marginTop for more vertical offset)
        animalCard: {
          width: '100%',
          height: screenH * 0.5,
          justifyContent: 'flex-start',
          alignItems: 'center',
          marginTop: screenH * 0.18, // push down ~18% of screen height
        },

        // remove crazy margins on the image itself—
        // let the card’s marginTop handle vertical placement
        animalImage: {
          width: screenW * 0.3,
          height: screenH * 0.5,
          resizeMode: 'contain',
          marginTop: 0,
        },

        // you can also nudge the name bubble down a little
        animalNameWrapper: {
          position: 'absolute',
          top: -screenH * 0.2,   // float 2% of screen height _above_ the card
          width: '100%',
          alignItems: 'center',
        },
        

        animalName: {
          fontSize: 32,
          marginTop: 0,
          fontWeight: '700',
          backgroundColor: 'yellow',
          paddingVertical: 12,
          paddingHorizontal: 24,
          borderRadius: 22,
          textAlign: 'center',
          elevation: 3,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3,
          opacity: 0.9,
          borderWidth: 5,
          borderColor: '#FFD700',
        },

        navButton: {
          position: 'absolute',
          bottom: 20,
          flexDirection: 'row',
          justifyContent: 'space-between',
          width: '60%',
        },

        // …the rest stays the same…
        animalLoadingContainer: {
          width: screenW * 0.3,
          height: screenH * 0.6,
          justifyContent: 'flex-end',
          alignItems: 'center',
          paddingBottom: 80,
        },
        levelGrid: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-around',
          width: '100%',
        },
        levelButton: {
          width: screenW * 0.25,
          aspectRatio: 1,
          borderRadius: 15,
          overflow: 'hidden',
        },
        levelText: {
          fontSize: 14,
          padding: 4,
        },
        loadingContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        },
        background: {
          ...StyleSheet.absoluteFillObject,
        },
        foreground: {
          ...StyleSheet.absoluteFillObject,
        },
        soundButton: {
          position: 'absolute',
          top: 20,
          right: 20,
          backgroundColor: 'rgba(220, 173, 30, 0.7)',
          borderRadius: 25,
          padding: 10,
          zIndex: 10,
          elevation: 5,
          shadowColor: '#000',
          
        },
        backToMenuButton: {
          backgroundColor: 'orange',
          paddingVertical: 12,
          paddingHorizontal: 20,
          borderRadius: 25,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          elevation: 3,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 3,
          position: 'absolute',
          top: 30,
          left: 20,
          zIndex: 10,
        },
        instructionBubble: {
          position: 'absolute',
          top: 30,
          alignSelf: 'center',
          width: '70%',
          zIndex: 100,
          backgroundColor: 'white',
          borderRadius: 16,
          paddingVertical: 3,
          paddingHorizontal: 12,
          shadowColor: '#000',
          shadowOpacity: 0.18,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 2 },
          elevation: 6,
          borderWidth: 2,
          borderColor: '#e0e0e0',
          marginBottom: 18,
        },
      });
    }
  }, [screenW, screenH]);
}

