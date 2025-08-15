# Flappy Bird Clone - Animal Detective Game

A fun Flappy Bird clone built for the Animal Detective game using React Native and Expo. This bonus game features various bird characters from the main game and provides an engaging side activity for players.

## Features

### 🐦 Multiple Bird Characters
- **10 different bird characters** to choose from:
  - Eagle
  - Dove
  - Canary
  - Parrot
  - Seagull
  - Sparrow
  - Stork
  - Toucan
  - Raven
  - Pelican

### 🎮 Game Mechanics
- **Tap to flap** - Simple one-touch controls
- **Physics-based movement** - Realistic gravity and momentum
- **Randomly generated obstacles** - Pipes with varying heights
- **Score tracking** - Current score and high score persistence
- **Collision detection** - Precise hit detection with pipes and boundaries

### 🎨 Visual Design
- **Beautiful background** - Uses the birds level background from the main game
- **Smooth animations** - 60 FPS gameplay with React Native Animated
- **Modern UI** - Clean, card-based interface design
- **Responsive design** - Works on all screen sizes

### 🏆 Game Features
- **Start screen** - Choose your bird character and start playing
- **In-game scoring** - Real-time score display during gameplay
- **Game over screen** - Shows final score and high score
- **Restart functionality** - Easy one-tap restart

## How to Play

1. **Select your bird** - Tap the bird preview to cycle through available characters
2. **Start the game** - Tap "Start Game" to begin
3. **Flap to fly** - Tap anywhere on the screen to make your bird flap upward
4. **Avoid obstacles** - Navigate through the green pipes without hitting them
5. **Score points** - Each pipe you pass gives you 1 point
6. **Try again** - When you crash, tap "Play Again" to restart

## Technical Implementation

### Core Components
- **Game Loop** - 60 FPS update cycle using `setInterval`
- **Physics Engine** - Custom gravity and velocity calculations
- **Collision Detection** - Rectangle-based collision checking
- **State Management** - React hooks for game state
- **Animation System** - React Native Animated for smooth bird movement

### Game Constants
- **Gravity**: 0.8 (downward acceleration)
- **Flap Force**: -15 (upward velocity on tap)
- **Pipe Width**: 80px
- **Pipe Gap**: 200px (space between top and bottom pipes)
- **Pipe Speed**: 3px per frame
- **Bird Size**: 60x60px

### Asset Integration
- Uses existing bird PNG assets from the main game
- Leverages the birds level background
- Maintains visual consistency with the main game

## Integration

The game is implemented as a React Native component (`BonusGame.tsx`) that can be easily integrated into the main Animal Detective game. It uses the existing project structure and styling patterns.

## Future Enhancements

Potential improvements could include:
- Sound effects and background music
- Particle effects for visual feedback
- Power-ups and special abilities
- Different difficulty levels
- Multiplayer support
- Achievement system
- More bird characters and customization options

## Performance

The game is optimized for smooth performance:
- Efficient collision detection
- Minimal re-renders using React hooks
- Optimized animation loops
- Memory-conscious asset loading

Enjoy playing the Flappy Bird clone! 🐦✨
