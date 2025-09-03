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
import { useLevelCompletion } from '../hooks/useLevelCompletion';
import { useLocalization } from '../hooks/useLocalization';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Fallback to using the translated name for now - this will restore the original behavior 
// but keep the structure for the fix once we get the correct mappings
const getAnimalEnglishKey = (animal: any): string => {
  // For now, let's just use the translated name lowercased as the key
  // This should at least make names and images consistent again
  const translatedKey = animal.name.toLowerCase();
  
  // Create a mapping from common translated names to English image keys
  // This is a temporary workaround - we need the actual ID mappings
  const nameToKeyMap: { [key: string]: string } = {
    // English (these should work as-is)
    'dog': 'dog', 'cat': 'cat', 'chicken': 'chicken', 'chick': 'chick',
    'donkey': 'donkey', 'cow': 'cow', 'duck': 'duck', 'goat': 'goat',
    'goose': 'goose', 'horse': 'horse', 'llama': 'llama', 'pig': 'pig',
    'rabbit': 'rabbit', 'rooster': 'rooster', 'sheep': 'sheep', 'turkey': 'turkey',
    
    // Russian animals - using exact translations from strings.ts
    // Farm animals
    'собака': 'dog', 'кошка': 'cat', 'kошка': 'cat', 'курица': 'chicken', 'цыпленок': 'chick',
    'осел': 'donkey', 'корова': 'cow', 'утка': 'duck', 'коза': 'goat',
    'гусь': 'goose', 'лошадь': 'horse', 'лама': 'llama', 'свинья': 'pig',
    'кролик': 'rabbit', 'петух': 'rooster', 'овца': 'sheep', 'индейка': 'turkey',
    'коала': 'koala',
    
    // Arctic animals 
    'белый медведь': 'white bear', 'белая лиса': 'white fox',
    'северный олень': 'reindeer', 'тюлень': 'seal', 'полярная сова': 'snow owl',
    'пингвин': 'penguin', 'морж': 'walrus',
    
    // Forest animals
    'барсук': 'badger', 'лиса': 'fox', 'медведь': 'bear', 'енот': 'raccoon',
    'белка': 'squirrel', 'ёж': 'hedgehog', 'сова': 'owl', 'волк': 'wolf',
    'олень': 'deer', 'лось': 'moose', 'мышь': 'mouse', 'бобр': 'beaver',
    'кабан': 'boar', 'летучая мышь': 'bat', 'выдра': 'otter', 'скунс': 'skunk',
    
    // Ocean animals
    'краб': 'crab', 'дельфин': 'dolphin', 'рыба': 'fish', 'медуза': 'jellyfish',
    'омар': 'lobster', 'осьминог': 'octopus', 'морская черепаха': 'sea turtle',
    'морской конек': 'seahorse', 'акула': 'shark', 'креветка': 'shrimp',
    'морская звезда': 'starfish', 'скат': 'stingray', 'кит': 'whale',
    
    // Desert animals  
    'верблюд': 'camel', 'пустынная черепаха': 'desert tortoise', 'фенек': 'fennec fox',
    'игуана': 'iguana', 'шакал': 'jackal', 'тушканчик': 'jerboa',
    'сурикат': 'meerkat', 'орикс': 'oryx', 'песчаная кошка': 'sand cat', 'скорпион': 'scorpion',
    'каракал': 'caracal', 'ящерица': 'lizard',
    
    // Insects
    'муравей': 'ant', 'пчела': 'bee', 'жук': 'beetle', 'бабочка': 'butterfly',
    'сверчок': 'cricket', 'гусеница': 'caterpillar', 'таракан': 'cockroach',
    'стрекоза': 'dragonfly', 'светлячок': 'firefly', 'муха': 'fly',
    'кузнечик': 'grasshopper', 'божья коровка': 'ladybug', 'мантис': 'mantis',
    'комар': 'mosquito', 'улитка': 'snail', 'паук': 'spider', 'оса': 'wasp', 'червь': 'worm',
    
    // Savannah animals
    'слон': 'elephant', 'жираф': 'giraffe', 'лев': 'lion', 'зебра': 'zebra',
    'носорог': 'rhinoceros', 'бегемот': 'hippopotamus', 'гепард': 'cheetah',
    'гиена': 'hyena', 'антилопа': 'antelope', 'бизон': 'bison',
    'леопард': 'leopard', 'обезьяна': 'monkey', 'дикий кабан': 'wild boar',
    
    // Jungle animals
    'тигр': 'tiger', 'ягуар': 'jaguar', 'горилла': 'gorilla', 'шимпанзе': 'chimpanzee',
    'орангутан': 'orangutan', 'лемур': 'lemur', 'ленивец': 'sloth', 'хамелеон': 'chameleon',
    'лягушка': 'frog', 'крокодил': 'crocodile', 'панда': 'panda', 'змея': 'snake',
    'черепаха': 'turtle', 'муравьед': 'ant eater', 'азиатский слон': 'asian elephant',
    'бенгальский тигр': 'bengal tiger', 'чёрная пантера': 'black panther',
    'капибара': 'capybara', 'кобра': 'cobra', 'рысь': 'lynx', 'мангуст': 'mongoose',
    
    // Birds
    'орел': 'eagle', 'голубь': 'dove', 'канарейка': 'canary', 'фламинго': 'flamingo',
    'страус': 'ostrich', 'попугай': 'parrot', 'павлин': 'peacock', 'пеликан': 'pelican',
    'ворон': 'raven', 'чайка': 'seagull', 'воробей': 'sparrow', 'аист': 'stork',
    'лебедь': 'swan', 'тукан': 'toucan', 'дятел': 'woodpecker',
    
    // Turkish animals - using exact translations from strings.ts
    // Farm animals
    'köpek': 'dog', 'kedi': 'cat', 'tavuk': 'chicken', 'civciv': 'chick',
    'eşek': 'donkey', 'inek': 'cow', 'ördek': 'duck', 'keçi': 'goat',
    'kaz': 'goose', 'at': 'horse', 'lama': 'llama', 'domuz': 'pig',
    'tavşan': 'rabbit', 'horoz': 'rooster', 'koyun': 'sheep', 'hindi': 'turkey',
    
    // Arctic animals 
    'beyaz ayı': 'white bear', 'kutup tilkisi': 'white fox',
    'ren geyiği': 'reindeer', 'fok': 'seal', 'kar baykuşu': 'snow owl',
    'penguen': 'penguin', 'deniz aygırı': 'walrus', // Note: strings.ts has walrus as "deniz aygırı"
    
    // Forest animals
    'porsuk': 'badger', 'tilki': 'fox', 'ayı': 'bear', 'rakum': 'raccoon',
    'sincap': 'squirrel', 'kirpi': 'hedgehog', 'baykuş': 'owl', 'kurt': 'wolf',
    'geyik': 'deer', 'alageyik': 'moose', 'fare': 'mouse', 'kunduz': 'beaver',
    'yaban domuzu': 'boar', 'yarasa': 'bat', 'su samuru': 'otter', 'kedi köpeği': 'skunk',
    'koala': 'koala',
    
    // Ocean animals
    'yengeç': 'crab', 'yunus': 'dolphin', 'balık': 'fish', 'denizanası': 'jellyfish',
    'istakoz': 'lobster', 'ahtapot': 'octopus', 'deniz kaplumbağası': 'sea turtle',
    'denizatı': 'seahorse', 'köpekbalığı': 'shark', 'karides': 'shrimp',
    'deniz yıldızı': 'starfish', 'vatoz': 'stingray', 'balina': 'whale',
    
    // Desert animals
    'deve': 'camel', 'çöl kaplumbağası': 'desert tortoise', 'fennek tilkisi': 'fennec fox',
    'iguana': 'iguana', 'i̇guana': 'iguana', 'ıguana': 'iguana', 'çakal': 'jackal', 'çöl faresi': 'jerboa',
    'surikat': 'meerkat', 'oryx': 'oryx', 'kum kedisi': 'sand cat',
    'akrep': 'scorpion', 'karakal': 'caracal', 'kertenkele': 'lizard',
    
    // Insects
    'karınca': 'ant', 'arı': 'bee', 'kelebek': 'butterfly', 'böcek': 'beetle',
    'tırtıl': 'caterpillar', 'hamam böceği': 'cockroach', 'yusufçuk': 'dragonfly',
    'sinek': 'fly', 'çekirge': 'grasshopper', 'uğur böceği': 'ladybug',
    'mantis': 'mantis', 'sivrisinek': 'mosquito', 'salyangoz': 'snail',
    'örümcek': 'spider', 'sürüngen': 'worm', 'eşek arısı': 'wasp',
    'cırcır böceği': 'cricket', 'ateşböceği': 'firefly',
    
    // Savannah animals
    'fil': 'elephant', 'zürafa': 'giraffe', 'aslan': 'lion', 'zebra': 'zebra',
    'gergedan': 'rhinoceros', 'su aygırı': 'hippopotamus', 'çita': 'cheetah',
    'sırtlan': 'hyena', 'antilop': 'antelope', 'bizon': 'bison',
    'leopar': 'leopard', 'maymun': 'monkey',
    
    // Jungle animals
    'kaplan': 'tiger', 'siyah panter': 'black panther', 'jaguar': 'jaguar',
    'goril': 'gorilla', 'şempanze': 'chimpanzee', 'orangutan': 'orangutan',
    'lemur': 'lemur', 'tembel hayvan': 'sloth', 'bukalemun': 'chameleon',
    'kurbağa': 'frog', 'timsah': 'crocodile', 'panda': 'panda',
    'karınca yiyen': 'ant eater', 'asya fili': 'asian elephant',
    'bengal kaplanı': 'bengal tiger', 'kapibara': 'capybara',
    'yılan': 'snake', 'kaplumbağa': 'turtle', 'kobra': 'cobra',
    'vaşak': 'lynx', 'mangust': 'mongoose',
    
    // Birds
    'kartal': 'eagle', 'güvercin': 'dove', 'kanarya': 'canary',
    'flamingo': 'flamingo', 'devekuşu': 'ostrich', 'papağan': 'parrot',
    'pelikan': 'pelican', 'kuzgun': 'raven', 'martı': 'seagull',
    'serçe': 'sparrow', 'leylek': 'stork', 'kuğu': 'swan',
    'tukan': 'toucan', 'ağaçkakan': 'woodpecker', 'tavus kuşu': 'peacock',
    
    // English animal names (no duplicates)
    'white bear': 'white bear', 'white fox': 'white fox', 'reindeer': 'reindeer',
    'seal': 'seal', 'snow owl': 'snow owl', 'penguin': 'penguin', 'walrus': 'walrus',
  };
  
  // Try to find a mapping, fallback to the translated key, then fallback to 'cat'
  const result = nameToKeyMap[translatedKey] || translatedKey || 'cat';
  
  // Debug specific mapping issues
  if (translatedKey.includes('кошк') || translatedKey.includes('кошка') || translatedKey.includes('cat')) {
    console.log(`🔍 CAT MAPPING DEBUG: "${translatedKey}" → "${result}"`);
    console.log('Available mappings for cats:', Object.keys(nameToKeyMap).filter(k => k.includes('кошк') || k.includes('кошка') || k.includes('cat')));
  }
  
  return result;
};

interface DiscoverScreenProps {
  animals?: any[];
  levelName?: string;
  onComplete?: () => void;
  onBackToMenu?: () => void;
  onBackToLevel?: (animalIndex?: number) => void;
  // onResetLevel?: () => void;
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
  onPlayAnimalSound: (source: any) => void;
}> = ({ animals, levelName, isTablet, isMobile, revealedAnimals, setRevealedAnimals, onAllRevealed, currentGuideIndex, setCurrentGuideIndex, magnifyingGlassRotation, magnifyingGlassScale, availableAnimals, setShowLockedModal, setClickedAnimalIndex, onPlayAnimalSound }) => {
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



  // Static mapping of English keys to their silhouette images
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
    if (currentAnimal && revealedAnimals.has(getAnimalEnglishKey(currentAnimal))) {
      // Find the next unrevealed available animal
      let nextIndex = -1;
              for (let i = 0; i < levelAnimals.length; i++) {
          const animalKey = levelAnimals[i].name.toLowerCase();
          const englishKey = getAnimalEnglishKey(levelAnimals[i]);
          const isAvailable = availableAnimals.has(animalKey);
          const isRevealed = revealedAnimals.has(englishKey);
        
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
        // Use English key for consistency across all operations
        const englishKey = getAnimalEnglishKey(animal);
        const animalKey = animal.name.toLowerCase(); // Keep for backward compatibility
        
        // Use English key for revealed/available tracking (consistent across languages)
        const isRevealed = revealedAnimals.has(englishKey);
        const isAvailable = availableAnimals.has(animalKey); // Keep using translated name for this
        
        // Use English key for image lookups (works across all languages)
        const silhouetteImage = silhouetteImageMap[englishKey];
        const realImage = stillImageMap[englishKey];
        const displayImage = isRevealed ? realImage : silhouetteImage;
        

        
        // Get the animation value for this specific animal card
        const animValue = animalAnimRefs.current[index];
        
        const handleAnimalPress = () => {
          // If animal is not available, show locked modal
          if (!isAvailable) {
            setClickedAnimalIndex(index);
            setShowLockedModal(true);
            return;
          }
          
          // Play only the animal sound (no label), stopping any previous one
          if (animal?.sound) {
            onPlayAnimalSound(animal.sound);
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
          
          // Reveal the animal if not revealed yet (stays revealed, no toggling back)
          setRevealedAnimals(prev => {
            const newSet = new Set(prev);
            const englishKey = getAnimalEnglishKey(animal);
            
            if (!newSet.has(englishKey)) {
              newSet.add(englishKey); // Show real image
              
              // Check if this was the last available animal to reveal
              // Count how many available animals have been revealed
              const revealedAvailableCount = Array.from(newSet).filter(englishKeyRevealed => {
                // Convert available animals (which use translated names) to English keys for comparison
                const availableEnglishKeys = new Set();
                levelAnimals.forEach(lvlAnimal => {
                  if (availableAnimals.has(lvlAnimal.name.toLowerCase())) {
                    availableEnglishKeys.add(getAnimalEnglishKey(lvlAnimal));
                  }
                });
                return availableEnglishKeys.has(englishKeyRevealed);
              }).length;
              
              console.log('Revealed available count:', revealedAvailableCount);
              console.log('Total available animals:', availableAnimals.size);
              console.log('Available animals:', Array.from(availableAnimals));
              console.log('All revealed animals:', Array.from(newSet));
              
              // Convert available animals count to match English key counting
              const availableEnglishKeysCount = new Set();
              levelAnimals.forEach(lvlAnimal => {
                if (availableAnimals.has(lvlAnimal.name.toLowerCase())) {
                  availableEnglishKeysCount.add(getAnimalEnglishKey(lvlAnimal));
                }
              });
              
              if (revealedAvailableCount === availableEnglishKeysCount.size && availableEnglishKeysCount.size > 0 && onAllRevealed) {
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
  // onResetLevel,
  visitedAnimals = new Set(),
  currentAnimalIndex = 0
}) => {
  const { markLevelCompleted, unmarkLevelCompleted, isLevelCompleted } = useLevelCompletion();
  const { t } = useLocalization();
  const { width: screenW, height: screenH } = useWindowDimensions();
  const isLandscape = screenW > screenH;
  const isMobile = Math.min(screenW, screenH) < 768;
  const isTablet = Math.min(screenW, screenH) >= 768 && Math.max(screenW, screenH) >= 1024;
  // Single shared player to avoid overlapping sounds
  const currentAnimalPlayerRef = useRef<any | null>(null);
  const activePlayersRef = useRef<Set<any>>(new Set());
  const playTokenRef = useRef<number>(0);

  const playAnimalSound = (source: any) => {
    try {
      // Stop and remove ALL existing players to be absolutely sure
      if (activePlayersRef.current.size > 0) {
        for (const pl of Array.from(activePlayersRef.current)) {
          try { pl.pause?.(); } catch {}
          try { pl.stop?.(); } catch {}
          try { pl.volume = 0; } catch {}
          try { pl.remove?.(); } catch {}
          activePlayersRef.current.delete(pl);
        }
      }
      if (currentAnimalPlayerRef.current) {
        try { currentAnimalPlayerRef.current.pause?.(); } catch {}
        try { currentAnimalPlayerRef.current.stop?.(); } catch {}
        try { currentAnimalPlayerRef.current.volume = 0; } catch {}
        try { currentAnimalPlayerRef.current.remove?.(); } catch {}
        currentAnimalPlayerRef.current = null;
      }
      
      const token = ++playTokenRef.current;
      setTimeout(() => {
        if (playTokenRef.current !== token) return;
        
        try {
          const p = createAudioPlayer(source);
          currentAnimalPlayerRef.current = p;
          activePlayersRef.current.add(p);
          
          // Add listener before playing
          p.addListener('playbackStatusUpdate', (status: any) => {
            if (status?.didJustFinish) {
              try { p.remove(); } catch {}
              if (currentAnimalPlayerRef.current === p) {
                currentAnimalPlayerRef.current = null;
              }
              activePlayersRef.current.delete(p);
            }
          });
          
          // Play after setting up listener
          p.play();
        } catch (error) {
          console.warn('Error creating or playing animal sound:', error);
        }
      }, 50);
    } catch (error) {
      console.warn('Error playing animal sound:', error);
    }
  };

  // Ensure we stop any playing animal sound when unmounting DiscoverScreen
  useEffect(() => {
    return () => {
      // Stop all known players on unmount
      for (const pl of Array.from(activePlayersRef.current)) {
        try { pl.pause?.(); } catch {}
        try { pl.stop?.(); } catch {}
        try { pl.remove?.(); } catch {}
        activePlayersRef.current.delete(pl);
      }
      if (currentAnimalPlayerRef.current) {
        try { currentAnimalPlayerRef.current.pause?.(); } catch {}
        try { currentAnimalPlayerRef.current.stop?.(); } catch {}
        try { currentAnimalPlayerRef.current.remove?.(); } catch {}
        currentAnimalPlayerRef.current = null;
      }
    };
  }, []);


  // State to track which animals have been revealed (show real image instead of silhouette)
  // Initialize with visited animals already revealed - using English keys for consistency
  const [revealedAnimals, setRevealedAnimals] = useState<Set<string>>(() => {
    const initialRevealed = new Set<string>();
    if (visitedAnimals.size > 0) {
      // Filter animals by level first
      const levelAnimals = animals.filter((animal: any) => 
        animal.animalType.toLowerCase() === levelName.toLowerCase()
      );
      // Add visited animals to revealed set using English keys (they're already discovered)
      visitedAnimals.forEach(index => {
        if (levelAnimals[index]) {
          const englishKey = getAnimalEnglishKey(levelAnimals[index]);
          initialRevealed.add(englishKey);
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
  // const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);
  
  // State for locked animal modal
  const [showLockedModal, setShowLockedModal] = useState(false);
  const [clickedAnimalIndex, setClickedAnimalIndex] = useState<number>(0);
  
  // State for background loading
  const [backgroundLoaded, setBackgroundLoaded] = useState(false);
  
  // State for magnifying glass guide animation
  const [currentGuideIndex, setCurrentGuideIndex] = useState(0);
  const [magnifyingGlassRotation] = useState(() => new Animated.Value(0));
  const [magnifyingGlassScale] = useState(() => new Animated.Value(1));
  
  // Animation for mission completed stamp pulse
  const [missionStampScale] = useState(() => new Animated.Value(1));
  
  // Fade in animation for content
  const [contentOpacity] = useState(() => new Animated.Value(0));
  
  // Blur overlay fade animation
  const [blurOpacity] = useState(() => new Animated.Value(0));
  
  // Mission stamp fade animation (shows after blur)
  const [stampOpacity] = useState(() => new Animated.Value(0));
  
  // Complete mission button bounce animation
  const [buttonBounceScale] = useState(() => new Animated.Value(1));
  
  // Hand pop animations flanking the button
  const [leftHandScale] = useState(() => new Animated.Value(1));
  const [rightHandScale] = useState(() => new Animated.Value(1));

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
  const handleCompleteMission = async () => {
    setMissionCompleted(true);
    setShowCompleteButton(false);
    
    // Mark level as completed immediately
    if (levelName) {
      try {
        await markLevelCompleted(levelName);
        console.log(`Level ${levelName} marked as completed!`);
      } catch (error) {
        console.warn('Error marking level as completed:', error);
      }
    }
    
    // Wait 3 seconds after stamp appears, then call completion callback to show congrats modal
    setTimeout(() => {
      if (onComplete) {
        onComplete(); // This will show the congrats modal, which can then go to home
      }
    }, 3000); // Reduced to 3 seconds
  };

  // Reset only this level via parent handler if provided, otherwise fallback to local reset and navigate back
  // Removed reset mission handler and UI

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

  // Flash and bounce animation for complete mission button when enabled
  useEffect(() => {
    if (areAllAnimalsRevealed && showCompleteButton) {
       // Hand pop animations (left and right) with slight phase offset
       const leftHandPop = Animated.loop(
         Animated.sequence([
           Animated.timing(leftHandScale, {
             toValue: 1.25,
             duration: 500,
             useNativeDriver: true,
           }),
           Animated.timing(leftHandScale, {
             toValue: 1,
             duration: 500,
             useNativeDriver: true,
           }),
           Animated.delay(200),
         ])
       );
 
       const rightHandPop = Animated.loop(
         Animated.sequence([
           Animated.delay(250),
           Animated.timing(rightHandScale, {
             toValue: 1.25,
             duration: 500,
             useNativeDriver: true,
           }),
           Animated.timing(rightHandScale, {
             toValue: 1,
             duration: 500,
             useNativeDriver: true,
           }),
           Animated.delay(200),
         ])
       );
 
       leftHandPop.start();
       rightHandPop.start();
 
       return () => {
         leftHandPop.stop();
         rightHandPop.stop();
         leftHandScale.setValue(1);
         rightHandScale.setValue(1);
       };
     } else {
       // Reset animations when button is disabled
       leftHandScale.setValue(1);
       rightHandScale.setValue(1);
     }
  }, [areAllAnimalsRevealed, showCompleteButton, leftHandScale, rightHandScale]);

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
              {t('missionNotebook').replace('{level}', t(levelName.toLowerCase()))}
            </Text>
                          <Text style={{
                fontSize: isTablet ? 20 : 20,
                fontFamily: Platform.OS === 'ios' ? 'Marker Felt' : 'cursive',
                fontWeight: Platform.OS === 'ios' ? 'normal' : 'bold',
                color: (missionCompleted || isLevelCompleted(levelName || '')) ? '#4CAF50' : 'black', // Green when mission completed
                textAlign: 'center',
                textShadowColor: 'rgba(255,255,255,0.8)',
                textShadowOffset: {width: 1, height: 1},
                textShadowRadius: 2,
                lineHeight: isTablet ? 38 : 50,
                marginBottom: 5,
                marginTop: isTablet ? 10 : 0,
              }}>
                {(missionCompleted || isLevelCompleted(levelName || '')) ? t('missionComplete') : t('animalsToDiscover').replace('{count}', levelAnimals.length.toString())}
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


        
        {/* Complete Mission Button - appears when all animals are revealed, hidden if mission is completed or already completed */}
        {showCompleteButton && !missionCompleted && !isLevelCompleted(levelName || '') && (
          <View style={{
            alignItems: 'center',
            marginTop: 10,
            marginBottom: 0,
            zIndex: 10,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <View pointerEvents="none">
                <Animated.Image
                  source={require('../assets/images/hand.png')}
                  style={{
                    width: isTablet ? 60 : 40,
                    height: isTablet ? 60 : 40,
                    marginRight: isTablet ? 12 : 8,
                    transform: [{ scale: leftHandScale }, { rotate: '-10deg' }],
                  }}
                  resizeMode="contain"
                />
              </View>
              <View>
                <TouchableOpacity
                  onPress={areAllAnimalsRevealed ? handleCompleteMission : undefined}
                  disabled={!areAllAnimalsRevealed}
                  style={{
                    backgroundColor: areAllAnimalsRevealed ? '#FF4500' : '#cccccc', // Bright orange-red when enabled for maximum attention
                    paddingVertical: isTablet ? 22 : 18, // Larger padding for bigger button
                    paddingHorizontal: isTablet ? 40 : 30, // Wider button
                    borderRadius: isTablet ? 40 : 35, // Bigger border radius
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    elevation: areAllAnimalsRevealed ? 8 : 2, // Higher elevation for more dramatic shadow
                    shadowColor: areAllAnimalsRevealed ? '#FF4500' : '#000', // Colored shadow when enabled
                    shadowOffset: { width: 0, height: areAllAnimalsRevealed ? 5 : 1 },
                    shadowOpacity: areAllAnimalsRevealed ? 0.6 : 0.2, // More dramatic shadow
                    shadowRadius: areAllAnimalsRevealed ? 8 : 2,
                    borderWidth: areAllAnimalsRevealed ? 4 : 3, // Thicker border when enabled
                    borderColor: areAllAnimalsRevealed ? '#FFD700' : '#fff', // Gold border when enabled
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
                    fontSize: isTablet ? 26 : 20, // Larger text
                    fontWeight: 'bold',
                    fontFamily: Platform.OS === 'ios' ? 'Marker Felt' : 'cursive',
                    textShadowColor: areAllAnimalsRevealed ? 'rgba(0,0,0,0.5)' : 'transparent', // Text shadow when enabled
                    textShadowOffset: {width: 2, height: 2},
                    textShadowRadius: 3,
                  }}>
                    {areAllAnimalsRevealed ? t('completeMissionCelebration') : t('completeMission')}
                  </Text>
                </TouchableOpacity>
              </View>
              <View pointerEvents="none">
                <Animated.Image
                  source={require('../assets/images/hand.png')}
                  style={{
                    width: isTablet ? 60 : 40,
                    height: isTablet ? 60 : 40,
                    marginLeft: isTablet ? 12 : 8,
                    transform: [{ scaleX: -1 }, { scale: rightHandScale }, { rotate: '10deg' }],
                  }}
                  resizeMode="contain"
                />
              </View>
            </View>
          </View>
        )}

        {/* Reset Mission section removed */}

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
               onPlayAnimalSound={playAnimalSound}
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
            <View
              style={{
                paddingVertical: isTablet ? 24 : 14,
                paddingHorizontal: isTablet ? 36 : 20,
                borderWidth: isTablet ? 8 : 5,
                borderColor: '#D32F2F',
                borderStyle: 'dashed',
                borderRadius: 18,
                backgroundColor: 'rgba(255,255,255,0.9)',
                transform: [{ rotate: '-12deg' }],
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 6,
                elevation: 8,
              }}
            >
              <Text
                style={{
                  color: '#D32F2F',
                  fontSize: isTablet ? 36 : 20,
                  fontWeight: '900',
                  letterSpacing: 2,
                  textTransform: 'uppercase',
                  textAlign: 'center',
                  textShadowColor: 'rgba(0,0,0,0.15)',
                  textShadowOffset: { width: 1, height: 1 },
                  textShadowRadius: 2,
                }}
              >
                {t('missionComplete')}
              </Text>
            </View>

            {/* Reset Mission Button removed */}
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
              {t('animalLocked')}
            </Text>
            
            <Text style={{
              fontSize: isTablet ? 18 : 16,
              textAlign: 'center',
              marginBottom: 25,
              color: '#666',
              lineHeight: 22,
            }}>
              {t('unlockAnimalMessage')}
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
                  {t('cancel')}
                </Text>
              </TouchableOpacity>
              
                <TouchableOpacity
                 onPress={() => {
                   setShowLockedModal(false);
                   // Navigate to the first unseen animal in this level
                   let firstUnseenIndex: number | undefined = undefined;
                   for (let i = 0; i < animals.length; i++) {
                     if (!visitedAnimals.has(i)) {
                       firstUnseenIndex = i;
                       break;
                     }
                   }
                   onBackToLevel?.(firstUnseenIndex);
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
                   {t('goBack')}
                 </Text>
               </TouchableOpacity>
                         </View>
           </View>
         </View>
       </Modal>

      {/* Reset Mission Confirmation Modal removed */}
     </ImageBackground>
     </View>
  );
};

export default DiscoverScreen; 