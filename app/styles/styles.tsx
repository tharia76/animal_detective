import { StyleSheet } from 'react-native';
import { Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');



// Define styles outside component at module level
export const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#FFDAB9', // Peachy background color
    },
    content: {
      flex: 1,
      marginTop: 150,
      justifyContent: 'center',
      paddingBottom: 5,
    },
    animalCard: {
      alignItems: 'center',
      justifyContent: 'center',
      height: screenHeight * 0.25,
    },
    animalName: {
      fontSize: 24,
      marginTop: 10,
      fontWeight: '500',
      backgroundColor: '#e0e0e0',
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20, 
      overflow: 'hidden',
      textAlign: 'center',
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 1.5,
      opacity: 0.8,
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
    },
    loadingText: {
      marginTop: 10,
      fontSize: 18,
      color: '#333',
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
    },
    menuContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#FFDAB9',
    },
    menuTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 20,
      marginTop: 20,
      marginRight: 10,
    },
    levelGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            paddingHorizontal: 10, // optional
      

    },
    levelButton: {
        borderRadius: 15,
        width: '100%', // around 3 per row with spacing
        aspectRatio: 1, // keeps it square
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 4,
        overflow: 'hidden',
        marginBottom: 10, // vertical spacing between rows
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
      backgroundColor: 'green',
      paddingVertical: 5,
      paddingHorizontal: 10,
      borderRadius: 20,
      overflow: 'hidden',
      marginTop: 2
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
      top: 200,
      left: 20,
      right: 20,
      padding: 10,
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