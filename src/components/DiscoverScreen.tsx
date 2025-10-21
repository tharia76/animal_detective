import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  useWindowDimensions,
  Platform,
  ScrollView,
  ImageBackground,
  StyleSheet,
  Animated,
  Easing,
  PanResponder,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { createAudioPlayer } from 'expo-audio';
import { Ionicons } from '@expo/vector-icons';
import { useLevelCompletion } from '../hooks/useLevelCompletion';
import { useLocalization } from '../hooks/useLocalization';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Function to get animal English key for mapping
const getAnimalEnglishKey = (animal: any): string => {
  const translatedKey = animal.name.toLowerCase();
  
  const nameToKeyMap: { [key: string]: string } = {
    'dog': 'dog', 'cat': 'cat', 'chicken': 'chicken', 'chick': 'chick',
    'donkey': 'donkey', 'cow': 'cow', 'duck': 'duck', 'goat': 'goat',
    'goose': 'goose', 'horse': 'horse', 'llama': 'llama', 'pig': 'pig',
    'rabbit': 'rabbit', 'rooster': 'rooster', 'sheep': 'sheep', 'turkey': 'turkey',
    'собака': 'dog', 'кошка': 'cat', 'kошка': 'cat', 'курица': 'chicken', 'цыпленок': 'chick',
    'осел': 'donkey', 'корова': 'cow', 'утка': 'duck', 'коза': 'goat',
    'гусь': 'goose', 'лошадь': 'horse', 'лама': 'llama', 'свинья': 'pig',
    'кролик': 'rabbit', 'петух': 'rooster', 'овца': 'sheep', 'индейка': 'turkey',
    'коала': 'koala',
    'белый медведь': 'white bear', 'белая лиса': 'white fox',
    'северный олень': 'reindeer', 'тюлень': 'seal', 'полярная сова': 'snow owl',
    'пингвин': 'penguin', 'морж': 'walrus',
    'барсук': 'badger', 'лиса': 'fox', 'медведь': 'bear', 'енот': 'raccoon',
    'белка': 'squirrel', 'ёж': 'hedgehog', 'сова': 'owl', 'волк': 'wolf',
    'олень': 'deer', 'лось': 'moose', 'мышь': 'mouse', 'бобр': 'beaver',
    'кабан': 'boar', 'летучая мышь': 'bat', 'выдра': 'otter', 'скунс': 'skunk',
    'краб': 'crab', 'дельфин': 'dolphin', 'рыба': 'fish', 'медуза': 'jellyfish',
    'омар': 'lobster', 'осьминог': 'octopus', 'морская черепаха': 'sea turtle',
    'морской конек': 'seahorse', 'акула': 'shark', 'креветка': 'shrimp',
    'морская звезда': 'starfish', 'скат': 'stingray', 'кит': 'whale',
    'верблюд': 'camel', 'пустынная черепаха': 'desert tortoise', 'фенек': 'fennec fox',
    'игуана': 'iguana', 'шакал': 'jackal', 'тушканчик': 'jerboa',
    'сурикат': 'meerkat', 'орикс': 'oryx', 'песчаная кошка': 'sand cat', 'скорпион': 'scorpion',
    'каракал': 'caracal', 'ящерица': 'lizard',
    'муравей': 'ant', 'пчела': 'bee', 'жук': 'beetle', 'бабочка': 'butterfly',
    'сверчок': 'cricket', 'гусеница': 'caterpillar', 'таракан': 'cockroach',
    'стрекоза': 'dragonfly', 'светлячок': 'firefly', 'муха': 'fly',
    'кузнечик': 'grasshopper', 'божья коровка': 'ladybug', 'мантис': 'mantis',
    'комар': 'mosquito', 'улитка': 'snail', 'паук': 'spider', 'оса': 'wasp', 'червь': 'worm',
    'слон': 'elephant', 'жираф': 'giraffe', 'лев': 'lion', 'зебра': 'zebra',
    'носорог': 'rhinoceros', 'бегемот': 'hippopotamus', 'гепард': 'cheetah',
    'гиена': 'hyena', 'антилопа': 'antelope', 'бизон': 'bison',
    'леопард': 'leopard', 'обезьяна': 'monkey', 'дикий кабан': 'wild boar',
    'тигр': 'tiger', 'ягуар': 'jaguar', 'горилла': 'gorilla', 'шимпанзе': 'chimpanzee',
    'орангутан': 'orangutan', 'лемур': 'lemur', 'ленивец': 'sloth', 'хамелеон': 'chameleon',
    'лягушка': 'frog', 'крокодил': 'crocodile', 'панда': 'panda', 'змея': 'snake',
    'черепаха': 'turtle', 'муравьед': 'ant eater', 'азиатский слон': 'asian elephant',
    'бенгальский тигр': 'bengal tiger', 'чёрная пантера': 'black panther',
    'капибара': 'capybara', 'кобра': 'cobra', 'рысь': 'lynx', 'мангуст': 'mongoose',
    'орел': 'eagle', 'голубь': 'dove', 'канарейка': 'canary', 'фламинго': 'flamingo',
    'страус': 'ostrich', 'попугай': 'parrot', 'павлин': 'peacock', 'пеликан': 'pelican',
    'ворон': 'raven', 'чайка': 'seagull', 'воробей': 'sparrow', 'аист': 'stork',
    'лебедь': 'swan', 'тукан': 'toucan', 'дятел': 'woodpecker',
    'köpek': 'dog', 'kedi': 'cat', 'tavuk': 'chicken', 'civciv': 'chick',
    'eşek': 'donkey', 'inek': 'cow', 'ördek': 'duck', 'keçi': 'goat',
    'kaz': 'goose', 'at': 'horse', 'lama': 'llama', 'domuz': 'pig',
    'tavşan': 'rabbit', 'horoz': 'rooster', 'koyun': 'sheep', 'hindi': 'turkey',
    'beyaz ayı': 'white bear', 'kutup tilkisi': 'white fox',
    'ren geyiği': 'reindeer', 'fok': 'seal', 'kar baykuşu': 'snow owl',
    'penguen': 'penguin', 'deniz aygırı': 'walrus',
    'porsuk': 'badger', 'tilki': 'fox', 'ayı': 'bear', 'rakum': 'raccoon',
    'sincap': 'squirrel', 'kirpi': 'hedgehog', 'baykuş': 'owl', 'kurt': 'wolf',
    'geyik': 'deer', 'alageyik': 'moose', 'fare': 'mouse', 'kunduz': 'beaver',
    'yaban domuzu': 'boar', 'yarasa': 'bat', 'su samuru': 'otter', 'kedi köpeği': 'skunk',
    'koala': 'koala',
    'yengeç': 'crab', 'yunus': 'dolphin', 'balık': 'fish', 'denizanası': 'jellyfish',
    'istakoz': 'lobster', 'ahtapot': 'octopus', 'deniz kaplumbağası': 'sea turtle',
    'denizatı': 'seahorse', 'köpekbalığı': 'shark', 'karides': 'shrimp',
    'deniz yıldızı': 'starfish', 'vatoz': 'stingray', 'balina': 'whale',
    'deve': 'camel', 'çöl kaplumbağası': 'desert tortoise', 'fennek tilkisi': 'fennec fox',
    'iguana': 'iguana', 'i̇guana': 'iguana', 'ıguana': 'iguana', 'çakal': 'jackal', 'çöl faresi': 'jerboa',
    'surikat': 'meerkat', 'oryx': 'oryx', 'kum kedisi': 'sand cat',
    'akrep': 'scorpion', 'karakal': 'caracal', 'kertenkele': 'lizard',
    'karınca': 'ant', 'arı': 'bee', 'kelebek': 'butterfly', 'böcek': 'beetle',
    'tırtıl': 'caterpillar', 'hamam böceği': 'cockroach', 'yusufçuk': 'dragonfly',
    'sinek': 'fly', 'çekirge': 'grasshopper', 'uğur böceği': 'ladybug',
    'mantis': 'mantis', 'sivrisinek': 'mosquito', 'salyangoz': 'snail',
    'örümcek': 'spider', 'sürüngen': 'worm', 'eşek arısı': 'wasp',
    'cırcır böceği': 'cricket', 'ateşböceği': 'firefly',
    'fil': 'elephant', 'zürafa': 'giraffe', 'aslan': 'lion', 'zebra': 'zebra',
    'gergedan': 'rhinoceros', 'su aygırı': 'hippopotamus', 'çita': 'cheetah',
    'sırtlan': 'hyena', 'antilop': 'antelope', 'bizon': 'bison',
    'leopar': 'leopard', 'maymun': 'monkey',
    'kaplan': 'tiger', 'siyah panter': 'black panther', 'jaguar': 'jaguar',
    'goril': 'gorilla', 'şempanze': 'chimpanzee', 'orangutan': 'orangutan',
    'lemur': 'lemur', 'tembel hayvan': 'sloth', 'bukalemun': 'chameleon',
    'kurbağa': 'frog', 'timsah': 'crocodile', 'panda': 'panda',
    'karınca yiyen': 'ant eater', 'asya fili': 'asian elephant',
    'bengal kaplanı': 'bengal tiger', 'kapibara': 'capybara',
    'yılan': 'snake', 'kaplumbağa': 'turtle', 'kobra': 'cobra',
    'vaşak': 'lynx', 'mangust': 'mongoose',
    'kartal': 'eagle', 'güvercin': 'dove', 'kanarya': 'canary',
    'flamingo': 'flamingo', 'devekuşu': 'ostrich', 'papağan': 'parrot',
    'pelikan': 'pelican', 'kuzgun': 'raven', 'martı': 'seagull',
    'serçe': 'sparrow', 'leylek': 'stork', 'kuğu': 'swan',
    'tukan': 'toucan', 'ağaçkakan': 'woodpecker', 'tavus kuşu': 'peacock',
    'white bear': 'white bear', 'white fox': 'white fox', 'reindeer': 'reindeer',
    'seal': 'seal', 'snow owl': 'snow owl', 'penguin': 'penguin', 'walrus': 'walrus',
  };
  
  return nameToKeyMap[translatedKey] || translatedKey || 'cat';
  };
  
  // Static mapping of animal names to their still images
  const stillImageMap: { [key: string]: any } = {
    'white bear': require('../assets/images/still-animals/whitebear.png'),
    'white fox': require('../assets/images/still-animals/whitefox.png'),
    'reindeer': require('../assets/images/still-animals/reindeer.png'),
    'seal': require('../assets/images/still-animals/seal.png'),
    'snow owl': require('../assets/images/still-animals/snowyowl.png'),
    'penguin': require('../assets/images/still-animals/ping.png'),
    'walrus': require('../assets/images/still-animals/walrus.png'),
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
    'dolphin': require('../assets/images/still-animals/dolphin.png'),
  'fish': require('../assets/images/still-animals/fish.png'),
    'octopus': require('../assets/images/still-animals/octopus.png'),
  'shark': require('../assets/images/still-animals/shark.png'),
  'whale': require('../assets/images/still-animals/whale.png'),
    'crab': require('../assets/images/still-animals/crab.png'),
    'jellyfish': require('../assets/images/still-animals/jellyfish.png'),
  'lobster': require('../assets/images/still-animals/lobster.png'),
  'sea turtle': require('../assets/images/still-animals/seaturtle.png'),
  'seahorse': require('../assets/images/still-animals/seahorse.png'),
    'shrimp': require('../assets/images/still-animals/shrimp.png'),
  'starfish': require('../assets/images/still-animals/starfish.png'),
    'stingray': require('../assets/images/still-animals/stringray.png'),
    'elephant': require('../assets/images/still-animals/elephant.png'),
    'giraffe': require('../assets/images/still-animals/giraffe.png'),
    'lion': require('../assets/images/still-animals/leon.png'),
    'zebra': require('../assets/images/still-animals/zebra.png'),
    'rhinoceros': require('../assets/images/still-animals/rhinoceros.png'),
    'hippopotamus': require('../assets/images/still-animals/hippopotamus.png'),
    'cheetah': require('../assets/images/still-animals/gepard.png'),
    'hyena': require('../assets/images/still-animals/hyena.png'),
    'antelope': require('../assets/images/still-animals/antelope.png'),
    'bison': require('../assets/images/still-animals/bizon.png'),
    'wild boar': require('../assets/images/still-animals/wildboar.png'),
  'ostrich': require('../assets/images/still-animals/ostrich.png'),
  'flamingo': require('../assets/images/still-animals/flamingo.png'),
  'eagle': require('../assets/images/still-animals/eagle.png'),
    'tiger': require('../assets/images/still-animals/tiger.png'),
  'bengal tiger': require('../assets/images/still-animals/btiger.png'),
  'asian elephant': require('../assets/images/still-animals/aelephant.png'),
  'camel': require('../assets/images/still-animals/camel.png'),
  'snake': require('../assets/images/still-animals/snake.png'),
  'lizard': require('../assets/images/still-animals/lizard.png'),
  'scorpion': require('../assets/images/still-animals/scorpion.png'),
  'fennec fox': require('../assets/images/still-animals/fennecfox.png'),
  'caracal': require('../assets/images/still-animals/caracal.png'),
  'desert tortoise': require('../assets/images/still-animals/dtortoise.png'),
  'iguana': require('../assets/images/still-animals/iguana.png'),
  'jackal': require('../assets/images/still-animals/jackal.png'),
  'jerboa': require('../assets/images/still-animals/jerboa.png'),
  'meerkat': require('../assets/images/still-animals/meerkat.png'),
  'oryx': require('../assets/images/still-animals/oryx.png'),
  'sand cat': require('../assets/images/still-animals/sandcat.png'),
  'ant': require('../assets/images/still-animals/ant.png'),
  'bee': require('../assets/images/still-animals/bee.png'),
  'butterfly': require('../assets/images/still-animals/butterfly.png'),
  'spider': require('../assets/images/still-animals/spider.png'),
  'ladybug': require('../assets/images/still-animals/ladybag.png'),
  'grasshopper': require('../assets/images/still-animals/grasshopper.png'),
  'caterpillar': require('../assets/images/still-animals/caterpillar.png'),
  'cockroach': require('../assets/images/still-animals/cockroach.png'),
  'dragonfly': require('../assets/images/still-animals/dragonfly.png'),
  'fly': require('../assets/images/still-animals/fly.png'),
  'mantis': require('../assets/images/still-animals/mantis.png'),
  'mosquito': require('../assets/images/still-animals/mosquito.png'),
  'snail': require('../assets/images/still-animals/snail.png'),
  'worm': require('../assets/images/still-animals/worm.png'),
  'parrot': require('../assets/images/still-animals/parrot.png'),
  'pelican': require('../assets/images/still-animals/pelican.png'),
  'canary': require('../assets/images/still-animals/canary.png'),
  'dove': require('../assets/images/still-animals/dove.png'),
  'raven': require('../assets/images/still-animals/raven.png'),
  'seagull': require('../assets/images/still-animals/seagull.png'),
  'sparrow': require('../assets/images/still-animals/sparrow.png'),
  'stork': require('../assets/images/still-animals/stork.png'),
  'swan': require('../assets/images/still-animals/swan.png'),
  'woodpecker': require('../assets/images/still-animals/woodpecker.png'),
    'gorilla': require('../assets/images/still-animals/gorilla.png'),
    'chimpanzee': require('../assets/images/still-animals/chimpanzee.png'),
    'sloth': require('../assets/images/still-animals/sloth.png'),
  'toucan': require('../assets/images/still-animals/toucan.png'),
    'frog': require('../assets/images/still-animals/frog.png'),
  'black panther': require('../assets/images/still-animals/panther.png'),
  'jaguar': require('../assets/images/still-animals/jaguar.png'),
  'orangutan': require('../assets/images/still-animals/orangutan.png'),
  'lemur': require('../assets/images/still-animals/lemur.png'),
    'chameleon': require('../assets/images/still-animals/chameleon.png'),
  'crocodile': require('../assets/images/still-animals/crocodile.png'),
    'panda': require('../assets/images/still-animals/panda.png'),
  'turtle': require('../assets/images/still-animals/turtle.png'),
    'ant eater': require('../assets/images/still-animals/anteater.png'),
    'capybara': require('../assets/images/still-animals/capybara.png'),
    'koala': require('../assets/images/still-animals/koala.png'),
};

// Static mapping of animal names to their silhouettes
const silhouetteImageMap: { [key: string]: any } = {
  'white bear': require('../assets/images/silhouettes/whitebear_silhouette.png'),
  'white fox': require('../assets/images/silhouettes/whitefox_silhouette.png'),
  'reindeer': require('../assets/images/silhouettes/reindeer_silhouette.png'),
  'seal': require('../assets/images/silhouettes/seal_silhouette.png'),
  'snow owl': require('../assets/images/silhouettes/snowyowl_silhouette.png'),
  'penguin': require('../assets/images/silhouettes/ping_silhouette.png'),
  'walrus': require('../assets/images/silhouettes/walrus_silhouette.png'),
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
  'dolphin': require('../assets/images/silhouettes/dolphin_silhouette.png'),
  'fish': require('../assets/images/silhouettes/fish_silhouette.png'),
  'octopus': require('../assets/images/silhouettes/octopus_silhouette.png'),
  'shark': require('../assets/images/silhouettes/shark_silhouette.png'),
  'whale': require('../assets/images/silhouettes/whale_silhouette.png'),
  'crab': require('../assets/images/silhouettes/crab_silhouette.png'),
  'jellyfish': require('../assets/images/silhouettes/jellyfish_silhouette.png'),
  'lobster': require('../assets/images/silhouettes/lobster_silhouette.png'),
  'sea turtle': require('../assets/images/silhouettes/seaturtle_silhouette.png'),
  'seahorse': require('../assets/images/silhouettes/seahorse_silhouette.png'),
  'shrimp': require('../assets/images/silhouettes/shrimp_silhouette.png'),
  'starfish': require('../assets/images/silhouettes/starfish_silhouette.png'),
  'stingray': require('../assets/images/silhouettes/stringray_silhouette.png'),
  'elephant': require('../assets/images/silhouettes/elephant_silhouette.png'),
  'giraffe': require('../assets/images/silhouettes/giraffe_silhouette.png'),
  'lion': require('../assets/images/silhouettes/leon_silhouette.png'),
  'zebra': require('../assets/images/silhouettes/zebra_silhouette.png'),
  'rhinoceros': require('../assets/images/silhouettes/rhinoceros_silhouette.png'),
  'hippopotamus': require('../assets/images/silhouettes/hippopotamus_silhouette.png'),
  'cheetah': require('../assets/images/silhouettes/gepard_silhouette.png'),
  'hyena': require('../assets/images/silhouettes/hyena_silhouette.png'),
  'antelope': require('../assets/images/silhouettes/antelope_silhouette.png'),
  'bison': require('../assets/images/silhouettes/bizon_silhouette.png'),
  'wild boar': require('../assets/images/silhouettes/wildboar_silhouette.png'),
  'ostrich': require('../assets/images/silhouettes/ostrich_silhouette.png'),
  'flamingo': require('../assets/images/silhouettes/flamingo_silhouette.png'),
  'eagle': require('../assets/images/silhouettes/eagle_silhouette.png'),
  'tiger': require('../assets/images/silhouettes/tiger_silhouette.png'),
  'bengal tiger': require('../assets/images/silhouettes/btiger_silhouette.png'),
  'asian elephant': require('../assets/images/silhouettes/aelephant_silhouette.png'),
  'camel': require('../assets/images/silhouettes/camel_silhouette.png'),
  'snake': require('../assets/images/silhouettes/snake_silhouette.png'),
  'lizard': require('../assets/images/silhouettes/lizard_silhouette.png'),
  'scorpion': require('../assets/images/silhouettes/scorpion_silhouette.png'),
  'fennec fox': require('../assets/images/silhouettes/fennecfox_silhouette.png'),
  'caracal': require('../assets/images/silhouettes/caracal_silhouette.png'),
  'desert tortoise': require('../assets/images/silhouettes/dtortoise_silhouette.png'),
  'iguana': require('../assets/images/silhouettes/iguana_silhouette.png'),
  'jackal': require('../assets/images/silhouettes/jackal_silhouette.png'),
  'jerboa': require('../assets/images/silhouettes/jerboa_silhouette.png'),
  'meerkat': require('../assets/images/silhouettes/meerkat_silhouette.png'),
  'oryx': require('../assets/images/silhouettes/oryx_silhouette.png'),
  'sand cat': require('../assets/images/silhouettes/sandcat_silhouette.png'),
  'ant': require('../assets/images/silhouettes/ant_silhouette.png'),
  'bee': require('../assets/images/silhouettes/bee_silhouette.png'),
  'butterfly': require('../assets/images/silhouettes/butterfly_silhouette.png'),
  'spider': require('../assets/images/silhouettes/spider_silhouette.png'),
  'ladybug': require('../assets/images/silhouettes/ladybag_silhouette.png'),
  'grasshopper': require('../assets/images/silhouettes/grasshopper_silhouette.png'),
  'caterpillar': require('../assets/images/silhouettes/caterpillar_silhouette.png'),
  'cockroach': require('../assets/images/silhouettes/cockroach_silhouette.png'),
  'dragonfly': require('../assets/images/silhouettes/dragonfly_silhouette.png'),
  'fly': require('../assets/images/silhouettes/fly_silhouette.png'),
  'mantis': require('../assets/images/silhouettes/mantis_silhouette.png'),
  'mosquito': require('../assets/images/silhouettes/mosquito_silhouette.png'),
  'snail': require('../assets/images/silhouettes/snail_silhouette.png'),
  'worm': require('../assets/images/silhouettes/worm_silhouette.png'),
  'parrot': require('../assets/images/silhouettes/parrot_silhouette.png'),
  'pelican': require('../assets/images/silhouettes/pelican_silhouette.png'),
  'canary': require('../assets/images/silhouettes/canary_silhouette.png'),
  'dove': require('../assets/images/silhouettes/dove_silhouette.png'),
  'raven': require('../assets/images/silhouettes/raven_silhouette.png'),
  'seagull': require('../assets/images/silhouettes/seagull_silhouette.png'),
  'sparrow': require('../assets/images/silhouettes/sparrow_silhouette.png'),
  'stork': require('../assets/images/silhouettes/stork_silhouette.png'),
  'swan': require('../assets/images/silhouettes/swan_silhouette.png'),
  'woodpecker': require('../assets/images/silhouettes/woodpecker_silhouette.png'),
  'gorilla': require('../assets/images/silhouettes/gorilla_silhouette.png'),
  'chimpanzee': require('../assets/images/silhouettes/chimpanzee_silhouette.png'),
  'sloth': require('../assets/images/silhouettes/sloth_silhouette.png'),
  'toucan': require('../assets/images/silhouettes/toucan_silhouette.png'),
  'frog': require('../assets/images/silhouettes/frog_silhouette.png'),
  'black panther': require('../assets/images/silhouettes/panther_silhouette.png'),
  'jaguar': require('../assets/images/silhouettes/jaguar_silhouette.png'),
  'orangutan': require('../assets/images/silhouettes/orangutan_silhouette.png'),
  'lemur': require('../assets/images/silhouettes/lemur_silhouette.png'),
  'chameleon': require('../assets/images/silhouettes/chameleon_silhouette.png'),
  'crocodile': require('../assets/images/silhouettes/crocodile_silhouette.png'),
  'panda': require('../assets/images/silhouettes/panda_silhouette.png'),
  'turtle': require('../assets/images/silhouettes/turtle_silhouette.png'),
  'ant eater': require('../assets/images/silhouettes/anteater_silhouette.png'),
  'capybara': require('../assets/images/silhouettes/capybara_silhouette.png'),
  'koala': require('../assets/images/silhouettes/koala_silhouette.png'),
};

interface DiscoverScreenProps {
  animals?: any[];
  levelName?: string;
  onComplete?: () => void;
  onBackToMenu?: () => void;
  onBackToLevel?: (animalIndex?: number) => void;
  visitedAnimals?: Set<number>;
  currentAnimalIndex?: number;
}

const DiscoverScreen: React.FC<DiscoverScreenProps> = ({ 
  animals = [],
  levelName = 'Arctic',
  onComplete,
  onBackToMenu,
  onBackToLevel,
  visitedAnimals = new Set(),
  currentAnimalIndex = 0
}) => {
  const { markLevelCompleted } = useLevelCompletion();
  const { t } = useLocalization();
  const { width: screenW, height: screenH } = useWindowDimensions();
  const safeAreaInsets = useSafeAreaInsets();
  const isTablet = Math.min(screenW, screenH) >= 768 && Math.max(screenW, screenH) >= 1024;

  const levelAnimals = useMemo(() => {
    return animals.filter((animal: any) => 
      animal.animalType.toLowerCase() === levelName.toLowerCase()
    );
  }, [animals, levelName]);

  const unlockedAnimals = useMemo(() => {
    // Show all animals from the level, not just visited ones
    return levelAnimals.map((animal, index) => ({
      ...animal,
      originalIndex: index,
      englishKey: getAnimalEnglishKey(animal)
    }));
  }, [levelAnimals]);

  // Shuffled animals for the grid (randomized order)
  const shuffledAnimals = useMemo(() => {
    const shuffled = [...unlockedAnimals];
    
    // Shuffle using Fisher-Yates algorithm
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    return shuffled;
  }, [unlockedAnimals]);

  const [placedAnimals, setPlacedAnimals] = useState<Set<number>>(new Set());
  const [missionCompleted, setMissionCompleted] = useState(false);
  const [currentSquareIndex, setCurrentSquareIndex] = useState(0);
  const [draggingAnimal, setDraggingAnimal] = useState<any | null>(null);
  const [wrongDrop, setWrongDrop] = useState(false);
  const [wrongAnimalIndex, setWrongAnimalIndex] = useState<number | null>(null);
  const [isLoadingProgress, setIsLoadingProgress] = useState(true);
  
  // Balloon state for mission complete
  const [celebrationBalloons, setCelebrationBalloons] = useState<Array<{
    id: number;
    x: number;
    targetY: number;
    source: any;
    color: string;
    size: number;
    animValue: Animated.Value;
    popAnimValue: Animated.Value;
    isPopping: boolean;
    visible: boolean;
    pieces?: Array<{ dx: number; dy: number; rotation: number }>;
  }>>([]);
  const balloonIdRef = useRef(0);
  
  const dropZoneRef = useRef<View>(null);
  const dropZonePosition = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const dragAnimValue = useRef(new Animated.ValueXY()).current;
  const dropZoneShake = useRef(new Animated.Value(0)).current;
  const currentSquareIndexRef = useRef(currentSquareIndex);
  
  // Animated hand hint
  const handAnimX = useRef(new Animated.Value(1)).current; // Start from right (1 = 100%)
  
  // Storage key for this level's progress
  const storageKey = `discover_progress_${levelName.toLowerCase()}`;

  // Balloon assets from existing system
  const balloonAssets = useMemo(() => [
    { color: 'pink', source: require('../assets/balloons/pink_balloon.png') },
    { color: 'blue', source: require('../assets/balloons/blue_balloon.png') },
    { color: 'green', source: require('../assets/balloons/green_balloon.png') },
    { color: 'orange', source: require('../assets/balloons/orange_balloon.png') },
  ], []);

  // Generate random balloon positions (static, doesn't change on re-render)
  const balloons = useMemo(() => 
    Array.from({ length: 12 }, (_, i) => {
      const asset = balloonAssets[i % balloonAssets.length];
      return {
        id: i,
        x: Math.random() * (screenW - 200) + 100, // Random X with more padding for bigger balloons
        source: asset.source,
        color: asset.color,
        size: isTablet ? 200 : 150, // Bigger balloons
        duration: 5000 + Math.random() * 3000, // 5-8 seconds
        delay: Math.random() * 2000, // 0-2 second delay
      };
    })
  , [isTablet, screenW, balloonAssets]);

  // Load saved progress on mount
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const savedProgress = await AsyncStorage.getItem(storageKey);
        if (savedProgress) {
          const placedIndices = JSON.parse(savedProgress) as number[];
          const newSet = new Set(placedIndices);
          setPlacedAnimals(newSet);
          
          // Check if already completed
          if (newSet.size === unlockedAnimals.length && unlockedAnimals.length > 0) {
            console.log('🎉 Game already completed, showing celebration!');
            setMissionCompleted(true);
          } else {
            // Find first incomplete animal to show
            let firstIncomplete = 0;
            for (let i = 0; i < unlockedAnimals.length; i++) {
              if (!newSet.has(i)) {
                firstIncomplete = i;
        break;
      }
            }
            setCurrentSquareIndex(firstIncomplete);
          }
          
          console.log('📦 Loaded discover progress:', {
            level: levelName,
            placedCount: newSet.size,
            total: unlockedAnimals.length,
            isCompleted: newSet.size === unlockedAnimals.length
          });
        }
      } catch (error) {
        console.warn('Error loading discover progress:', error);
      } finally {
        setIsLoadingProgress(false);
      }
    };
    
    if (unlockedAnimals.length > 0) {
      loadProgress();
    } else {
      setIsLoadingProgress(false);
    }
  }, [levelName, storageKey, unlockedAnimals.length]);
  
  // Save progress whenever placed animals change
  useEffect(() => {
    const saveProgress = async () => {
      if (isLoadingProgress) return; // Don't save while loading
      
      try {
        const placedIndices = Array.from(placedAnimals);
        await AsyncStorage.setItem(storageKey, JSON.stringify(placedIndices));
        console.log('💾 Saved discover progress:', {
          level: levelName,
          placedCount: placedIndices.length
        });
      } catch (error) {
        console.warn('Error saving discover progress:', error);
      }
    };
    
    saveProgress();
  }, [placedAnimals, storageKey, levelName, isLoadingProgress]);

  // Keep ref in sync with state
  useEffect(() => {
    currentSquareIndexRef.current = currentSquareIndex;
  }, [currentSquareIndex]);
  
  // Generate balloons when mission is completed
  useEffect(() => {
    if (missionCompleted && celebrationBalloons.length === 0) {
      const newBalloons = balloons.map((balloon, i) => {
      const id = balloonIdRef.current++;
        const animValue = new Animated.Value(0);
        // Random Y position in middle-lower area of screen (40-60% from top)
        const targetY = screenH * 0.4 + (Math.random() * screenH * 0.2);
        const newBalloon = {
          id,
          x: balloon.x,
        targetY,
          source: balloon.source,
          color: balloon.color,
          size: balloon.size,
          animValue,
        popAnimValue: new Animated.Value(0),
        isPopping: false,
          visible: true,
      };
      
        // Start animation with delay - float up and stop in middle
      setTimeout(() => {
          Animated.timing(animValue, {
          toValue: 1,
            duration: 2000, // Faster rise to middle
          useNativeDriver: true,
        }).start();
        }, balloon.delay);
        
        return newBalloon;
      });
      
      setCelebrationBalloons(newBalloons);
    }
  }, [missionCompleted, balloons, celebrationBalloons.length, screenH]);
  
  // Pop balloon function
  const popBalloon = useCallback((balloonId: number) => {
    setCelebrationBalloons(prev => 
      prev.map(balloon => {
        if (balloon.id === balloonId && !balloon.isPopping) {
          // Stop rise animation
          try { balloon.animValue.stopAnimation(); } catch {}

          // Play pop sound
            try {
              const popPlayer = createAudioPlayer(require('../assets/sounds/other/balloon-pop.mp3'));
              popPlayer.play();
              popPlayer.addListener('playbackStatusUpdate', (status: any) => {
                if (status.didJustFinish) popPlayer.remove();
              });
            } catch (error) {
            console.warn('Error playing pop sound:', error);
          }

          // Generate explosion pieces
          const pieceCount = 6;
          const radius = 60;
          const pieces = Array.from({ length: pieceCount }).map((_, idx) => {
            const angle = (idx / pieceCount) * Math.PI * 2;
            const jitter = (Math.random() - 0.5) * 0.6;
            const finalR = radius * (0.8 + Math.random() * 0.6);
            return {
              dx: Math.cos(angle + jitter) * finalR,
              dy: Math.sin(angle + jitter) * finalR,
              rotation: Math.floor(Math.random() * 180) - 90,
            };
          });

          // Start pop animation
            Animated.timing(balloon.popAnimValue, {
              toValue: 1,
            duration: 350,
              useNativeDriver: true,
            }).start(() => {
            // Hide balloon after pop
            setCelebrationBalloons(current => 
              current.map(b => b.id === balloonId ? { ...b, visible: false } : b)
            );
          });
          
          return { ...balloon, isPopping: true, pieces };
        }
        return balloon;
      })
    );
  }, []);
  
  // Animate hand hint when there are animals left to place
  useEffect(() => {
    if (placedAnimals.size < unlockedAnimals.length) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(handAnimX, {
            toValue: 0, // Move to left (0%)
            duration: 1500,
            easing: Easing.bezier(0.42, 0, 0.58, 1), // Smooth ease-in-out
            useNativeDriver: true,
          }),
          Animated.delay(800),
          Animated.timing(handAnimX, {
            toValue: 1, // Back to right (100%)
            duration: 1500,
            easing: Easing.bezier(0.42, 0, 0.58, 1), // Smooth ease-in-out
            useNativeDriver: true,
          }),
          Animated.delay(800),
        ])
      );
      animation.start();
      return () => animation.stop();
    }
  }, [placedAnimals.size, unlockedAnimals.length, handAnimX]);

  const currentAnimalPlayerRef = useRef<any | null>(null);

  const playAnimalSound = useCallback((source: any) => {
    try {
      if (currentAnimalPlayerRef.current) {
        try { currentAnimalPlayerRef.current.pause?.(); } catch {}
        try { currentAnimalPlayerRef.current.stop?.(); } catch {}
        try { currentAnimalPlayerRef.current.remove?.(); } catch {}
        currentAnimalPlayerRef.current = null;
      }
      
      setTimeout(() => {
        try {
          const p = createAudioPlayer(source);
          currentAnimalPlayerRef.current = p;
          
          p.addListener('playbackStatusUpdate', (status: any) => {
            if (status?.didJustFinish) {
              try { p.remove(); } catch {}
              if (currentAnimalPlayerRef.current === p) {
                currentAnimalPlayerRef.current = null;
              }
            }
          });
          
          p.play();
        } catch (error) {
          console.warn('Error creating or playing animal sound:', error);
        }
      }, 50);
    } catch (error) {
      console.warn('Error playing animal sound:', error);
    }
  }, []);

  useEffect(() => {
    if (unlockedAnimals.length > 0 && placedAnimals.size === unlockedAnimals.length) {
      setTimeout(() => {
        setMissionCompleted(true);
      }, 500);
    }
  }, [placedAnimals, unlockedAnimals]);

  useEffect(() => {
    console.log('Auto-advance check:', {
      currentSquareIndex,
      hasPlaced: placedAnimals.has(currentSquareIndex),
      placedAnimalsSet: Array.from(placedAnimals),
      totalAnimals: unlockedAnimals.length
    });
    
    if (placedAnimals.has(currentSquareIndex) && currentSquareIndex < unlockedAnimals.length - 1) {
      console.log('✨ Auto-advancing from index', currentSquareIndex, 'to', currentSquareIndex + 1);
      const timer = setTimeout(() => {
        setCurrentSquareIndex(prev => {
          console.log('Setting square index from', prev, 'to', prev + 1);
          return prev + 1;
        });
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [placedAnimals, currentSquareIndex, unlockedAnimals.length]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (dropZoneRef.current) {
        dropZoneRef.current.measureInWindow((x, y, width, height) => {
          dropZonePosition.current = { x, y, width, height };
        });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [currentSquareIndex]);

  const handlePrevSquare = () => {
    if (currentSquareIndex > 0) {
      console.log('Manual navigation: Prev button clicked, moving from', currentSquareIndex, 'to', currentSquareIndex - 1);
      setCurrentSquareIndex(prev => prev - 1);
    }
  };

  const handleNextSquare = () => {
    if (currentSquareIndex < unlockedAnimals.length - 1) {
      console.log('Manual navigation: Next button clicked, moving from', currentSquareIndex, 'to', currentSquareIndex + 1);
      setCurrentSquareIndex(prev => prev + 1);
    }
  };

  const handleCloseMissionComplete = async () => {
    try {
      const yaySound = require('../assets/sounds/other/yay.mp3');
      const player = await createAudioPlayer(yaySound);
      player.play();
    } catch (error) {
      console.warn('Error playing yay sound:', error);
    }
    
    if (levelName) {
      try {
        await markLevelCompleted(levelName);
      } catch (error) {
        console.warn('Error marking level as completed:', error);
      }
    }
    
        setTimeout(() => {
          const BackgroundMusicManager = require('../services/BackgroundMusicManager').default;
          BackgroundMusicManager.cleanup();
          
          if (onBackToMenu) {
            onBackToMenu();
          }
        }, 100);
  };

  const squareSize = isTablet ? 300 : 240;
  const animalCardSize = isTablet ? 60 : 50;

    return (
    <View style={{ flex: 1, backgroundColor: '#40E0D0' }}>
      {isLoadingProgress ? (
        // Show loading state while loading progress
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: isTablet ? 24 : 18, color: '#fff', fontWeight: 'bold' }}>
            Loading...
          </Text>
        </View>
      ) : missionCompleted ? (
        <ImageBackground
          source={require('../assets/images/mission_complete_bg.png')}
          resizeMode="cover"
          style={{ flex: 1, width: '100%', height: '100%' }}
        >
          {/* Floating Balloons */}
          {celebrationBalloons.map((balloon) => {
            if (!balloon.visible) return null;
            
            if (balloon.isPopping && balloon.pieces) {
              // Show explosion pieces at balloon's stopped position
              return (
              <View
                  key={balloon.id} 
                style={{
                    position: 'absolute', 
                    left: balloon.x + balloon.size / 2, // Center horizontally
                    top: balloon.targetY + balloon.size / 2, // Position at balloon's stopped location
                  }}
                >
                  {balloon.pieces.map((piece, idx) => (
                <Animated.View
                      key={`piece-${idx}`}
                  style={{
                    position: 'absolute',
                        width: 20,
                        height: 20,
                        backgroundColor: balloon.color,
                    transform: [
                          {
                            translateX: balloon.popAnimValue.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0, piece.dx]
                            })
                          },
                          {
                            translateY: balloon.popAnimValue.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0, piece.dy]
                            })
                          },
                          {
                            rotate: `${piece.rotation}deg`
                          }
                        ],
                        opacity: balloon.popAnimValue.interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, 0]
                        })
                      }}
                    />
                  ))}
                </View>
              );
            }
            
            return (
                  <TouchableOpacity
                key={balloon.id}
                activeOpacity={1}
                    onPress={() => popBalloon(balloon.id)}
                    style={{
                  position: 'absolute',
                  left: balloon.x,
                }}
              >
                      <Animated.View
                        style={{
                    width: balloon.size,
                    height: balloon.size,
                          transform: [
                            {
                        translateY: balloon.animValue.interpolate({
                                inputRange: [0, 1],
                          outputRange: [screenH + 150, balloon.targetY] // Float to middle and stop
                        })
                      }
                    ],
                    opacity: balloon.animValue.interpolate({
                      inputRange: [0, 0.1, 1],
                      outputRange: [0, 1, 1] // Fade in and stay visible
                    })
                  }}
                >
                  <Image
                    source={balloon.source}
                    style={{
                      width: balloon.size,
                      height: balloon.size,
                      resizeMode: 'contain',
                    }}
                  />
                </Animated.View>
              </TouchableOpacity>
              );
            })}

            {/* Close Button */}
              <TouchableOpacity
                onPress={handleCloseMissionComplete}
                style={{
              position: 'absolute',
              top: Math.max(safeAreaInsets.top + 10, isTablet ? 20 : 20),
              right: Math.max(safeAreaInsets.right + (isTablet ? 30 : 20), isTablet ? 30 : 20),
                  width: isTablet ? 80 : 60,
                  height: isTablet ? 80 : 60,
                  borderRadius: isTablet ? 40 : 30,
                  backgroundColor: '#FF4444',
                  justifyContent: 'center',
                  alignItems: 'center',
              zIndex: 1000,
            }}
          >
            <Text style={{ color: 'white', fontSize: isTablet ? 40 : 30, fontWeight: 'bold' }}>×</Text>
              </TouchableOpacity>
        </ImageBackground>
      ) : (
        <>
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'flex-end',
          alignItems: 'center',
        paddingTop: Math.max(safeAreaInsets.top + 10, isTablet ? 20 : 10),
          paddingHorizontal: 20,
        marginBottom: 10,
        zIndex: 100,
        gap: 15,
        }}>
          <TouchableOpacity onPress={() => onBackToLevel?.()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={isTablet ? 35 : 25} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => {
              const BackgroundMusicManager = require('../services/BackgroundMusicManager').default;
              BackgroundMusicManager.cleanup();
            if (onBackToMenu) onBackToMenu();
          }}
          style={styles.homeButton}
          >
            <Text style={{ fontSize: isTablet ? 45 : 35 }}>🏠</Text>
          </TouchableOpacity>
        </View>

      {/* Main Content Container */}
          <View style={{
        flex: 1, 
              flexDirection: 'row',
        paddingLeft: Math.max(safeAreaInsets.left + (isTablet ? 20 : 10), isTablet ? 30 : 20),
        paddingRight: Math.max(safeAreaInsets.right + (isTablet ? 20 : 10), isTablet ? 30 : 20),
        paddingVertical: 10,
      }}>
        {/* Left Side: Drop Zone with side navigation buttons */}
        <View style={{ 
          width: isTablet ? 340 : 280,
          justifyContent: 'center',
          marginTop: isTablet ? -100 : -120,
              alignItems: 'center',
          marginRight: isTablet ? 20 : 10,
          zIndex: 1,
        }}>
          <View style={{ alignItems: 'center', width: '100%' }}>
            {unlockedAnimals[currentSquareIndex] && (() => {
              const currentAnimal = unlockedAnimals[currentSquareIndex];
              console.log('🎯 Displaying drop zone for:', {
                name: currentAnimal.name,
                englishKey: currentAnimal.englishKey,
                currentSquareIndex,
              });
              return (
              <>
                {/* Name Card with Nav Buttons on sides */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: isTablet ? 20 : 15, marginTop: isTablet ? 50 : 35 }}>
                  {/* Left Nav Button */}
            <TouchableOpacity
                    onPress={handlePrevSquare}
                    disabled={currentSquareIndex === 0}
                    style={[{ 
                      backgroundColor: currentSquareIndex === 0 ? '#ccc' : '#FF4757',
                      width: isTablet ? 55 : 45,
                      height: isTablet ? 55 : 45,
                      borderRadius: isTablet ? 27.5 : 22.5,
                      marginRight: isTablet ? 12 : 8,
              justifyContent: 'center',
                      alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
                      shadowRadius: 4,
                      elevation: 5,
                    }]}
                  >
                    <Ionicons name="arrow-back" size={isTablet ? 32 : 26} color={currentSquareIndex === 0 ? '#666' : 'white'} />
          </TouchableOpacity>
          
                  {/* Name Card */}
                  <View style={[
                    styles.nameCard,
                    {
                      padding: isTablet ? 20 : 16,
                      borderColor: placedAnimals.has(currentSquareIndex) ? '#32CD32' : '#FFD700',
                    }
                  ]}>
                    <Text style={[
                      styles.animalName,
                      {
                        fontSize: isTablet ? 28 : 22,
                        color: placedAnimals.has(currentSquareIndex) ? '#228B22' : '#333',
                      }
                    ]}>
                      {currentAnimal.name}
              </Text>
                    <Text style={[styles.hintText, { fontSize: isTablet ? 16 : 14 }]}>
                      {placedAnimals.has(currentSquareIndex) ? '✓ Tap to hear' : t('dragAnimalHere')}
                    </Text>
                  </View>

                  {/* Right Nav Button */}
          <TouchableOpacity
                    onPress={handleNextSquare}
                    disabled={currentSquareIndex === unlockedAnimals.length - 1}
                    style={[{ 
                      backgroundColor: currentSquareIndex === unlockedAnimals.length - 1 ? '#ccc' : '#2196F3',
                      width: isTablet ? 55 : 45,
                      height: isTablet ? 55 : 45,
                      borderRadius: isTablet ? 27.5 : 22.5,
                      marginLeft: isTablet ? 12 : 8,
              justifyContent: 'center',
                      alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
                      shadowRadius: 4,
                      elevation: 5,
                    }]}
                  >
                    <Ionicons name="arrow-forward" size={isTablet ? 32 : 26} color={currentSquareIndex === unlockedAnimals.length - 1 ? '#666' : 'white'} />
          </TouchableOpacity>
        </View>

                {/* Drop Square */}
            <TouchableOpacity
                  onPress={() => {
                    if (unlockedAnimals[currentSquareIndex].sound) {
                      playAnimalSound(unlockedAnimals[currentSquareIndex].sound);
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <Animated.View
                    ref={dropZoneRef}
                    style={[
                      styles.dropZoneSquare,
                      {
                        width: squareSize,
                        height: squareSize,
                      backgroundColor: wrongDrop ? '#FFB3B3' : (placedAnimals.has(currentSquareIndex) ? '#90EE90' : 'white'),
                      borderColor: wrongDrop ? '#FF0000' : (placedAnimals.has(currentSquareIndex) ? '#32CD32' : '#DDD'),
                      borderStyle: placedAnimals.has(currentSquareIndex) ? 'solid' : 'dashed',
                        borderWidth: wrongDrop ? 4 : 3,
                        transform: [{ translateX: dropZoneShake }],
                      }
                    ]}
                  >
                    {placedAnimals.has(currentSquareIndex) ? (
                      <>
                        <Image 
                          source={stillImageMap[unlockedAnimals[currentSquareIndex].englishKey]}
                          style={{
                            width: squareSize * 0.85,
                            height: squareSize * 0.85,
                            resizeMode: 'contain',
                          }}
                        />
                        <View style={styles.checkmark}>
                          <Ionicons name="checkmark" size={30} color="white" />
          </View>
                      </>
                    ) : (
                      silhouetteImageMap[unlockedAnimals[currentSquareIndex].englishKey] ? (
                        <Image 
                          source={silhouetteImageMap[unlockedAnimals[currentSquareIndex].englishKey]}
                          style={{
                            width: squareSize * 0.85,
                            height: squareSize * 0.85,
                            resizeMode: 'contain',
                            opacity: 0.3,
                          }}
                        />
                      ) : (
                        <Text style={[styles.questionMark, { fontSize: isTablet ? 60 : 50 }]}>?</Text>
                      )
                    )}
                  </Animated.View>
                </TouchableOpacity>
                
                {/* Progress Counter */}
                <Text style={[styles.sectionTitle, { marginTop: isTablet ? 20 : 15, fontSize: isTablet ? 22 : 18 }]}>
                  {currentSquareIndex + 1} / {unlockedAnimals.length}
                </Text>
              </>
              );
            })()}
          </View>
        </View>

        {/* Animated Hand Hint - moves from animals to drop zone */}
        {placedAnimals.size < unlockedAnimals.length && (
          <Animated.View style={{
            position: 'absolute',
            top: '50%',
            left: isTablet ? 330 : 270,
            right: isTablet ? 50 : 40,
            zIndex: 10000,
            elevation: 10000,
            transform: [{
              translateX: handAnimX.interpolate({
                inputRange: [0, 1],
                outputRange: [0, (Dimensions.get('window').width) * 0.35], // Move from left to right
              })
            }],
          }}>
            <Text style={{ fontSize: isTablet ? 50 : 40 }}>👆</Text>
          </Animated.View>
        )}

        {/* Right Side: Animals Grid - 5 per row */}
        <View style={{
          flex: 1,
          zIndex: 1000,
          elevation: 1000,
        }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingTop: 5 }}
            scrollEnabled={!draggingAnimal}
          >
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start' }}>
              {shuffledAnimals.map((animal, shuffledIdx) => {
                // Find which position this animal is in the unlockedAnimals array
                const squareIndex = unlockedAnimals.findIndex(a => a.englishKey === animal.englishKey);
                if (placedAnimals.has(squareIndex)) return null;
                const imageSource = stillImageMap[animal.englishKey];
                if (!imageSource) return null;

                return (
                  <DraggableAnimal
                    key={`animal-${squareIndex}-${shuffledIdx}`}
                    animal={animal}
                    imageSource={imageSource}
                    index={squareIndex}
                    squareSize={animalCardSize}
              isTablet={isTablet}
                    dragAnimValue={dragAnimValue}
                    onDragStart={(position) => {
                      console.log('Dragging animal:', animal.englishKey, 'squareIndex:', squareIndex);
                      setDraggingAnimal({ animal, imageSource, index: squareIndex });
                      dragAnimValue.setValue({ x: position.x, y: position.y });
                    }}
                    onDragMove={(position) => {
                      dragAnimValue.setValue({ x: position.x, y: position.y });
                    }}
                  onDragEnd={(position) => {
                    const zone = dropZonePosition.current;
                    const dropped = position.x >= zone.x && position.x <= zone.x + zone.width &&
                                   position.y >= zone.y && position.y <= zone.y + zone.height;
                    
                    // Use ref to get the CURRENT value, not the closure value
                    const currentIndex = currentSquareIndexRef.current;
                    const expectedAnimal = unlockedAnimals[currentIndex];
                    
                    console.log('Drop check - Dragged:', animal.englishKey, 'Expected:', expectedAnimal?.englishKey, 'currentIndex from ref:', currentIndex);
                    
                    if (dropped) {
                      if (animal.englishKey === expectedAnimal?.englishKey) {
                        // Correct drop
                        console.log('✅ Correct! Placing at currentIndex:', currentIndex);
                        setPlacedAnimals(prev => {
                          const newSet = new Set(prev);
                          newSet.add(currentIndex);
                          console.log('Updated placedAnimals:', Array.from(newSet));
                          return newSet;
                        });
                        
                        // Play "aha2" sound for correct drop
                        try {
                          const ahaSound = require('../assets/sounds/other/aha2.mp3');
                          const ahaPlayer = createAudioPlayer(ahaSound);
                          ahaPlayer.play();
                          ahaPlayer.addListener('playbackStatusUpdate', (status: any) => {
                            if (status.didJustFinish) ahaPlayer.remove();
                          });
                        } catch (error) {
                          console.warn('Error playing aha2 sound:', error);
                        }
                        
                        // Then play animal sound
                        setTimeout(() => {
                          if (animal.sound) playAnimalSound(animal.sound);
                        }, 300);
                      } else {
                        // Wrong drop - show red feedback and shake
                        console.log('❌ Wrong!');
                        setWrongDrop(true);
                        setWrongAnimalIndex(squareIndex);
                        
                        // Play "no" sound for wrong drop
                        try {
                          const noSound = require('../assets/sounds/other/no.mp3');
                          const noPlayer = createAudioPlayer(noSound);
                          noPlayer.play();
                          noPlayer.addListener('playbackStatusUpdate', (status: any) => {
                            if (status.didJustFinish) noPlayer.remove();
                          });
                        } catch (error) {
                          console.warn('Error playing no sound:', error);
                        }
                        
                        // Shake animation
                        Animated.sequence([
                          Animated.timing(dropZoneShake, {
                            toValue: 10,
                            duration: 50,
                            useNativeDriver: true,
                          }),
                          Animated.timing(dropZoneShake, {
                            toValue: -10,
                            duration: 50,
                            useNativeDriver: true,
                          }),
                          Animated.timing(dropZoneShake, {
                            toValue: 10,
                            duration: 50,
                            useNativeDriver: true,
                          }),
                          Animated.timing(dropZoneShake, {
                            toValue: 0,
                            duration: 50,
                            useNativeDriver: true,
                          }),
                        ]).start();
                        
                        // Reset red feedback after animation
                        setTimeout(() => {
                          setWrongDrop(false);
                          setWrongAnimalIndex(null);
                        }, 400);
                      }
                    }
                    
                    setDraggingAnimal(null);
                  }}
                  isWrongAnimal={wrongAnimalIndex === squareIndex}
                  />
                );
              })}
          </View>
        </ScrollView>
        </View>
      </View>

      {/* FLOATING OVERLAY AT ABSOLUTE ROOT - HIGHEST z-index */}
      {draggingAnimal && (
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            zIndex: 100000,
            elevation: 100000,
            transform: [
              { translateX: Animated.subtract(dragAnimValue.x, animalCardSize / 2) },
              { translateY: Animated.subtract(dragAnimValue.y, animalCardSize / 2) },
            ],
          }}
        >
            <View style={[
              styles.draggableAnimalCard,
              {
                width: animalCardSize,
                height: animalCardSize,
                padding: 8,
                opacity: 0.9,
                transform: [{ scale: 1.3 }, { rotate: '5deg' }],
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.5,
                shadowRadius: 10,
                elevation: 100000,
              }
            ]}>
              <Image 
                source={draggingAnimal.imageSource}
                style={{
                  width: animalCardSize * 0.8,
                  height: animalCardSize * 0.8,
                  resizeMode: 'contain',
                }}
              />
        </View>
      </Animated.View>
      )}
      </>
      )}
    </View>
  );
};

// Draggable animal component
const DraggableAnimal: React.FC<{
  animal: any;
  imageSource: any;
  index: number;
  squareSize: number;
  isTablet: boolean;
  dragAnimValue: Animated.ValueXY;
  onDragStart: (position: { x: number; y: number }) => void;
  onDragMove: (position: { x: number; y: number }) => void;
  onDragEnd: (position: { x: number; y: number }) => void;
  isWrongAnimal?: boolean;
}> = ({ animal, imageSource, index, squareSize, isTablet, dragAnimValue, onDragStart, onDragMove, onDragEnd, isWrongAnimal }) => {
  const opacity = useRef(new Animated.Value(1)).current;
  const startPosRef = useRef({ x: 0, y: 0 });
  const shake = useRef(new Animated.Value(0)).current;

  // Shake animation when wrong animal
  useEffect(() => {
    if (isWrongAnimal) {
      Animated.sequence([
        Animated.timing(shake, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shake, {
          toValue: -10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shake, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shake, {
          toValue: -10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shake, {
          toValue: 0,
          duration: 50,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isWrongAnimal]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onShouldBlockNativeResponder: () => true,
      onPanResponderGrant: (evt) => {
        const startPos = { x: evt.nativeEvent.pageX, y: evt.nativeEvent.pageY };
        startPosRef.current = startPos;
        
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 100,
          useNativeDriver: true,
        }).start();
        
        dragAnimValue.setValue(startPos);
        onDragStart(startPos);
      },
      onPanResponderMove: (evt, gestureState) => {
        // Calculate absolute position
        const currentPos = {
          x: startPosRef.current.x + gestureState.dx,
          y: startPosRef.current.y + gestureState.dy
        };
        
        // Update animated value directly (runs on native thread)
        dragAnimValue.setValue(currentPos);
        
        // Call onDragMove for state tracking only
        onDragMove(currentPos);
      },
      onPanResponderRelease: (evt, gestureState) => {
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
        
        const finalPos = {
          x: startPosRef.current.x + gestureState.dx,
          y: startPosRef.current.y + gestureState.dy
        };
        
        onDragEnd(finalPos);
      },
      onPanResponderTerminate: () => {
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  return (
    <View {...panResponder.panHandlers} style={{ 
      width: '20%',
      padding: 3,
    }}>
        <Animated.View style={{
        opacity,
        transform: [{ translateX: shake }],
      }}>
        <View style={[
          styles.draggableAnimalCard,
          {
              width: '100%',
            aspectRatio: 1,
            padding: 8,
            borderColor: isWrongAnimal ? '#FF0000' : '#FFD700',
            borderWidth: isWrongAnimal ? 4 : 3,
          }
        ]}>
          <Image 
            source={imageSource}
            style={{
              width: '80%',
              height: '80%',
              resizeMode: 'contain',
            }}
          />
        </View>
        </Animated.View>
        </View>
  );
};

const styles = StyleSheet.create({
  homeButton: {
    backgroundColor: 'orange',
    paddingVertical: 15,
    paddingHorizontal: 22,
    borderRadius: 30,
    alignItems: 'center',
          justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  backButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 15,
    paddingHorizontal: 22,
    borderRadius: 30,
          alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginVertical: 10,
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  draggableAnimalCard: {
            backgroundColor: 'white',
    borderRadius: 15,
    borderWidth: 3,
    borderColor: '#FFD700',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  draggableAnimalName: {
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginTop: 5,
  },
  dropZoneSquare: {
    borderRadius: 15,
    borderWidth: 3,
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
              shadowRadius: 3,
              elevation: 3,
  },
  checkmark: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#32CD32',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionMark: {
    fontSize: 50,
    color: '#DDD',
    fontWeight: 'bold',
  },
  nameCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  animalName: {
              fontWeight: 'bold',
              textAlign: 'center',
              color: '#333',
  },
  hintText: {
              color: '#666',
    marginTop: 4,
                  textAlign: 'center',
  },
  navButton: {
    backgroundColor: '#2196F3',
    width: 70,
    height: 70,
    borderRadius: 35,
                   justifyContent: 'center',
    alignItems: 'center',
                   shadowColor: '#000',
                   shadowOffset: { width: 0, height: 2 },
                   shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default DiscoverScreen; 
