// HomeScreen.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Image, Animated, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SpriteAnimation from '../app/(tabs)/components/SpriteAnimation';
import InstructionBubble from '../app/(tabs)/components/InstructionBubble';
import { styles } from '../app/styles/styles';
import { AnimalType } from '../app/(tabs)/data/AnimalType';

type Props = {
  currentAnimal: AnimalType;
  showName: boolean;
  isMuted: boolean;
  fontsLoaded: boolean;
  animalFadeAnim: Animated.Value;
  leftChevronAnim: Animated.Value;
  rightChevronAnim: Animated.Value;
  bgFadeAnim: Animated.Value;
  backgroundImage: any;
  backgroundUri: string | null;
  showInstruction: boolean;
  onBack: () => void;
  onToggleMute: () => void;
  onToggleName: () => void;
  onNext: () => void;
  onPrev: () => void;
  arrowAnim: Animated.Value;
};

export default function HomeScreen({
  currentAnimal,
  showName,
  isMuted,
  fontsLoaded,
  animalFadeAnim,
  leftChevronAnim,
  rightChevronAnim,
  bgFadeAnim,
  backgroundImage,
  backgroundUri,
  showInstruction,
  onBack,
  onToggleMute,
  onToggleName,
  onNext,
  onPrev,
  arrowAnim,
}: Props) {
  const renderAnimalContent = () => {
    if (!currentAnimal) return null;
    if (currentAnimal.type === 'sprite' && currentAnimal.frames && currentAnimal.spriteSheetSize) {
      return (
        <SpriteAnimation
          frames={currentAnimal.frames}
          source={currentAnimal.source}
          spriteSheetSize={currentAnimal.spriteSheetSize}
        />
      );
    }
    return (
      <Image
        source={currentAnimal.source}
        style={styles.animalImage}
        fadeDuration={0}
        progressiveRenderingEnabled={true}
      />
    );
  };

  return (
    <Animated.View style={{ flex: 1, opacity: bgFadeAnim }}>
      <ImageBackground
        source={backgroundUri ? { uri: backgroundUri } : backgroundImage}
        style={styles.container}
        imageStyle={styles.backgroundImageStyle}
        resizeMode="cover"
        fadeDuration={0}
      >
        <TouchableOpacity style={styles.backToMenuButton} onPress={onBack}>
          <Ionicons name="home" size={24} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.soundButton} onPress={onToggleMute}>
          <Ionicons name={isMuted ? 'volume-mute' : 'volume-high'} size={38} color="green" />
        </TouchableOpacity>

        <View style={styles.content}>
          <View style={styles.animalCard}>
            <TouchableOpacity onPress={onToggleName} activeOpacity={0.8}>
              <Animated.View style={{ opacity: animalFadeAnim }}>
                {renderAnimalContent()}
              </Animated.View>
            </TouchableOpacity>
            {showName && currentAnimal && (
              <Text style={[styles.animalName, fontsLoaded ? {} : { fontFamily: undefined }]}>
                {currentAnimal.name}
              </Text>
            )}
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 100 }}>
            <TouchableOpacity style={styles.navButton} onPress={onPrev}>
              <Animated.View style={{ transform: [{ translateX: leftChevronAnim }] }}>
                <Ionicons name="chevron-back" size={24} color="#fff" />
              </Animated.View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navButton} onPress={onNext}>
              <Animated.View style={{ transform: [{ translateX: rightChevronAnim }] }}>
                <Ionicons name="chevron-forward" size={24} color="#fff" />
              </Animated.View>
            </TouchableOpacity>
          </View>
        </View>

        {showInstruction && (
          <InstructionBubble text="Tap the animal to hear its sound!" arrowAnim={arrowAnim} />
        )}
      </ImageBackground>
    </Animated.View>
  );
}
