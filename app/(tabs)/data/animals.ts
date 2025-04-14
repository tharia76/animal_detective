// Preload background image at app startup - force immediate loading
import { Asset } from 'expo-asset';
import { AnimalType } from './AnimalType';

const backgroundImage = require('../../../assets/images/farm.jpg');
Asset.fromModule(backgroundImage).downloadAsync().catch(error => 
    console.warn('Background image preload error:', error)
  );
  
  // Load the cow animation JSON data
  import catData from '../../../assets/images/animals/json/cat-0.json';
  import chickenData from '../../../assets/images/animals/json/chicken-0.json';
  import dogData from '../../../assets/images/animals/json/dog-0.json';
  import donkeyData from '../../../assets/images/animals/json/donkey-0.json';
  import cowData from '../../../assets/images/animals/json/cow-0.json';
  import chickData from '../../../assets/images/animals/json/chick-0.json';
  import duckData from '../../../assets/images/animals/json/duck-0.json';
  import goatData from '../../../assets/images/animals/json/goat-0.json';
  import gooseData from '../../../assets/images/animals/json/goose-0.json';
  import horseData from '../../../assets/images/animals/json/horse-0.json';
  import llamaData from '../../../assets/images/animals/json/llama-0.json';
  import pigData from '../../../assets/images/animals/json/pig-0.json';
  import rabbitData from '../../../assets/images/animals/json/rabbit-0.json';
  import roosterData from '../../../assets/images/animals/json/rooster-0.json';
  import sheepData from '../../../assets/images/animals/json/sheep-0.json';
  import turkeyData from '../../../assets/images/animals/json/turkey-0.json';
  
  
  // Load the actual PNG sprite sheet
  const catSpriteSheet = require('../../../assets/images/animals/png/cat-0.png');  
  const chickenSpriteSheet = require('../../../assets/images/animals/png/chicken-0.png');
  const dogSpriteSheet = require('../../../assets/images/animals/png/dog-0.png');
  const donkeySpriteSheet = require('../../../assets/images/animals/png/donkey-0.png');
  const cowSpriteSheet = require('../../../assets/images/animals/png/cow-0.png');
  const chickSpriteSheet = require('../../../assets/images/animals/png/chick-0.png');
  const duckSpriteSheet = require('../../../assets/images/animals/png/duck-0.png');
  const goatSpriteSheet = require('../../../assets/images/animals/png/goat-0.png');
  const gooseSpriteSheet = require('../../../assets/images/animals/png/goose-0.png');
  const horseSpriteSheet = require('../../../assets/images/animals/png/horse-0.png');
  const llamaSpriteSheet = require('../../../assets/images/animals/png/llama-0.png');
  const pigSpriteSheet = require('../../../assets/images/animals/png/pig-0.png');
  const rabbitSpriteSheet = require('../../../assets/images/animals/png/rabbit-0.png');
  const roosterSpriteSheet = require('../../../assets/images/animals/png/rooster-0.png');
  const sheepSpriteSheet = require('../../../assets/images/animals/png/sheep-0.png');
  const turkeySpriteSheet = require('../../../assets/images/animals/png/turkey-0.png');
  
  // Extract the frames array and meta from JSON
  const { frames: catFrames, meta: catMeta } = catData;
  const { frames: chickenFrames, meta: chickenMeta } = chickenData;
  const { frames: dogFrames, meta: dogMeta } = dogData;
  const { frames: donkeyFrames, meta: donkeyMeta } = donkeyData;
  const { frames: cowFrames, meta: cowMeta } = cowData;
  const { frames: chickFrames, meta: chickMeta } = chickData;
  const { frames: duckFrames, meta: duckMeta } = duckData;
  const { frames: goatFrames, meta: goatMeta } = goatData;
  const { frames: gooseFrames, meta: gooseMeta } = gooseData;
  const { frames: horseFrames, meta: horseMeta } = horseData;
  const { frames: llamaFrames, meta: llamaMeta } = llamaData;
  const { frames: pigFrames, meta: pigMeta } = pigData;
  const { frames: rabbitFrames, meta: rabbitMeta } = rabbitData;
  const { frames: roosterFrames, meta: roosterMeta } = roosterData;
  const { frames: sheepFrames, meta: sheepMeta } = sheepData;
  const { frames: turkeyFrames, meta: turkeyMeta } = turkeyData;
  
  // Pre-define animals array at module level to avoid re-creation
  export const animals: AnimalType[] = [
    {
      id: 1,
      name: 'Cat',
      type: 'sprite' as const,
      animalType: 'Farm' as const,
      source: catSpriteSheet,
      frames: catFrames,
      spriteSheetSize: catMeta.size,
      sound: require('../../../assets/sounds/cat.mp3'),
      labelSound: require('../../../assets/sounds/labels/cat.wav')
    },
    {
      id: 2,
      name: 'Dog',
      type: 'sprite' as const,
      animalType: 'Farm' as const,
      source: dogSpriteSheet,
      frames: dogFrames,
      spriteSheetSize: dogMeta.size,
      sound: require('../../../assets/sounds/dog.mp3'),
      labelSound: require('../../../assets/sounds/labels/dog.wav')
    },
    {
      id: 3,
      name: 'Chicken',
      type: 'sprite' as const,
      animalType: 'Farm' as const,
      source: chickenSpriteSheet,
      frames: chickenFrames,
      spriteSheetSize: chickenMeta.size,
      sound: require('../../../assets/sounds/chicken.mp3'),
      labelSound: require('../../../assets/sounds/labels/chicken.wav')
    },
    {
      id: 4,
      name: 'Chick',
      type: 'sprite' as const,
      animalType: 'Farm' as const,
      source: chickSpriteSheet,
      frames: chickFrames,
      spriteSheetSize: chickMeta.size,
      sound: require('../../../assets/sounds/chick.mp3'),
      labelSound: require('../../../assets/sounds/labels/chick.wav')
    },
    {
      id: 5,
      name: 'Donkey',
      type: 'sprite' as const,
      animalType: 'Farm' as const,
      source: donkeySpriteSheet,
      frames: donkeyFrames,
      spriteSheetSize: donkeyMeta.size,
      sound: require('../../../assets/sounds/donkey.mp3'),
      labelSound: require('../../../assets/sounds/labels/donkey.wav')
    },
    {
      id: 6,
      name: 'Cow',
      type: 'sprite' as const,
      animalType: 'Farm' as const,
      source: cowSpriteSheet,
      frames: cowFrames,
      spriteSheetSize: cowMeta.size,
      sound: require('../../../assets/sounds/cow.mp3'),
      labelSound: require('../../../assets/sounds/labels/cow.wav')
    },
    {
      id: 7,
      name: 'Duck',
      type: 'sprite' as const,
      animalType: 'Farm' as const,
      source: duckSpriteSheet,
      frames: duckFrames,
      spriteSheetSize: duckMeta.size,
      sound: require('../../../assets/sounds/duck.mp3'),
      labelSound: require('../../../assets/sounds/labels/duck.wav')
    },  
    {
      id: 8,
      name: 'Goat',
      type: 'sprite' as const,
      animalType: 'Farm' as const,
      source: goatSpriteSheet,
      frames: goatFrames,
      spriteSheetSize: goatMeta.size,
      sound: require('../../../assets/sounds/goat.mp3'),
      labelSound: require('../../../assets/sounds/labels/goat.wav')
    },
    {
      id: 9,
      name: 'Goose',
      type: 'sprite' as const,
      animalType: 'Farm' as const,
      source: gooseSpriteSheet,
      frames: gooseFrames,
      spriteSheetSize: gooseMeta.size,
      sound: require('../../../assets/sounds/goose.mp3'),
      labelSound: require('../../../assets/sounds/labels/goose.wav')
    },
    {
      id: 10,
      name: 'Horse',
      type: 'sprite' as const,
      animalType: 'Farm' as const,
      source: horseSpriteSheet,
      frames: horseFrames,
      spriteSheetSize: horseMeta.size,
      sound: require('../../../assets/sounds/horse.mp3'),
      labelSound: require('../../../assets/sounds/labels/horse.wav')
    },
    {
      id: 11,
      name: 'Llama',
      type: 'sprite' as const,
      animalType: 'Farm' as const,
      source: llamaSpriteSheet,
      frames: llamaFrames,
      spriteSheetSize: llamaMeta.size,
      sound: require('../../../assets/sounds/llama.mp3'),
      labelSound: require('../../../assets/sounds/labels/llama.wav')
    },
    {
      id: 12,
      name: 'Pig',
      type: 'sprite' as const,
      animalType: 'Farm' as const,
      source: pigSpriteSheet,
      frames: pigFrames,
      spriteSheetSize: pigMeta.size,
      sound: require('../../../assets/sounds/pig.mp3'),
      labelSound: require('../../../assets/sounds/labels/pig.wav')
    },
    {
      id: 13,
      name: 'Rabbit',
      type: 'sprite' as const,
      animalType: 'Farm' as const,
      source: rabbitSpriteSheet,
      frames: rabbitFrames,
      spriteSheetSize: rabbitMeta.size,
      sound: require('../../../assets/sounds/rabbit.mp3'),
      labelSound: require('../../../assets/sounds/labels/rabbit.wav')
    },
    {
      id: 14,
      name: 'Sheep',
      type: 'sprite' as const,
      animalType: 'Farm' as const,
      source: sheepSpriteSheet,
      frames: sheepFrames,
      spriteSheetSize: sheepMeta.size,
      sound: require('../../../assets/sounds/sheep.mp3'),
      labelSound: require('../../../assets/sounds/labels/sheep.wav')
    },  
    {
      id: 15,
      name: 'Rooster',
      type: 'sprite' as const,
      animalType: 'Farm' as const,
      source: roosterSpriteSheet,
      frames: roosterFrames,
      spriteSheetSize: roosterMeta.size,
      sound: require('../../../assets/sounds/rooster.mp3'),
      labelSound: require('../../../assets/sounds/labels/rooster.wav')
    },
    {
      id: 16,
      name: 'Turkey',
      type: 'sprite' as const,
      animalType: 'Farm' as const,
      source: turkeySpriteSheet,
      frames: turkeyFrames,
      spriteSheetSize: turkeyMeta.size,
      sound: require('../../../assets/sounds/turkey.mp3'),
      labelSound: require('../../../assets/sounds/labels/turkey.wav')
    }
  ];
  
  // Preload all animal images regardless of type
  animals.forEach(animal => {
    if (typeof animal.source === 'number') {
      Asset.fromModule(animal.source).downloadAsync();
    }
  });
  