import { View, Text, Animated, Image, ImageSourcePropType } from 'react-native';
import { styles } from '../../styles/styles';

export default function InstructionBubble({
  text,
  arrowAnim,
  image
}: {
  text: string,
  arrowAnim: Animated.Value, // This value is already animated in a loop by the parent
  image?: ImageSourcePropType
}) {
  return (
    <View style={[styles.instructionBubble, { zIndex: 100 }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={styles.instructionText}>{text}</Text>
        {/* Conditionally render the Animated.View only if there's an image */}
        {image && (
          <Animated.View
            style={{
              marginLeft: 5, // Keep margin
              // The transform uses the continuously looping arrowAnim value from the parent
              transform: [{ translateY: arrowAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 5] }) }],
            }}
          >
            <Image
              source={image}
              style={{ width: 40, height: 40 }} // Define image size here
              resizeMode="contain"
            />
          </Animated.View>
        )}
      </View>
    </View>
  );
}
