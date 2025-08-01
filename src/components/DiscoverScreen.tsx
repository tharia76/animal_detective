import React, { useRef, useEffect, useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  Animated,
  useWindowDimensions,
  Platform,
  ScrollView,
  ImageBackground,
  ActivityIndicator,
  Modal
} from 'react-native';

import { createAudioPlayer } from 'expo-audio';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

interface DiscoverScreenProps {
  animals?: any[];
  levelName?: string;
  onComplete?: () => void;
  onBackToMenu?: () => void;
  onBackToLevel?: (animalIndex?: number) => void;
  visitedAnimals?: Set<number>;
  currentAnimalIndex?: number;
}

// Generic Animal Grid component for all level types
const LevelAnimalGrid: React.FC<{
  animals: any[];
  levelName: string;
  isTablet: boolean;
  isMobile: boolean;
  revealedAnimals: Set<string>;
  setRevealedAnimals: React.Dispatch<React.SetStateAction<Set<string>>>;
  onAllRevealed?: () => void;
  currentGuideIndex: number;
  setCurrentGuideIndex: React.Dispatch<React.SetStateAction<number>>;
  magnifyingGlassRotation: Animated.Value;
  magnifyingGlassScale: Animated.Value;
  availableAnimals: Set<string>;
  setShowLockedModal: React.Dispatch<React.SetStateAction<boolean>>;
  setClickedAnimalIndex: React.Dispatch<React.SetStateAction<number>>;
}> = ({ animals, levelName, isTablet, isMobile, revealedAnimals, setRevealedAnimals, onAllRevealed, currentGuideIndex, setCurrentGuideIndex, magnifyingGlassRotation, magnifyingGlassScale, availableAnimals, setShowLockedModal, setClickedAnimalIndex }) => {
  // Filter animals by the current level's animal type
  const levelAnimals = animals.filter((animal: any) => 
    animal.animalType.toLowerCase() === levelName.toLowerCase()
  );
  console.log(`${levelName} animals found:`, levelAnimals.length);
  console.log('All animals:', animals.length);
  console.log(`${levelName} animal names:`, levelAnimals.map(a => a.name));
  

  
  // Create animation refs for each animal card at the top level
  const animalAnimRefs = useRef<Animated.Value[]>([]);
  
  // Initialize animation refs for all animals
  if (animalAnimRefs.current.length !== levelAnimals.length) {
    animalAnimRefs.current = levelAnimals.map(() => new Animated.Value(1));
  }
  
  // First, let's just show a simple test with animal names
  if (levelAnimals.length === 0) {
    return (
      <View style={{ padding: 20, alignItems: 'center' }}>
        <Text style={{ fontSize: 16, color: '#666' }}>
          No {levelName} animals found!
        </Text>
        <Text style={{ fontSize: 14, color: '#999', marginTop: 10 }}>
          Total animals: {animals.length}
        </Text>
      </View>
    );
  }
  
  // Array of available sticker images
  const stickerImages = [
    require('../assets/images/stickers/sticker1.png'),
    require('../assets/images/stickers/sticker2.png'),
    require('../assets/images/stickers/sticker3.png'),
    require('../assets/images/stickers/sticker4.png'),
    require('../assets/images/stickers/sticker5.png'),
    require('../assets/images/stickers/sticker6.png'),
    require('../assets/images/stickers/sticker7.png'),
    require('../assets/images/stickers/sticker8.png'),
    require('../assets/images/stickers/sticker9.png'),
  ];

  // Generate random sticker mapping for each animal (consistent per session)
  const getStickerForAnimal = (animalName: string) => {
    // Use animal name as seed for consistent random selection
    const hash = animalName.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    const index = Math.abs(hash) % stickerImages.length;
    return stickerImages[index];
  };

  // Static mapping of animal names to their silhouette images
  const silhouetteImageMap: { [key: string]: any } = {
    // Arctic animals
    'white bear': require('../assets/images/silhouettes/whitebear_silhouette.png'),
    'white fox': require('../assets/images/silhouettes/whitefox_silhouette.png'),
    'reindeer': require('../assets/images/silhouettes/reindeer_silhouette.png'),
    'seal': require('../assets/images/silhouettes/seal_silhouette.png'),
    'snow owl': require('../assets/images/silhouettes/snowyowl_silhouette.png'),
    'penguin': require('../assets/images/silhouettes/ping_silhouette.png'),
    'walrus': require('../assets/images/silhouettes/walrus_silhouette.png'),
    
    // Farm animals
    'dog': require('../assets/images/silhouettes/dog_silhouette.png'),
    'cat': require('../assets/images/silhouettes/cat_silhouette.png'),
    'chicken': require('../assets/images/silhouettes/chicken_silhouette.png'),
    'chick': require('../assets/images/silhouettes/chick_silhouette.png'),
    'donkey': require('../assets/images/silhouettes/donkey_silhouette.png'),
    'cow': require('../assets/images/silhouettes/cow_silhouette.png'),
    'duck': require('../assets/images/silhouettes/duck_silhouette.png'),
    'goat': require('../assets/images/silhouettes/goat_silhouette.png'),
    'goose': require('../assets/images/silhouettes/goose_silhouette.png'),
    'horse': require('../assets/images/silhouettes/horse_silhouette.png'),
    'llama': require('../assets/images/silhouettes/llama_silhouette.png'),
    'pig': require('../assets/images/silhouettes/pig_silhouette.png'),
    'rabbit': require('../assets/images/silhouettes/rabbit_silhouette.png'),
    'rooster': require('../assets/images/silhouettes/rooster_silhouette.png'),
    'sheep': require('../assets/images/silhouettes/sheep_silhouette.png'),
    'turkey': require('../assets/images/silhouettes/turkey_silhouette.png'),
    
    // Forest animals
    'fox': require('../assets/images/silhouettes/fox_silhouette.png'),
    'bear': require('../assets/images/silhouettes/bear_silhouette.png'),
    'raccoon': require('../assets/images/silhouettes/raccoon_silhouette.png'),
    'squirrel': require('../assets/images/silhouettes/squirrel_silhouette.png'),
    'hedgehog': require('../assets/images/silhouettes/hedgehog_silhouette.png'),
    'owl': require('../assets/images/silhouettes/owl_silhouette.png'),
    'wolf': require('../assets/images/silhouettes/wolf_silhouette.png'),
    'deer': require('../assets/images/silhouettes/deer_silhouette.png'),
    'moose': require('../assets/images/silhouettes/moose_silhouette.png'),
    'mouse': require('../assets/images/silhouettes/mouse_silhouette.png'),
    'badger': require('../assets/images/silhouettes/badger_silhouette.png'),
    'beaver': require('../assets/images/silhouettes/beaver_silhouette.png'),
    'boar': require('../assets/images/silhouettes/boar_silhouette.png'),
    'bat': require('../assets/images/silhouettes/bat_silhouette.png'),
    'otter': require('../assets/images/silhouettes/otter_silhouette.png'),
    'skunk': require('../assets/images/silhouettes/skunk_silhouette.png'),
    
    // Desert animals
    'camel': require('../assets/images/silhouettes/camel_silhouette.png'),
    'caracal': require('../assets/images/silhouettes/caracal_silhouette.png'),
    'desert tortoise': require('../assets/images/silhouettes/dtortoise_silhouette.png'),
    'fennec fox': require('../assets/images/silhouettes/fennecfox_silhouette.png'),
    'lizard': require('../assets/images/silhouettes/lizard_silhouette.png'),
    'sand cat': require('../assets/images/silhouettes/sandcat_silhouette.png'),
    'scorpion': require('../assets/images/silhouettes/scorpion_silhouette.png'),
    'snake': require('../assets/images/silhouettes/snake_silhouette.png'),
    'jerboa': require('../assets/images/silhouettes/jerboa_silhouette.png'),
    
    // Ocean animals
    'dolphin': require('../assets/images/silhouettes/dolphin_silhouette.png'),
    'whale': require('../assets/images/silhouettes/whale_silhouette.png'),
    'shark': require('../assets/images/silhouettes/shark_silhouette.png'),
    'octopus': require('../assets/images/silhouettes/octopus_silhouette.png'),
    'sea turtle': require('../assets/images/silhouettes/seaturtle_silhouette.png'),
    'seahorse': require('../assets/images/silhouettes/seahorse_silhouette.png'),
    'starfish': require('../assets/images/silhouettes/starfish_silhouette.png'),
    'crab': require('../assets/images/silhouettes/crab_silhouette.png'),
    'lobster': require('../assets/images/silhouettes/lobster_silhouette.png'),
    'jellyfish': require('../assets/images/silhouettes/jellyfish_silhouette.png'),
    'fish': require('../assets/images/silhouettes/fish_silhouette.png'),
    'shrimp': require('../assets/images/silhouettes/shrimp_silhouette.png'),
    'stingray': require('../assets/images/silhouettes/stringray_silhouette.png'),
    
    // Birds
    'eagle': require('../assets/images/silhouettes/eagle_silhouette.png'),
    'dove': require('../assets/images/silhouettes/dove_silhouette.png'),
    'canary': require('../assets/images/silhouettes/canary_silhouette.png'),
    'flamingo': require('../assets/images/silhouettes/flamingo_silhouette.png'),
    'ostrich': require('../assets/images/silhouettes/ostrich_silhouette.png'),
    'parrot': require('../assets/images/silhouettes/parrot_silhouette.png'),
    'pelican': require('../assets/images/silhouettes/pelican_silhouette.png'),
    'raven': require('../assets/images/silhouettes/raven_silhouette.png'),
    'seagull': require('../assets/images/silhouettes/seagull_silhouette.png'),
    'sparrow': require('../assets/images/silhouettes/sparrow_silhouette.png'),
    'stork': require('../assets/images/silhouettes/stork_silhouette.png'),
    'swan': require('../assets/images/silhouettes/swan_silhouette.png'),
    'toucan': require('../assets/images/silhouettes/toucan_silhouette.png'),
    'woodpecker': require('../assets/images/silhouettes/woodpecker_silhouette.png'),
    
    // Insects
    'ant': require('../assets/images/silhouettes/ant_silhouette.png'),
    'bee': require('../assets/images/silhouettes/bee_silhouette.png'),
    'butterfly': require('../assets/images/silhouettes/butterfly_silhouette.png'),
    'caterpillar': require('../assets/images/silhouettes/caterpillar_silhouette.png'),
    'cockroach': require('../assets/images/silhouettes/cockroach_silhouette.png'),
    'dragonfly': require('../assets/images/silhouettes/dragonfly_silhouette.png'),
    'fly': require('../assets/images/silhouettes/fly_silhouette.png'),
    'grasshopper': require('../assets/images/silhouettes/grasshopper_silhouette.png'),
    'ladybug': require('../assets/images/silhouettes/ladybag_silhouette.png'),
    'mantis': require('../assets/images/silhouettes/mantis_silhouette.png'),
    'mosquito': require('../assets/images/silhouettes/mosquito_silhouette.png'),
    'snail': require('../assets/images/silhouettes/snail_silhouette.png'),
    'spider': require('../assets/images/silhouettes/spider_silhouette.png'),
    'worm': require('../assets/images/silhouettes/worm_silhouette.png'),
    
    // Savannah animals
    'elephant': require('../assets/images/silhouettes/elephant_silhouette.png'),
    'giraffe': require('../assets/images/silhouettes/giraffe_silhouette.png'),
    'lion': require('../assets/images/silhouettes/leon_silhouette.png'),
    'zebra': require('../assets/images/silhouettes/zebra_silhouette.png'),
    'rhinoceros': require('../assets/images/silhouettes/rhinoceros_silhouette.png'),
    'hippopotamus': require('../assets/images/silhouettes/hippopotamus_silhouette.png'),
    'cheetah': require('../assets/images/silhouettes/gepard_silhouette.png'),
    'hyena': require('../assets/images/silhouettes/hyena_silhouette.png'),
    'meerkat': require('../assets/images/silhouettes/meerkat_silhouette.png'),
    'oryx': require('../assets/images/silhouettes/oryx_silhouette.png'),
    'antelope': require('../assets/images/silhouettes/antelope_silhouette.png'),
    'jackal': require('../assets/images/silhouettes/jackal_silhouette.png'),
    'bison': require('../assets/images/silhouettes/bizon_silhouette.png'),
    'wild boar': require('../assets/images/silhouettes/wildboar_silhouette.png'),
    
    // Jungle animals
    'tiger': require('../assets/images/silhouettes/tiger_silhouette.png'),
    'panther': require('../assets/images/silhouettes/panther_silhouette.png'),
    'jaguar': require('../assets/images/silhouettes/jaguar_silhouette.png'),
    'gorilla': require('../assets/images/silhouettes/gorilla_silhouette.png'),
    'chimpanzee': require('../assets/images/silhouettes/chimpanzee_silhouette.png'),
    'orangutan': require('../assets/images/silhouettes/orangutan_silhouette.png'),
    'lemur': require('../assets/images/silhouettes/lemur_silhouette.png'),
    'sloth': require('../assets/images/silhouettes/sloth_silhouette.png'),
    'iguana': require('../assets/images/silhouettes/iguana_silhouette.png'),
    'frog': require('../assets/images/silhouettes/frog_silhouette.png'),
    'crocodile': require('../assets/images/silhouettes/crocodile_silhouette.png'),
    'chameleon': require('../assets/images/silhouettes/chameleon_silhouette.png'),
    'panda': require('../assets/images/silhouettes/panda_silhouette.png'),
    'ant eater': require('../assets/images/silhouettes/anteater_silhouette.png'),
    'asian elephant': require('../assets/images/silhouettes/aelephant_silhouette.png'),
    'bengal tiger': require('../assets/images/silhouettes/btiger_silhouette.png'),
    'black panther': require('../assets/images/silhouettes/panther_silhouette.png'),
    'capybara': require('../assets/images/silhouettes/capybara_silhouette.png'),
    'koala': require('../assets/images/silhouettes/koala_silhouette.png'),
    'turtle': require('../assets/images/silhouettes/turtle_silhouette.png'),
  };
  
  // Static mapping of animal names to their still images
  const stillImageMap: { [key: string]: any } = {
    // Arctic animals
    'white bear': require('../assets/images/still-animals/whitebear.png'),
    'white fox': require('../assets/images/still-animals/whitefox.png'),
    'reindeer': require('../assets/images/still-animals/reindeer.png'),
    'seal': require('../assets/images/still-animals/seal.png'),
    'snow owl': require('../assets/images/still-animals/snowyowl.png'),
    'penguin': require('../assets/images/still-animals/ping.png'),
    'walrus': require('../assets/images/still-animals/walrus.png'),
    
    // Farm animals
    'dog': require('../assets/images/still-animals/dog.png'),
    'cat': require('../assets/images/still-animals/cat.png'),
    'chicken': require('../assets/images/still-animals/chicken.png'),
    'chick': require('../assets/images/still-animals/chick.png'),
    'donkey': require('../assets/images/still-animals/donkey.png'),
    'cow': require('../assets/images/still-animals/cow.png'),
    'duck': require('../assets/images/still-animals/duck.png'),
    'goat': require('../assets/images/still-animals/goat.png'),
    'goose': require('../assets/images/still-animals/goose.png'),
    'horse': require('../assets/images/still-animals/horse.png'),
    'llama': require('../assets/images/still-animals/llama.png'),
    'pig': require('../assets/images/still-animals/pig.png'),
    'rabbit': require('../assets/images/still-animals/rabbit.png'),
    'rooster': require('../assets/images/still-animals/rooster.png'),
    'sheep': require('../assets/images/still-animals/sheep.png'),
    'turkey': require('../assets/images/still-animals/turkey.png'),
    
    // Forest animals
    'fox': require('../assets/images/still-animals/fox.png'),
    'bear': require('../assets/images/still-animals/bear.png'),
    'raccoon': require('../assets/images/still-animals/raccoon.png'),
    'squirrel': require('../assets/images/still-animals/squirrel.png'),
    'hedgehog': require('../assets/images/still-animals/hedgehog.png'),
    'owl': require('../assets/images/still-animals/owl.png'),
    'wolf': require('../assets/images/still-animals/wolf.png'),
    'deer': require('../assets/images/still-animals/deer.png'),
    'moose': require('../assets/images/still-animals/moose.png'),
    'mouse': require('../assets/images/still-animals/mouse.png'),
    'badger': require('../assets/images/still-animals/badger.png'),
    'beaver': require('../assets/images/still-animals/beaver.png'),
    'boar': require('../assets/images/still-animals/boar.png'),
    'bat': require('../assets/images/still-animals/bat.png'),
    'otter': require('../assets/images/still-animals/otter.png'),
    'skunk': require('../assets/images/still-animals/skunk.png'),
    
    // Desert animals
    'camel': require('../assets/images/still-animals/camel.png'),
    'caracal': require('../assets/images/still-animals/caracal.png'),
    'desert tortoise': require('../assets/images/still-animals/dtortoise.png'),
    'fennec fox': require('../assets/images/still-animals/fennecfox.png'),
    'lizard': require('../assets/images/still-animals/lizard.png'),
    'sand cat': require('../assets/images/still-animals/sandcat.png'),
    'scorpion': require('../assets/images/still-animals/scorpion.png'),
    'snake': require('../assets/images/still-animals/snake.png'),
    'jerboa': require('../assets/images/still-animals/jerboa.png'),
    
    // Ocean animals
    'dolphin': require('../assets/images/still-animals/dolphin.png'),
    'whale': require('../assets/images/still-animals/whale.png'),
    'shark': require('../assets/images/still-animals/shark.png'),
    'octopus': require('../assets/images/still-animals/octopus.png'),
    'sea turtle': require('../assets/images/still-animals/seaturtle.png'),
    'seahorse': require('../assets/images/still-animals/seahorse.png'),
    'starfish': require('../assets/images/still-animals/starfish.png'),
    'crab': require('../assets/images/still-animals/crab.png'),
    'lobster': require('../assets/images/still-animals/lobster.png'),
    'jellyfish': require('../assets/images/still-animals/jellyfish.png'),
    'fish': require('../assets/images/still-animals/fish.png'),
    'shrimp': require('../assets/images/still-animals/shrimp.png'),
    'stingray': require('../assets/images/still-animals/stringray.png'),
    
    // Birds
    'eagle': require('../assets/images/still-animals/eagle.png'),
    'dove': require('../assets/images/still-animals/dove.png'),
    'canary': require('../assets/images/still-animals/canary.png'),
    'flamingo': require('../assets/images/still-animals/flamingo.png'),
    'ostrich': require('../assets/images/still-animals/ostrich.png'),
    'parrot': require('../assets/images/still-animals/parrot.png'),
    'pelican': require('../assets/images/still-animals/pelican.png'),
    'raven': require('../assets/images/still-animals/raven.png'),
    'seagull': require('../assets/images/still-animals/seagull.png'),
    'sparrow': require('../assets/images/still-animals/sparrow.png'),
    'stork': require('../assets/images/still-animals/stork.png'),
    'swan': require('../assets/images/still-animals/swan.png'),
    'toucan': require('../assets/images/still-animals/toucan.png'),
    'woodpecker': require('../assets/images/still-animals/woodpecker.png'),
    
    // Insects
    'ant': require('../assets/images/still-animals/ant.png'),
    'bee': require('../assets/images/still-animals/bee.png'),
    'butterfly': require('../assets/images/still-animals/butterfly.png'),
    'caterpillar': require('../assets/images/still-animals/caterpillar.png'),
    'cockroach': require('../assets/images/still-animals/cockroach.png'),
    'dragonfly': require('../assets/images/still-animals/dragonfly.png'),
    'fly': require('../assets/images/still-animals/fly.png'),
    'grasshopper': require('../assets/images/still-animals/grasshopper.png'),
    'ladybug': require('../assets/images/still-animals/ladybag.png'),
    'mantis': require('../assets/images/still-animals/mantis.png'),
    'mosquito': require('../assets/images/still-animals/mosquito.png'),
    'snail': require('../assets/images/still-animals/snail.png'),
    'spider': require('../assets/images/still-animals/spider.png'),
    'worm': require('../assets/images/still-animals/worm.png'),
    
    // Savannah animals
    'elephant': require('../assets/images/still-animals/elephant.png'),
    'giraffe': require('../assets/images/still-animals/giraffe.png'),
    'lion': require('../assets/images/still-animals/leon.png'),
    'zebra': require('../assets/images/still-animals/zebra.png'),
    'rhinoceros': require('../assets/images/still-animals/rhinoceros.png'),
    'hippopotamus': require('../assets/images/still-animals/hippopotamus.png'),
    'cheetah': require('../assets/images/still-animals/gepard.png'),
    'hyena': require('../assets/images/still-animals/hyena.png'),
    'meerkat': require('../assets/images/still-animals/meerkat.png'),
    'oryx': require('../assets/images/still-animals/oryx.png'),
    'antelope': require('../assets/images/still-animals/antelope.png'),
    'jackal': require('../assets/images/still-animals/jackal.png'),
    'bison': require('../assets/images/still-animals/bizon.png'),
    'wild boar': require('../assets/images/still-animals/wildboar.png'),
    
    // Jungle animals
    'tiger': require('../assets/images/still-animals/tiger.png'),
    'panther': require('../assets/images/still-animals/panther.png'),
    'jaguar': require('../assets/images/still-animals/jaguar.png'),
    'gorilla': require('../assets/images/still-animals/gorilla.png'),
    'chimpanzee': require('../assets/images/still-animals/chimpanzee.png'),
    'orangutan': require('../assets/images/still-animals/orangutan.png'),
    'lemur': require('../assets/images/still-animals/lemur.png'),
    'sloth': require('../assets/images/still-animals/sloth.png'),
    'iguana': require('../assets/images/still-animals/iguana.png'),
    'frog': require('../assets/images/still-animals/frog.png'),
    'crocodile': require('../assets/images/still-animals/crocodile.png'),
    'chameleon': require('../assets/images/still-animals/chameleon.png'),
    'panda': require('../assets/images/still-animals/panda.png'),
    'ant eater': require('../assets/images/still-animals/anteater.png'),
    'asian elephant': require('../assets/images/still-animals/aelephant.png'),
    'bengal tiger': require('../assets/images/still-animals/btiger.png'),
    'black panther': require('../assets/images/still-animals/panther.png'),
    'capybara': require('../assets/images/still-animals/capybara.png'),
    'koala': require('../assets/images/still-animals/koala.png'),
    'turtle': require('../assets/images/still-animals/turtle.png'),
  };

  // Magnifying glass animation effect - circular rotation around the square
  useEffect(() => {
    if (revealedAnimals.size < levelAnimals.length && currentGuideIndex < levelAnimals.length) {
      // Start the circular rotation animation for the magnifying glass
      const rotationAnimation = Animated.loop(
        Animated.timing(magnifyingGlassRotation, {
          toValue: 1,
          duration: 3000, // 3 seconds for full circle
          useNativeDriver: true,
        })
      );

      const scaleAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(magnifyingGlassScale, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(magnifyingGlassScale, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );

      rotationAnimation.start();
      scaleAnimation.start();

      return () => {
        rotationAnimation.stop();
        scaleAnimation.stop();
      };
    }
  }, [currentGuideIndex, revealedAnimals.size, levelAnimals.length, magnifyingGlassRotation, magnifyingGlassScale]);

  // Move to next unrevealed available animal when current one is revealed
  useEffect(() => {
    const currentAnimal = levelAnimals[currentGuideIndex];
    if (currentAnimal && revealedAnimals.has(currentAnimal.name.toLowerCase())) {
      // Find the next unrevealed available animal
      let nextIndex = -1;
      for (let i = 0; i < levelAnimals.length; i++) {
        const animalKey = levelAnimals[i].name.toLowerCase();
        const isAvailable = availableAnimals.has(animalKey);
        const isRevealed = revealedAnimals.has(animalKey);
        
        if (isAvailable && !isRevealed) {
          nextIndex = i;
          break;
        }
      }
      
      if (nextIndex !== -1) {
        setTimeout(() => setCurrentGuideIndex(nextIndex), 800); // Small delay for smooth transition
      }
    }
  }, [revealedAnimals, currentGuideIndex, levelAnimals, availableAnimals]);
  
  return (
    <>
      {levelAnimals.map((animal: any, index: number) => {
        // Show all animals - no filtering needed
        const animalKey = animal.name.toLowerCase();
        const isRevealed = revealedAnimals.has(animalKey);
        const isAvailable = availableAnimals.has(animalKey);
        const silhouetteImage = silhouetteImageMap[animalKey];
        const realImage = stillImageMap[animalKey];
        const displayImage = isRevealed ? realImage : silhouetteImage;
        
        console.log('Processing animal:', animal.name, 'Key:', animalKey, 'Revealed:', isRevealed, 'Available:', isAvailable);
        
        // Get the animation value for this specific animal card
        const animValue = animalAnimRefs.current[index];
        
        const handleAnimalPress = () => {
          // If animal is not available, show locked modal
          if (!isAvailable) {
            setClickedAnimalIndex(index);
            setShowLockedModal(true);
            return;
          }
          
          // If already revealed, don't do anything
          if (isRevealed) {
            return;
          }

          // Play random aha sound
          try {
            const ahaFiles = [
              require('../assets/sounds/other/aha1.mp3'),
              require('../assets/sounds/other/aha2.mp3'),
              require('../assets/sounds/other/aha3.mp3'),
            ];
            const randomAha = ahaFiles[Math.floor(Math.random() * ahaFiles.length)];
            const ahaPlayer = createAudioPlayer(randomAha);
            ahaPlayer.play();
            
            // Clean up sound when it finishes
            ahaPlayer.addListener('playbackStatusUpdate', (status: any) => {
              if (status.didJustFinish) {
                ahaPlayer.remove();
              }
            });
          } catch (error) {
            console.warn('Error playing aha sound:', error);
          }

          // Create pop animation
          const popAnimation = Animated.sequence([
            Animated.timing(animValue, {
              toValue: 1.2, // Scale up
              duration: 150,
              useNativeDriver: true,
            }),
            Animated.timing(animValue, {
              toValue: 1, // Scale back to normal
              duration: 150,
              useNativeDriver: true,
            }),
          ]);
          
          // Start the animation
          popAnimation.start();
          
          // Reveal the animal (stays revealed, no toggling back)
          setRevealedAnimals(prev => {
            const newSet = new Set(prev);
            const animalKey = animal.name.toLowerCase();
            
            if (!newSet.has(animalKey)) {
              newSet.add(animalKey); // Show real image
              
              // Check if this was the last available animal to reveal
              // Count how many available animals have been revealed
              const revealedAvailableCount = Array.from(newSet).filter(name => 
                availableAnimals.has(name)
              ).length;
              
              console.log('Revealed available count:', revealedAvailableCount);
              console.log('Total available animals:', availableAnimals.size);
              console.log('Available animals:', Array.from(availableAnimals));
              console.log('All revealed animals:', Array.from(newSet));
              
              if (revealedAvailableCount === availableAnimals.size && availableAnimals.size > 0 && onAllRevealed) {
                console.log('All available animals revealed! Triggering completion...');
                // Wait a moment to let the user see the last reveal, then trigger callback
                setTimeout(() => {
                  onAllRevealed();
                }, 1000);
              }
            }
            return newSet;
          });
        };
        
        return (
          <Animated.View
            key={animal.id}
            style={{
              transform: [
                { scale: animValue }
              ],
            }}
          >
            <View style={{ margin: isTablet ? 6 : (isMobile ? 8 : 4) }}>
              <TouchableOpacity 
                activeOpacity={0.8}
                onPress={handleAnimalPress}
                style={{
                  position: 'relative',
                  opacity: isAvailable ? 1 : 0.5,
                }}
              >
                <Image
                  source={getStickerForAnimal(animal.name)}
                  style={{
                    width: isTablet ? 160 : (isMobile ? 95 : 120), // 3 per row on mobile
                    height: isTablet ? 180 : (isMobile ? 115 : 140),
                  }}
                  resizeMode="contain"
                />
                
                {/* Magnifying glass guide - show on available animals that aren't revealed */}
                {isAvailable && !isRevealed && index === currentGuideIndex && (
                  <Animated.View
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      width: 70,
                      height: 70,
                      marginLeft: -35,
                      marginTop: -35,
                      zIndex: 1,
                      transform: [
                        {
                          translateX: magnifyingGlassRotation.interpolate({
                            inputRange: [0, 0.25, 0.5, 0.75, 1],
                            outputRange: [30, 0, -30, 0, 30],
                          }),
                        },
                        {
                          translateY: magnifyingGlassRotation.interpolate({
                            inputRange: [0, 0.25, 0.5, 0.75, 1],
                            outputRange: [0, -30, 0, 30, 0],
                          }),
                        },
                        { scale: magnifyingGlassScale },
                      ],
                    }}
                  >
                    <Text style={{ 
                      fontSize: 48, 
                      textShadowColor: 'rgba(0,0,0,0.5)', 
                      textShadowOffset: {width: 3, height: 3}, 
                      textShadowRadius: 4,
                      textAlign: 'center',
                    }}>🔍</Text>
                  </Animated.View>
                )}

                {/* Lock icon for unavailable animals */}
                {!isAvailable && (
                  <View style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: 60,
                    height: 60,
                    marginLeft: -30,
                    marginTop: -30,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'rgba(255, 165, 0, 0.9)', // Orange background like home button
                    borderRadius: 30,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 3,
                    elevation: 3,
                    zIndex: 2,
                  }}>
                    <Ionicons name="lock-closed" size={28} color="#fff" />
                  </View>
                )}
                
                {/* Show silhouette or animal image overlay */}
                {displayImage && (
                  <View style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                    <Image
                      source={displayImage}
                      style={{
                        width: '80%',
                        height: '80%',
                        resizeMode: 'contain',
                      }}
                    />
                  </View>
                )}
              </TouchableOpacity>
              
              {/* Show animal name when revealed */}
              {isRevealed && (
                <Text 
                  style={{
                    fontSize: isTablet ? 24 : (isMobile ? 20 : 18), // Smaller text for mobile
                    fontFamily: Platform.OS === 'ios' ? 'Marker Felt' : 'cursive', // Handwritten font
                    fontWeight: Platform.OS === 'ios' ? 'normal' : 'bold',
                    color: 'black', // Black text for better contrast
                    textAlign: 'center',
                    marginTop: -20,
                    textShadowColor: 'rgba(255,255,255,0.8)',
                    textShadowOffset: {width: 1, height: 1},
                    textShadowRadius: 2,
                  }}
                  numberOfLines={1}
                >
                  {animal.name}
                </Text>
              )}
            </View>
          </Animated.View>
        );
      })}
    </>
  );
};

const DiscoverScreen: React.FC<DiscoverScreenProps> = ({ 
  animals = [],
  levelName = 'Arctic',
  onComplete,
  onBackToMenu,
  onBackToLevel,
  visitedAnimals = new Set(),
  currentAnimalIndex = 0
}) => {
  const { width: screenW, height: screenH } = useWindowDimensions();
  const isLandscape = screenW > screenH;
  const isMobile = Math.min(screenW, screenH) < 768;
  const isTablet = Math.min(screenW, screenH) >= 768 && Math.max(screenW, screenH) >= 1024;

  // State to track which animals have been revealed (show real image instead of silhouette)
  // Initialize with visited animals already revealed
  const [revealedAnimals, setRevealedAnimals] = useState<Set<string>>(() => {
    const initialRevealed = new Set<string>();
    if (visitedAnimals.size > 0) {
      // Filter animals by level first
      const levelAnimals = animals.filter((animal: any) => 
        animal.animalType.toLowerCase() === levelName.toLowerCase()
      );
      // Add visited animals to revealed set (they're already discovered)
      visitedAnimals.forEach(index => {
        if (levelAnimals[index]) {
          initialRevealed.add(levelAnimals[index].name.toLowerCase());
        }
      });
    }
    return initialRevealed;
  });
  
  // Create a set of available (visited) animal names for this level
  const availableAnimals = useMemo(() => {
    const available = new Set<string>();
    if (visitedAnimals.size > 0) {
      // Filter animals by level first
      const levelAnimals = animals.filter((animal: any) => 
        animal.animalType.toLowerCase() === levelName.toLowerCase()
      );
      // Add visited animals to available set
      visitedAnimals.forEach(index => {
        if (levelAnimals[index]) {
          available.add(levelAnimals[index].name.toLowerCase());
        }
      });
    }
    return available;
  }, [visitedAnimals, animals, levelName]);
  
  // State to control the flow: first silhouettes, then close modal
  const [allAnimalsRevealed, setAllAnimalsRevealed] = useState(false);
  
  // State for mission completion flow
  const [showCompleteButton, setShowCompleteButton] = useState(false);
  const [missionCompleted, setMissionCompleted] = useState(false);
  
  // State for locked animal modal
  const [showLockedModal, setShowLockedModal] = useState(false);
  const [clickedAnimalIndex, setClickedAnimalIndex] = useState<number>(0);
  
  // State for background loading
  const [backgroundLoaded, setBackgroundLoaded] = useState(false);
  
  // State for magnifying glass guide animation
  const [currentGuideIndex, setCurrentGuideIndex] = useState(0);
  const magnifyingGlassRotation = useRef(new Animated.Value(0)).current;
  const magnifyingGlassScale = useRef(new Animated.Value(1)).current;
  
  // Animation for mission completed stamp pulse
  const missionStampScale = useRef(new Animated.Value(1)).current;
  
  // Fade in animation for content
  const contentOpacity = useRef(new Animated.Value(0)).current;
  
  // Blur overlay fade animation
  const blurOpacity = useRef(new Animated.Value(0)).current;
  
  // Mission stamp fade animation (shows after blur)
  const stampOpacity = useRef(new Animated.Value(0)).current;

  // Initialize guide to first available unrevealed animal when screen mounts
  useEffect(() => {
    // Find first available animal
    const levelAnimals = animals.filter((animal: any) => 
      animal.animalType.toLowerCase() === levelName.toLowerCase()
    );
    
    let firstAvailableIndex = 0;
    for (let i = 0; i < levelAnimals.length; i++) {
      const animalKey = levelAnimals[i].name.toLowerCase();
      if (availableAnimals.has(animalKey)) {
        firstAvailableIndex = i;
        break;
      }
    }
    
    setCurrentGuideIndex(firstAvailableIndex);
  }, [availableAnimals, animals, levelName]);

  // Check if all available animals are already revealed (for pre-revealed animals)
  useEffect(() => {
    if (availableAnimals.size > 0) {
      const revealedAvailableCount = Array.from(revealedAnimals).filter(name => 
        availableAnimals.has(name)
      ).length;
      
      console.log('Effect check - Revealed available count:', revealedAvailableCount);
      console.log('Effect check - Total available animals:', availableAnimals.size);
      
      // Show button when there are available animals, but enable only when all are revealed
      if (!showCompleteButton) {
        console.log('Showing complete button (will be enabled when all animals revealed)...');
        setShowCompleteButton(true);
      }
    }
  }, [revealedAnimals, availableAnimals, showCompleteButton]);

  // Check if all animals in the level are revealed (for button state)
  const areAllAnimalsRevealed = useMemo(() => {
    const levelAnimals = animals.filter((animal: any) => 
      animal.animalType.toLowerCase() === levelName.toLowerCase()
    );
    
    if (levelAnimals.length === 0) {
      console.log('No animals in level, button disabled');
      return false;
    }
    
    const allRevealed = revealedAnimals.size === levelAnimals.length;
    console.log('Button state check - Revealed:', revealedAnimals.size, 'Total in level:', levelAnimals.length, 'All revealed:', allRevealed);
    console.log('Level animals:', levelAnimals.map(a => a.name));
    console.log('Revealed animals:', Array.from(revealedAnimals));
    
    return allRevealed;
  }, [revealedAnimals, animals, levelName]);

  // Fade in content after background loads
  useEffect(() => {
    if (backgroundLoaded) {
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [backgroundLoaded, contentOpacity]);

  // Handler for background image load
  const handleBackgroundLoad = () => {
    setBackgroundLoaded(true);
  };

  // Reset state when screen unmounts
  useEffect(() => {
    return () => {
      // Reset revealed animals when screen unmounts
      setRevealedAnimals(new Set());
      
      // Reset flow states
      setAllAnimalsRevealed(false);
      setShowCompleteButton(false);
      setMissionCompleted(false);
      
      // Reset magnifying glass guide
      setCurrentGuideIndex(0);
      magnifyingGlassRotation.setValue(0);
      magnifyingGlassScale.setValue(1);
      
      // Reset blur animation
      blurOpacity.setValue(0);
      
      // Reset stamp animation
      stampOpacity.setValue(0);
    };
  }, []);

  // Callback when all Arctic animals are revealed
  const handleAllAnimalsRevealed = () => {
    setAllAnimalsRevealed(true);
    setShowCompleteButton(true);
  };

  // Handler for completing the mission
  const handleCompleteMission = () => {
    setMissionCompleted(true);
    setShowCompleteButton(false);
    
    // Wait 5 seconds after stamp appears before calling completion callback
    setTimeout(() => {
      if (onComplete) {
        onComplete();
      }
    }, 5000); // 5 seconds delay
  };

  // Start mission stamp pulse animation when all animals are revealed
  useEffect(() => {
    if (missionCompleted) {
      // Play success sound when mission completed stamp appears
      try {
        const successPlayer = createAudioPlayer(require('../assets/sounds/other/success.mp3'));
        successPlayer.play();
        
        // Clean up sound when it finishes
        successPlayer.addListener('playbackStatusUpdate', (status: any) => {
          if (status.didJustFinish) {
            successPlayer.remove();
          }
        });
      } catch (error) {
        console.warn('Error playing success sound:', error);
      }

      // Sequence: First blur, then stamp appears
      const sequenceAnimation = Animated.sequence([
        // First fade in the blur
        Animated.timing(blurOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        // Then show the mission stamp after blur is visible
        Animated.timing(stampOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]);

      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(missionStampScale, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(missionStampScale, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );

      // Start the sequence, then start pulsing
      sequenceAnimation.start(() => {
        pulseAnimation.start();
      });
      
      return () => {
        sequenceAnimation.stop();
        pulseAnimation.stop();
      };
    }
  }, [missionCompleted, missionStampScale, blurOpacity, stampOpacity]);

  const levelAnimals = animals.filter((animal: any) => 
    animal.animalType.toLowerCase() === levelName.toLowerCase()
  );

  // Background image mapping for different levels
  const getBackgroundImage = (levelName: string) => {
    // Use the same discover background for all levels
    return require('../assets/images/discover/discover_bg.png');
  };

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        source={getBackgroundImage(levelName)}
        resizeMode="cover"
        onLoad={handleBackgroundLoad}
        style={{
          flex: 1,
          width: '100%',
          height: isTablet ? '100%' : '150%',
        }}
        imageStyle={{
          resizeMode: isMobile ? 'stretch' : 'cover',
        }}
      >
      <Animated.View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 20,
        paddingHorizontal: isTablet ? 40 : 20,
        opacity: contentOpacity,
      }}>
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: isTablet ? 20 : 10,
          marginBottom: isTablet ? 10 : 15,
          paddingHorizontal: 20,
          position: 'relative',
          width: '100%',
        }}>
          <View style={{
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            width: '100%',
          }}>
            <Text style={{
              fontSize: isTablet ? 32 : 24, // Larger text for full screen
              fontFamily: Platform.OS === 'ios' ? 'Marker Felt' : 'cursive', // Handwritten font
              fontWeight: Platform.OS === 'ios' ? 'normal' : 'bold',
              color: 'black', // Black text for better contrast
              textAlign: 'center',
              textShadowColor: 'rgba(255,255,255,0.8)',
              textShadowOffset: {width: 2, height: 2},
              textShadowRadius: 4,
              lineHeight: isTablet ? 38 : 28,
              marginTop: isTablet ? -70 : -70,
              paddingTop: 30,
            }}>
              {levelName} mission notebook!
            </Text>
                          <Text style={{
                fontSize: isTablet ? 20 : 20,
                fontFamily: Platform.OS === 'ios' ? 'Marker Felt' : 'cursive',
                fontWeight: Platform.OS === 'ios' ? 'normal' : 'bold',
                color: 'black',
                textAlign: 'center',
                textShadowColor: 'rgba(255,255,255,0.8)',
                textShadowOffset: {width: 1, height: 1},
                textShadowRadius: 2,
                lineHeight: isTablet ? 38 : 50,
                marginBottom: 5,
                marginTop: isTablet ? 10 : 0,
              }}>
                {levelAnimals.length} animals to discover
              </Text>
          </View>
          
          {/* Home Button */}
          <TouchableOpacity
            onPress={onBackToMenu}
            style={{
              position: 'absolute',
              left: isTablet ? -20 : 0,
              top: isTablet ? -50 : -30,
              backgroundColor: 'orange',
              paddingVertical: isTablet ? 15 : 12,
              paddingHorizontal: isTablet ? 22 : 18,
              borderRadius: isTablet ? 30 : 25,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              elevation: 3,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 3,
              zIndex: 10,
            }}
          >
            <Ionicons name="home" size={isTablet ? 35 : 25} color="#fff" />
          </TouchableOpacity>
          
          {/* Back to Level Button */}
          <TouchableOpacity
            onPress={() => onBackToLevel?.()}
            style={{
              position: 'absolute',
              left: isTablet ? -20 : 0,
              top: isTablet ? 30 : 30,
              marginBottom: 10,
              backgroundColor: '#2196F3', // Blue color
              paddingVertical: isTablet ? 15 : 12,
              paddingHorizontal: isTablet ? 22 : 18,
              borderRadius: isTablet ? 30 : 25,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              elevation: 3,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 3,
              zIndex: 10,
            }}
          >
            <Ionicons name="arrow-back" size={isTablet ? 35 : 25} color="#fff" />
          </TouchableOpacity>
        </View>


        
        {/* Complete Mission Button - appears when all animals are revealed */}
        {showCompleteButton && (
          <View style={{
            alignItems: 'center',
            marginTop: 10,
            marginBottom: 0,
            zIndex: 10,
          }}>
            <TouchableOpacity
              onPress={areAllAnimalsRevealed ? handleCompleteMission : undefined}
              disabled={!areAllAnimalsRevealed}
              style={{
                backgroundColor: areAllAnimalsRevealed ? '#4CAF50' : '#cccccc', // Green when enabled, gray when disabled
                paddingVertical: isTablet ? 18 : 15,
                paddingHorizontal: isTablet ? 30 : 25,
                borderRadius: isTablet ? 35 : 30,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                elevation: areAllAnimalsRevealed ? 5 : 2,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: areAllAnimalsRevealed ? 3 : 1 },
                shadowOpacity: areAllAnimalsRevealed ? 0.4 : 0.2,
                shadowRadius: areAllAnimalsRevealed ? 5 : 2,
                borderWidth: 3,
                borderColor: '#fff',
              }}
            >
              <Ionicons 
                name={areAllAnimalsRevealed ? "checkmark-circle" : "lock-closed"} 
                size={isTablet ? 28 : 24} 
                color={areAllAnimalsRevealed ? "#fff" : "#999"} 
                style={{ marginRight: 8 }} 
              />
              <Text style={{
                color: areAllAnimalsRevealed ? '#fff' : '#999',
                fontSize: isTablet ? 22 : 18,
                fontWeight: 'bold',
                fontFamily: Platform.OS === 'ios' ? 'Marker Felt' : 'cursive',
              }}>
                {areAllAnimalsRevealed ? 'Complete Mission!' : 'Complete Mission'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Level Animals Grid */}
        <ScrollView
          style={{ 
            width: '80%',
            marginTop: isMobile ? 20 : 30,
          }}
          contentContainerStyle={{
            paddingBottom: 10,
            paddingHorizontal: isTablet ? 40 : 20,
          }}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={false}
        >
          <View style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center',
            gap: isTablet ? 20 : (isMobile ? 15 : 12), // Larger gaps to force 3 per row on mobile
            paddingVertical: 10,
          }}>
            <LevelAnimalGrid 
              animals={animals}
              levelName={levelName || 'Arctic'}
              isTablet={isTablet}
              isMobile={isMobile}
              revealedAnimals={revealedAnimals}
              setRevealedAnimals={setRevealedAnimals}
              onAllRevealed={handleAllAnimalsRevealed}
              currentGuideIndex={currentGuideIndex}
              setCurrentGuideIndex={setCurrentGuideIndex}
              magnifyingGlassRotation={magnifyingGlassRotation}
              magnifyingGlassScale={magnifyingGlassScale}
              availableAnimals={availableAnimals}
              setShowLockedModal={setShowLockedModal}
              setClickedAnimalIndex={setClickedAnimalIndex}
            />
          </View>
        </ScrollView>
        
        {/* Blur overlay when mission is completed */}
        {missionCompleted && (
          <Animated.View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999,
              opacity: blurOpacity,
            }}
          >
            <BlurView
              intensity={80}
              style={{
                flex: 1,
              }}
            />
          </Animated.View>
        )}

        {/* Mission Completed Stamp - centered and appears after blur */}
        {missionCompleted && (
          <Animated.View style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            opacity: stampOpacity,
            transform: [
              { scale: missionStampScale }
            ],
          }}>
            <Image
              source={require('../assets/images/mission-completed.png')}
              style={{
                width: isTablet ? 300 : 120,
                height: isTablet ? 300 : 120,
              }}
              resizeMode="contain"
            />
          </Animated.View>
        )}
      </Animated.View>
      
      {/* Loading indicator while background loads */}
      {!backgroundLoaded && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(255,255,255,0.9)',
          zIndex: 999,
        }}>
          <ActivityIndicator size="large" color="#666" />
        </View>
      )}
      
      {/* Locked Animal Modal */}
      <Modal
        visible={showLockedModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLockedModal(false)}
      >
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.5)',
        }}>
          <View style={{
            backgroundColor: 'white',
            borderRadius: 20,
            padding: 30,
            margin: 20,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5,
            maxWidth: isTablet ? 400 : 300,
          }}>
            <View style={{
              backgroundColor: 'rgba(255, 165, 0, 0.9)',
              borderRadius: 30,
              width: 60,
              height: 60,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 15,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 3,
              elevation: 3,
            }}>
              <Ionicons name="lock-closed" size={32} color="#fff" />
            </View>
            
            <Text style={{
              fontSize: isTablet ? 24 : 20,
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: 10,
              color: '#333',
            }}>
              Animal Locked!
            </Text>
            
            <Text style={{
              fontSize: isTablet ? 18 : 16,
              textAlign: 'center',
              marginBottom: 25,
              color: '#666',
              lineHeight: 22,
            }}>
              Go back to the level to discover this animal first.
            </Text>
            
            <View style={{ flexDirection: 'row', gap: 15 }}>
              <TouchableOpacity
                onPress={() => setShowLockedModal(false)}
                style={{
                  backgroundColor: '#ccc',
                  paddingVertical: 12,
                  paddingHorizontal: 20,
                  borderRadius: 25,
                  minWidth: 80,
                }}
              >
                <Text style={{
                  color: '#333',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  fontSize: 16,
                }}>
                  Cancel
                </Text>
              </TouchableOpacity>
              
                                            <TouchableOpacity
                 onPress={() => {
                   setShowLockedModal(false);
                   onBackToLevel?.(clickedAnimalIndex);
                 }}
                 style={{
                   backgroundColor: 'orange',
                   paddingVertical: 12,
                   paddingHorizontal: 20,
                   borderRadius: 25,
                   minWidth: 80,
                   flexDirection: 'row',
                   alignItems: 'center',
                   justifyContent: 'center',
                   shadowColor: '#000',
                   shadowOffset: { width: 0, height: 2 },
                   shadowOpacity: 0.3,
                   shadowRadius: 3,
                   elevation: 3,
                 }}
               >
                 <Ionicons name="arrow-back" size={18} color="white" style={{ marginRight: 6 }} />
                 <Text style={{
                   color: 'white',
                   fontWeight: 'bold',
                   textAlign: 'center',
                   fontSize: 16,
                 }}>
                   Go Back
                 </Text>
               </TouchableOpacity>
                         </View>
           </View>
         </View>
       </Modal>
     </ImageBackground>
     </View>
  );
};

export default DiscoverScreen; 