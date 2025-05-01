// Preload background image at app startup - force immediate loading
import { Asset } from 'expo-asset';
import { AnimalType } from './AnimalType';

const backgroundImage = require('../../../assets/images/level-backgrounds/farm.png');
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
import foxData from '../../../assets/images/animals/json/fox-0.json';
import bearData from '../../../assets/images/animals/json/bear-0.json';
import raccoonData from '../../../assets/images/animals/json/raccoon-0.json';
import squirrelData from '../../../assets/images/animals/json/squirrel-0.json';
import hedgehogData from '../../../assets/images/animals/json/hedgehog-0.json';
import owlData from '../../../assets/images/animals/json/owl-0.json';
import wolfData from '../../../assets/images/animals/json/wolf-0.json';
import deerData from '../../../assets/images/animals/json/deer-0.json';
import mooseData from '../../../assets/images/animals/json/moose-0.json';
import mouseData from '../../../assets/images/animals/json/mouse-0.json';
import badgerData from '../../../assets/images/animals/json/badger-0.json';
import beaverData from '../../../assets/images/animals/json/beaver-0.json';
import boarData from '../../../assets/images/animals/json/boar-0.json';
import batData from '../../../assets/images/animals/json/bat-0.json';

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
const foxSpriteSheet = require('../../../assets/images/animals/png/fox-0.png');
const bearSpriteSheet = require('../../../assets/images/animals/png/bear-0.png');
const raccoonSpriteSheet = require('../../../assets/images/animals/png/raccoon-0.png');
const squirrelSpriteSheet = require('../../../assets/images/animals/png/squirrel-0.png');
const hedgehogSpriteSheet = require('../../../assets/images/animals/png/hedgehog-0.png');
const owlSpriteSheet = require('../../../assets/images/animals/png/owl-0.png');
const wolfSpriteSheet = require('../../../assets/images/animals/png/wolf-0.png');
const deerSpriteSheet = require('../../../assets/images/animals/png/deer-0.png');
const mooseSpriteSheet = require('../../../assets/images/animals/png/moose-0.png');
const mouseSpriteSheet = require('../../../assets/images/animals/png/mouse-0.png');
const badgerSpriteSheet = require('../../../assets/images/animals/png/badger-0.png');
const beaverSpriteSheet = require('../../../assets/images/animals/png/beaver-0.png');
const boarSpriteSheet = require('../../../assets/images/animals/png/boar-0.png');
const batSpriteSheet = require('../../../assets/images/animals/png/bat-0.png');

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
const { frames: foxFrames, meta: foxMeta } = foxData;
const { frames: bearFrames, meta: bearMeta } = bearData;
const { frames: raccoonFrames, meta: raccoonMeta } = raccoonData;
const { frames: squirrelFrames, meta: squirrelMeta } = squirrelData;
const { frames: hedgehogFrames, meta: hedgehogMeta } = hedgehogData;
const { frames: owlFrames, meta: owlMeta } = owlData;
const { frames: wolfFrames, meta: wolfMeta } = wolfData;
const { frames: deerFrames, meta: deerMeta } = deerData;
const { frames: mooseFrames, meta: mooseMeta } = mooseData;
const { frames: mouseFrames, meta: mouseMeta } = mouseData;
const { frames: badgerFrames, meta: badgerMeta } = badgerData;
const { frames: beaverFrames, meta: beaverMeta } = beaverData;
const { frames: boarFrames, meta: boarMeta } = boarData;
const { frames: batFrames, meta: batMeta } = batData;

// Use localization via a function parameter
import { useLocalization } from '../../../hooks/useLocalization';



export function getAnimals(): AnimalType[] {
  const { t } = useLocalization();
  const animals: AnimalType[] = [
    {
      id: 1,
      name: t('animals.cat'),
      type: 'sprite' as const,
      animalType: 'Farm' as const,
      source: catSpriteSheet,
      frames: catFrames,
      spriteSheetSize: catMeta.size,
      sound: require('../../../assets/sounds/cat.mp3'),
      labelSound: require('../../../assets/sounds/labels/cat.wav'),
      isMoving: true,
      movingDirection: 'left',
    },
    {
      id: 2,
      name: t('animals.dog'),
      type: 'sprite' as const,
      animalType: 'Farm' as const,
      source: dogSpriteSheet,
      frames: dogFrames,
      spriteSheetSize: dogMeta.size,
      sound: require('../../../assets/sounds/dog.mp3'),
      labelSound: require('../../../assets/sounds/labels/dog.wav'),
      isMoving: false,
    },
    {
      id: 3,
      name: t('animals.chicken'),
      type: 'sprite' as const,
      animalType: 'Farm' as const,
      source: chickenSpriteSheet,
      frames: chickenFrames,
      spriteSheetSize: chickenMeta.size,
      sound: require('../../../assets/sounds/chicken.mp3'),
      labelSound: require('../../../assets/sounds/labels/chicken.wav'),
      isMoving: false,
    },
    {
      id: 4,
      name: t('animals.chick'),
      type: 'sprite' as const,
      animalType: 'Farm' as const,
      source: chickSpriteSheet,
      frames: chickFrames,
      spriteSheetSize: chickMeta.size,
      sound: require('../../../assets/sounds/chick.mp3'),
      labelSound: require('../../../assets/sounds/labels/chick.wav'),
      isMoving: false,
    },
    {
      id: 5,
      name: t('animals.donkey'),
      type: 'sprite' as const,
      animalType: 'Farm' as const,
      source: donkeySpriteSheet,
      frames: donkeyFrames,
      spriteSheetSize: donkeyMeta.size,
      sound: require('../../../assets/sounds/donkey.mp3'),
      labelSound: require('../../../assets/sounds/labels/donkey.wav'),
      isMoving: true,
      movingDirection: 'left',
    },
    {
      id: 6,
      name: t('animals.cow'),
      type: 'sprite' as const,
      animalType: 'Farm' as const,
      source: cowSpriteSheet,
      frames: cowFrames,
      spriteSheetSize: cowMeta.size,
      sound: require('../../../assets/sounds/cow.mp3'),
      labelSound: require('../../../assets/sounds/labels/cow.wav'),
      isMoving: false,
    },
    {
      id: 7,
      name: t('animals.duck'),
      type: 'sprite' as const,
      animalType: 'Farm' as const,
      source: duckSpriteSheet,
      frames: duckFrames,
      spriteSheetSize: duckMeta.size,
      sound: require('../../../assets/sounds/duck.mp3'),
      labelSound: require('../../../assets/sounds/labels/duck.wav'),
      isMoving: false,
    },
    {
      id: 8,
      name: t('animals.goat'),
      type: 'sprite' as const,
      animalType: 'Farm' as const,
      source: goatSpriteSheet,
      frames: goatFrames,
      spriteSheetSize: goatMeta.size,
      sound: require('../../../assets/sounds/goat.mp3'),
      labelSound: require('../../../assets/sounds/labels/goat.wav'),
      isMoving: false,
    },
    {
      id: 9,
      name: t('animals.goose'),
      type: 'sprite' as const,
      animalType: 'Farm' as const,
      source: gooseSpriteSheet,
      frames: gooseFrames,
      spriteSheetSize: gooseMeta.size,
      sound: require('../../../assets/sounds/goose.mp3'),
      labelSound: require('../../../assets/sounds/labels/goose.wav'),
      isMoving: false,
    },
    {
      id: 10,
      name: t('animals.horse'),
      type: 'sprite' as const,
      animalType: 'Farm' as const,
      source: horseSpriteSheet,
      frames: horseFrames,
      spriteSheetSize: horseMeta.size,
      sound: require('../../../assets/sounds/horse.mp3'),
      labelSound: require('../../../assets/sounds/labels/horse.wav'),
      isMoving: true,
      movingDirection: 'left',
    },
    {
      id: 11,
      name: t('animals.llama'),
      type: 'sprite' as const,
      animalType: 'Farm' as const,
      source: llamaSpriteSheet,
      frames: llamaFrames,
      spriteSheetSize: llamaMeta.size,
      sound: require('../../../assets/sounds/llama.mp3'),
      labelSound: require('../../../assets/sounds/labels/llama.wav'),
      isMoving: true,
      movingDirection: 'right',
    },
    {
      id: 12,
      name: t('animals.pig'),
      type: 'sprite' as const,
      animalType: 'Farm' as const,
      source: pigSpriteSheet,
      frames: pigFrames,
      spriteSheetSize: pigMeta.size,
      sound: require('../../../assets/sounds/pig.mp3'),
      labelSound: require('../../../assets/sounds/labels/pig.wav'),
      isMoving: false,
    },
    {
      id: 13,
      name: t('animals.rabbit'),
      type: 'sprite' as const,
      animalType: 'Farm' as const,
      source: rabbitSpriteSheet,
      frames: rabbitFrames,
      spriteSheetSize: rabbitMeta.size,
      sound: require('../../../assets/sounds/rabbit.mp3'),
      labelSound: require('../../../assets/sounds/labels/rabbit.wav'),
      isMoving: false,
    },
    {
      id: 14,
      name: t('animals.sheep'),
      type: 'sprite' as const,
      animalType: 'Farm' as const,
      source: sheepSpriteSheet,
      frames: sheepFrames,
      spriteSheetSize: sheepMeta.size,
      sound: require('../../../assets/sounds/sheep.mp3'),
      labelSound: require('../../../assets/sounds/labels/sheep.wav'),
      isMoving: false,
    },
    {
      id: 15,
      name: t('animals.rooster'),
      type: 'sprite' as const,
      animalType: 'Farm' as const,
      source: roosterSpriteSheet,
      frames: roosterFrames,
      spriteSheetSize: roosterMeta.size,
      sound: require('../../../assets/sounds/rooster.mp3'),
      labelSound: require('../../../assets/sounds/labels/rooster.wav'),
      isMoving: true,
      movingDirection: 'left',
    },
    {
      id: 16,
      name: t('animals.turkey'),
      type: 'sprite' as const,
      animalType: 'Farm' as const,
      source: turkeySpriteSheet,
      frames: turkeyFrames,
      spriteSheetSize: turkeyMeta.size,
      sound: require('../../../assets/sounds/turkey.mp3'),
      labelSound: require('../../../assets/sounds/labels/turkey.wav'),
      isMoving: false,
    },
    {
      id: 17,
      name: t('animals.badger'),
      type: 'sprite' as const,
      animalType: 'Forest' as const,
      source: badgerSpriteSheet,
      frames: badgerFrames,
      spriteSheetSize: badgerMeta.size,
      sound: require('../../../assets/sounds/badger.mp3'),
      labelSound: require('../../../assets/sounds/labels/badger.wav'),
      isMoving: false,
    },
    {
      id: 18,
      name: t('animals.fox'),
      type: 'sprite' as const,
      animalType: 'Forest' as const,
      source: foxSpriteSheet,
      frames: foxFrames,
      spriteSheetSize: foxMeta.size,
      sound: require('../../../assets/sounds/fox.mp3'),
      labelSound: require('../../../assets/sounds/labels/fox.wav'),
      isMoving: false,
    },
    {
      id: 19,
      name: t('animals.bear'),
      type: 'sprite' as const,
      animalType: 'Forest' as const,
      source: bearSpriteSheet,
      frames: bearFrames,
      spriteSheetSize: bearMeta.size,
      sound: require('../../../assets/sounds/bear.mp3'),
      labelSound: require('../../../assets/sounds/labels/bear.wav'),
      isMoving: false,
    },
    {
      id: 20,
      name: t('animals.raccoon'),
      type: 'sprite' as const,
      animalType: 'Forest' as const,
      source: raccoonSpriteSheet,
      frames: raccoonFrames,
      spriteSheetSize: raccoonMeta.size,
      sound: require('../../../assets/sounds/raccoon.mp3'),
      labelSound: require('../../../assets/sounds/labels/raccoon.wav'),
      isMoving: true,
      movingDirection: 'right',
    },
    {
      id: 21,
      name: t('animals.squirrel'),
      type: 'sprite' as const,
      animalType: 'Forest' as const,
      source: squirrelSpriteSheet,
      frames: squirrelFrames,
      spriteSheetSize: squirrelMeta.size,
      sound: require('../../../assets/sounds/squirrel.mp3'),
      labelSound: require('../../../assets/sounds/labels/squirrel.wav'),
      isMoving: false,
    },
    {
      id: 22,
      name: t('animals.hedgehog'),
      type: 'sprite' as const,
      animalType: 'Forest' as const,
      source: hedgehogSpriteSheet,
      frames: hedgehogFrames,
      spriteSheetSize: hedgehogMeta.size,
      sound: require('../../../assets/sounds/hedgehog.mp3'),
      labelSound: require('../../../assets/sounds/labels/hedgehog.wav'),
      isMoving: true,
      movingDirection: 'right',
    },
    {
      id: 23,
      name: t('animals.owl'),
      type: 'sprite' as const,
      animalType: 'Forest' as const,
      source: owlSpriteSheet,
      frames: owlFrames,
      spriteSheetSize: owlMeta.size,
      sound: require('../../../assets/sounds/owl.mp3'),
      labelSound: require('../../../assets/sounds/labels/owl.wav'),
      isMoving: false,
    },
    {
      id: 24,
      name: t('animals.wolf'),
      type: 'sprite' as const,
      animalType: 'Forest' as const,
      source: wolfSpriteSheet,
      frames: wolfFrames,
      spriteSheetSize: wolfMeta.size,
      sound: require('../../../assets/sounds/wolf.mp3'),
      labelSound: require('../../../assets/sounds/labels/wolf.wav'),
      isMoving: false,
    },
    {
      id: 25,
      name: t('animals.deer'),
      type: 'sprite' as const,
      animalType: 'Forest' as const,
      source: deerSpriteSheet,
      frames: deerFrames,
      spriteSheetSize: deerMeta.size,
      sound: require('../../../assets/sounds/deer.mp3'),
      labelSound: require('../../../assets/sounds/labels/deer.wav'),
      isMoving: true,
      movingDirection: 'left',
    },
    {
      id: 26,
      name: t('animals.moose'),
      type: 'sprite' as const,
      animalType: 'Forest' as const,
      source: mooseSpriteSheet,
      frames: mooseFrames,
      spriteSheetSize: mooseMeta.size,
      sound: require('../../../assets/sounds/moose.mp3'),
      labelSound: require('../../../assets/sounds/labels/moose.wav'),
      isMoving: true,
      movingDirection: 'left',
    },
    {
      id: 27,
      name: t('animals.mouse'),
      type: 'sprite' as const,
      animalType: 'Forest' as const,
      source: mouseSpriteSheet,
      frames: mouseFrames,
      spriteSheetSize: mouseMeta.size,
      sound: require('../../../assets/sounds/mouse.mp3'),
      labelSound: require('../../../assets/sounds/labels/mouse.wav'),
      isMoving: true,
      movingDirection: 'left',
    },
    {
      id: 29,
      name: t('animals.beaver'),
      type: 'sprite' as const,
      animalType: 'Forest' as const,
      source: beaverSpriteSheet,
      frames: beaverFrames,
      spriteSheetSize: beaverMeta.size,
      sound: require('../../../assets/sounds/beaver.mp3'),
      labelSound: require('../../../assets/sounds/labels/beaver.wav'),
      isMoving: true,
      movingDirection: 'left',
    },
    {
      id: 30,
      name: t('animals.boar'),
      type: 'sprite' as const,
      animalType: 'Forest' as const,
      source: boarSpriteSheet,
      frames: boarFrames,
      spriteSheetSize: boarMeta.size,
      sound: require('../../../assets/sounds/boar.mp3'),
      labelSound: require('../../../assets/sounds/labels/boar.wav'),
      isMoving: true,
      movingDirection: 'left',
    },
    {
      id: 31,
      name: t('animals.bat'),
      type: 'sprite' as const,
      animalType: 'Forest' as const,
      source: batSpriteSheet,
      frames: batFrames,
      spriteSheetSize: batMeta.size,
      sound: require('../../../assets/sounds/bat.mp3'),
      labelSound: require('../../../assets/sounds/labels/bat.wav'),
      isMoving: false,
    },
  ];

  // Preload all animal images regardless of type
  animals.forEach(animal => {
    if (typeof animal.source === 'number') {
      Asset.fromModule(animal.source).downloadAsync();
    }
  });

  return animals;
}
