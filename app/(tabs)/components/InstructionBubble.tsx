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
        {/* The Animated.View is always rendered to apply the animation */}
        <Animated.View
          style={{
            marginLeft: 5, // Reduced margin
            transform: [{ translateY: arrowAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 5] }) }], // Adjusted animation range slightly
            // Ensure the view has dimensions even if the image isn't present,
            // otherwise the animation might not be visually represented if there's no image.
            // We can give it the same dimensions as the image would have, or adjust as needed.
            // If an empty animated view is acceptable, width/height can be omitted or set to 0.
            width: image ? 40 : 0, // Occupy space only if image exists
            height: image ? 40 : 0, // Occupy space only if image exists
          }}
        >
          {image && ( // Conditionally render the image inside the animated view
            <Image
              source={image}
              style={{ width: 40, height: 40 }} // Reduced image size
              resizeMode="contain"
            />
          )}
        </Animated.View>
      </View>
    </View>
  );
}
