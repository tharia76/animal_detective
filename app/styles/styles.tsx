import { StyleSheet } from 'react-native';
import { Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');



// Define styles outside component at module level
export  const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative', // important for layered stacking
    backgroundColor: 'transparent', // allow background behind to show
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
      height: screenHeight * 0.25,
      overflow: 'visible',
      marginTop: 150, // Increased from 150 to push animal down further
    },
    
    // NEW wrapper that’s full width but centers its children
    animalNameWrapper: {
      position: 'absolute',
      top: -100,      // tweak as needed
      width: '100%',
      alignItems: 'center',
    },
    
    // Just style the Text itself; it will size to its content
    animalName: {
      fontSize: 32, // Increased from 20
      marginTop: 0,
      fontWeight: '700', // Slightly bolder for visibility
      backgroundColor: 'yellow',
      paddingVertical: 12, // Increased padding
      paddingHorizontal: 24, // Increased padding
      borderRadius: 22, // Slightly larger radius
      textAlign: 'center',
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3,
      opacity: 0.9,
      borderWidth: 5,
      borderColor: '#FFD700', // gold border for visibility
      // no position, no width here
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
      backgroundColor: '#FFDAB9', // Peachy background color for loading screen
    },  background: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 0,
    },
    loadingText: {
      marginTop: 10,
      fontSize: 18,
      color: '#333',
    }, foreground: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 1,
      elevation: 1,        // Android stacking
    },
    animalLoadingContainer: {
      position: 'absolute',
      justifyContent: 'center',
      alignItems: 'center',
      width: screenWidth * 0.5,
      height: screenHeight * 0.25,
    },
    backgroundImageStyle: {
      flex: 1,
      backgroundColor: '#FFDAB9', // Peachy background color for image background
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
      width: screenWidth * 0.5,
      height: screenHeight * 0.25,
      resizeMode: 'contain',
      marginTop: 150, // Increased from 150 to push animal down further
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
            paddingHorizontal: 10, // optional
      

    },
    levelButton: {
        borderRadius: 15,
        width: '70%', // Make button slightly smaller within its container
        aspectRatio: 1, // keeps it square
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 4,
        overflow: 'hidden',
        // marginBottom is handled by the parent View now
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
      overflow: 'hidden', // This helps clip text, but doesn't prevent wrapping calculation
      marginTop: 2,
      // Note: To strictly prevent text wrapping, set the `numberOfLines={1}`
      // prop directly on the <Text> component using this style.
      // There is no direct 'white-space: nowrap' style property in React Native.
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
      top: 100,
      left: 20,
      right: 20,
      padding: 5,
      backgroundColor: 'white',
      borderRadius: 20,
      shadowColor: '#000',
      shadowOpacity: 0.3,
      shadowRadius: 5,
      elevation: 5,
      zIndex: 20,
      // Speech bubble tail
      borderBottomLeftRadius: 0,
      // Add a pseudo-element effect with additional styling
      marginBottom: 15, // Space for the "tail"
      // The bubble shape
      transform: [{ perspective: 1000 }],
    },
    instructionText: {
      fontSize: 20,
      color: '#333',
      textAlign: 'center',
    },
  });

  // Road animation styles
  const roadStyles = StyleSheet.create({
    roadContainer: {
      width: '100%',
      height: 100,
      position: 'relative',
      overflow: 'hidden',
      marginTop: 20,
    },
    roadStrip: {
      position: 'absolute',
      width: '200%', // Extra width for continuous animation
      height: '100%',
      backgroundColor: '#333',
      zIndex: 1,
    },
    roadSurface: {
      position: 'absolute',
      width: '100%',
      height: 60,
      backgroundColor: '#555',
      top: 20,
      zIndex: 2,
    },
    roadSidewalk: {
      position: 'absolute',
      width: '100%',
      height: 10,
      backgroundColor: '#999',
      top: 10,
      zIndex: 2,
    },
    roadMarkingsContainer: {
      position: 'absolute',
      width: '100%',
      height: 60,
      top: 20,
      zIndex: 3,
    },
    roadMarking: {
      position: 'absolute',
      width: 40,
      height: 5,
      backgroundColor: '#fff',
      top: 27,
    },
  });

  export default styles;