// /components/InstructionBubble.tsx
import React from 'react';
import { View, Text, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../styles/styles'; // move styles to a shared file if needed

export default function InstructionBubble({ text, arrowAnim }: { text: string, arrowAnim: Animated.Value }) {
  return (
    <View style={[styles.instructionBubble, { zIndex: 100 }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={styles.instructionText}>{text}</Text>
        <Animated.View
          style={{
            marginLeft: 10,
            transform: [{ translateY: arrowAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 10] }) }],
          }}
        >
          <Ionicons name="arrow-down" size={24} color="#333" />
        </Animated.View>
      </View>
    </View>
  );
}
