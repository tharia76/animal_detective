import React, { useCallback, useRef, useState } from 'react';
import {
  Image,
  TouchableOpacity,
  useWindowDimensions,
  PanResponder,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import SpriteAnimation from './SpriteAnimation';

type Animal = {
  id: number;
  name: string;
  type: 'sprite' | 'image';
  source: any;
  frames?: any;
  spriteSheetSize?: { w: number; h: number };
  sound?: any;
  labelSound?: any;
  isMoving?: boolean;
  movingDirection?: 'left' | 'right';
};

type DraggableAnimalProps = {
  animal: Animal;
  onPress: () => void;
  isTransitioning: boolean;
  style?: any;
};

const DraggableAnimal: React.FC<DraggableAnimalProps> = ({
  animal,
  onPress,
  isTransitioning,
  style,
}) => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  
  // Animation values for position
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  
  // State for drag handling
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  
  const handleTap = useCallback(() => {
    if (!isDragging && !isTransitioning) {
      onPress();
    }
  }, [isDragging, isTransitioning, onPress]);

  const handleLongPress = useCallback(() => {
    if (!isTransitioning) {
      setIsDragging(true);
      scale.value = withSpring(1.1, { damping: 15, stiffness: 150 });
    }
  }, [isTransitioning, scale]);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => isDragging,
    onMoveShouldSetPanResponder: () => isDragging,
    onPanResponderGrant: (evt) => {
      if (isDragging) {
        dragStartPos.current = { x: evt.nativeEvent.pageX, y: evt.nativeEvent.pageY };
      }
    },
    onPanResponderMove: (evt) => {
      if (isDragging) {
        const deltaX = evt.nativeEvent.pageX - dragStartPos.current.x;
        const deltaY = evt.nativeEvent.pageY - dragStartPos.current.y;
        
        // Constrain movement within screen bounds
        const newX = Math.max(-screenWidth * 0.4, Math.min(screenWidth * 0.4, deltaX));
        const newY = Math.max(-screenHeight * 0.4, Math.min(screenHeight * 0.4, deltaY));
        
        translateX.value = newX;
        translateY.value = newY;
      }
    },
    onPanResponderRelease: () => {
      if (isDragging) {
        setIsDragging(false);
        scale.value = withSpring(1, { damping: 15, stiffness: 150 });
        
        // Add a small bounce effect when released
        translateX.value = withSpring(translateX.value, { damping: 15, stiffness: 150 });
        translateY.value = withSpring(translateY.value, { damping: 15, stiffness: 150 });
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    };
  });

  const renderAnimal = () => {
    if (!animal) return null;
    
    const key = `${animal.id}-${animal.name}`;

    if (animal.type === 'sprite' && animal.frames && animal.spriteSheetSize) {
      return (
        <SpriteAnimation
          key={key}
          frames={animal.frames}
          source={animal.source}
          spriteSheetSize={animal.spriteSheetSize}
          style={style}
        />
      );
    }
    
    return (
      <Image
        key={key}
        source={animal.source}
        style={style}
        fadeDuration={0}
        progressiveRenderingEnabled={true}
      />
    );
  };

  if (!animal) return null;

  return (
    <Animated.View style={animatedStyle} {...panResponder.panHandlers}>
      <TouchableOpacity 
        onPress={handleTap}
        onLongPress={handleLongPress}
        activeOpacity={0.9}
        disabled={isTransitioning}
        style={{ alignItems: 'center', justifyContent: 'center' }}
      >
        {renderAnimal()}
      </TouchableOpacity>
    </Animated.View>
  );
};

export default DraggableAnimal; 