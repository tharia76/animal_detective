import { View, Text, Animated, Image, ImageSourcePropType } from 'react-native';
import { styles } from '../../styles/styles';

export default function InstructionBubble({ 
  text, 
  arrowAnim, 
  image 
}: { 
  text: string, 
  arrowAnim: Animated.Value,
  image?: ImageSourcePropType 
}) {
  return (
    <View style={[styles.instructionBubble, { zIndex: 100 }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={styles.instructionText}>{text}</Text>
        {image ? (
          <Animated.View
            style={{
              marginLeft: 10,
              transform: [{ translateY: arrowAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 10] }) }],
            }}
          >
            <Image 
              source={image} 
              style={{ width: 45, height: 45 }} 
              resizeMode="contain"
            />
          </Animated.View>
        ) : (
          <Animated.View
            style={{
              marginLeft: 10,
              transform: [{ translateY: arrowAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 10] }) }],
            }}
          />
        )}
      </View>
    </View>
  );
}
