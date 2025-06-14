// Preload background image at app startup - force immediate loading
import { Asset } from 'expo-asset';
import { AnimalType } from './AnimalType';

const backgroundImage = require('../assets/images/level-backgrounds/farm.png');
Asset.fromModule(backgroundImage).downloadAsync().catch(error =>
  console.warn('Background image preload error:', error)
);

// Load the cow animation JSON data
import catData from '../assets/images/animals/json/cat-0.json'
import chickenData from '../assets/images/animals/json/chicken-0.json';
import dogData from '../assets/images/animals/json/dog-0.json';
import donkeyData from '../assets/images/animals/json/donkey-0.json';
import cowData from '../assets/images/animals/json/cow-0.json';
import chickData from '../assets/images/animals/json/chick-0.json';
import duckData from '../assets/images/animals/json/duck-0.json';
import goatData from '../assets/images/animals/json/goat-0.json';
import gooseData from '../assets/images/animals/json/goose-0.json';
import horseData from '../assets/images/animals/json/horse-0.json';
import llamaData from '../assets/images/animals/json/llama-0.json';
import pigData from '../assets/images/animals/json/pig-0.json';
import rabbitData from '../assets/images/animals/json/rabbit-0.json';
import roosterData from '../assets/images/animals/json/rooster-0.json';
import sheepData from '../assets/images/animals/json/sheep-0.json';
import turkeyData from '../assets/images/animals/json/turkey-0.json';
import foxData from '../assets/images/animals/json/fox-0.json';
import bearData from '../assets/images/animals/json/bear-0.json';
import raccoonData from '../assets/images/animals/json/raccoon-0.json';
import squirrelData from '../assets/images/animals/json/squirrel-0.json';
import hedgehogData from '../assets/images/animals/json/hedgehog-0.json';
import owlData from '../assets/images/animals/json/owl-0.json';
import wolfData from '../assets/images/animals/json/wolf-0.json';
import deerData from '../assets/images/animals/json/deer-0.json';
import mooseData from '../assets/images/animals/json/moose-0.json';
import mouseData from '../assets/images/animals/json/mouse-0.json';
import badgerData from '../assets/images/animals/json/badger-0.json';
import beaverData from '../assets/images/animals/json/beaver-0.json'; 
import boarData from '../assets/images/animals/json/boar-0.json';
import batData from '../assets/images/animals/json/bat-0.json';
import whiteBearData from '../assets/images/animals/json/whitebear-0.json';
import whiteFoxData from '../assets/images/animals/json/whitefox-0.json';
import reindeerData from '../assets/images/animals/json/reindeer-0.json';
import sealData from '../assets/images/animals/json/seal-0.json';
import snowyOwlData from '../assets/images/animals/json/snowyowl-0.json';
import penguinData from '../assets/images/animals/json/ping-0.json';
import camelData from '../assets/images/animals/json/camel-0.json';
import caracalData from '../assets/images/animals/json/caracal-0.json';
import desertTortoiseData from '../assets/images/animals/json/dtortoise-0.json';
import fenexFoxData from '../assets/images/animals/json/fennecfox-0.json';
import iguanaData from '../assets/images/animals/json/iguana-0.json';
import jackalData from '../assets/images/animals/json/jackal-0.json';
import jerboaData from '../assets/images/animals/json/jerboa-0.json';
import oryxData from '../assets/images/animals/json/oryx-0.json';
import sandCatData from '../assets/images/animals/json/sandcat-0.json';
import scorpionData from '../assets/images/animals/json/scorpion-0.json';
import antelopeData from '../assets/images/animals/json/antelope-0.json';
import bizonData from '../assets/images/animals/json/bizon-0.json';
import elephantData from '../assets/images/animals/json/elephant-0.json';
import gepardData from '../assets/images/animals/json/gepard-0.json';
import hyenaData from '../assets/images/animals/json/hyena-0.json';
import leonData from '../assets/images/animals/json/leon-0.json';
import tigerData from '../assets/images/animals/json/tiger-0.json';
import wildBoarData from '../assets/images/animals/json/wildboar-0.json';
import zebraData from '../assets/images/animals/json/zebra-0.json';
import eagleData from '../assets/images/animals/json/eagle-0.json';
import flamingoData from '../assets/images/animals/json/flamingo-0.json';
import giraffeData from '../assets/images/animals/json/giraffe-0.json';
import rhinocerosData from '../assets/images/animals/json/rhinoceros-0.json';
import antData from '../assets/images/animals/json/ant-0.json';
import beeData from '../assets/images/animals/json/bee-0.json';
import butterflyData from '../assets/images/animals/json/butterfly-0.json';
import caterpillarData from '../assets/images/animals/json/caterpillar-0.json';
import cockroachData from '../assets/images/animals/json/cockroach-0.json';
import dragonflyData from '../assets/images/animals/json/dragonfly-0.json';
import flyData from '../assets/images/animals/json/fly-0.json';
import grasshopperData from '../assets/images/animals/json/grasshopper-0.json';
import ladyBagData from '../assets/images/animals/json/ladybag-0.json';
import mosquitoData from '../assets/images/animals/json/mosquito-0.json';
import snailData from '../assets/images/animals/json/snail-0.json';
import spiderData from '../assets/images/animals/json/spider-0.json';
import crabData from '../assets/images/animals/json/crab-0.json';
import dolphinData from '../assets/images/animals/json/dolphin-0.json';
import fishData from '../assets/images/animals/json/fish-0.json';
import jellyfishData from '../assets/images/animals/json/jellyfish-0.json';
import lobsterData from '../assets/images/animals/json/lobster-0.json';
import octopusData from '../assets/images/animals/json/octopus-0.json';
import seaTurtleData from '../assets/images/animals/json/seaturtle-0.json';
import seahorseData from '../assets/images/animals/json/seahorse-0.json';
import sharkData from '../assets/images/animals/json/shark-0.json';
import shrimpData from '../assets/images/animals/json/shrimp-0.json';
import starfishData from '../assets/images/animals/json/starfish-0.json';
import stingrayData from '../assets/images/animals/json/stringray-0.json';
import whaleData from '../assets/images/animals/json/whale-0.json';
import canaryData from '../assets/images/animals/json/canary-0.json';
import doveData from '../assets/images/animals/json/dove-0.json';
import parrotData from '../assets/images/animals/json/parrot-0.json';
import pelicanData from '../assets/images/animals/json/pelican-0.json';
import ravenData from '../assets/images/animals/json/raven-0.json';
import seagullData from '../assets/images/animals/json/seagull-0.json';
import sparrowData from '../assets/images/animals/json/sparrow-0.json';
import storkData from '../assets/images/animals/json/stork-0.json';
import swanData from '../assets/images/animals/json/swan-0.json';
import toucanData from '../assets/images/animals/json/toucan-0.json';
import woodpeckerData from '../assets/images/animals/json/woodpecker-0.json';


// Load the actual PNG sprite sheet
const catSpriteSheet = require('../assets/images/animals/png/cat-0.png');
const chickenSpriteSheet = require('../assets/images/animals/png/chicken-0.png');
const dogSpriteSheet = require('../assets/images/animals/png/dog-0.png');
const donkeySpriteSheet = require('../assets/images/animals/png/donkey-0.png');
const cowSpriteSheet = require('../assets/images/animals/png/cow-0.png');
const chickSpriteSheet = require('../assets/images/animals/png/chick-0.png');
const duckSpriteSheet = require('../assets/images/animals/png/duck-0.png');
const goatSpriteSheet = require('../assets/images/animals/png/goat-0.png');
const gooseSpriteSheet = require('../assets/images/animals/png/goose-0.png');
const horseSpriteSheet = require('../assets/images/animals/png/horse-0.png');
const llamaSpriteSheet = require('../assets/images/animals/png/llama-0.png');
const pigSpriteSheet = require('../assets/images/animals/png/pig-0.png');
const rabbitSpriteSheet = require('../assets/images/animals/png/rabbit-0.png');
const roosterSpriteSheet = require('../assets/images/animals/png/rooster-0.png');
const sheepSpriteSheet = require('../assets/images/animals/png/sheep-0.png');
const turkeySpriteSheet = require('../assets/images/animals/png/turkey-0.png');
const foxSpriteSheet = require('../assets/images/animals/png/fox-0.png');
const bearSpriteSheet = require('../assets/images/animals/png/bear-0.png');
const raccoonSpriteSheet = require('../assets/images/animals/png/raccoon-0.png');
const squirrelSpriteSheet = require('../assets/images/animals/png/squirrel-0.png');
const hedgehogSpriteSheet = require('../assets/images/animals/png/hedgehog-0.png');
const owlSpriteSheet = require('../assets/images/animals/png/owl-0.png');
const wolfSpriteSheet = require('../assets/images/animals/png/wolf-0.png');
const deerSpriteSheet = require('../assets/images/animals/png/deer-0.png');
const mooseSpriteSheet = require('../assets/images/animals/png/moose-0.png');
const mouseSpriteSheet = require('../assets/images/animals/png/mouse-0.png');
const badgerSpriteSheet = require('../assets/images/animals/png/badger-0.png');
const beaverSpriteSheet = require('../assets/images/animals/png/beaver-0.png');
const boarSpriteSheet = require('../assets/images/animals/png/boar-0.png');
const batSpriteSheet = require('../assets/images/animals/png/bat-0.png');
const whiteBearSprite = require('../assets/images/animals/png/whitebear-0.png');
const whiteFoxSprite = require('../assets/images/animals/png/whitefox-0.png');
const reindeerSprite = require('../assets/images/animals/png/reindeer-0.png');
const sealSprite = require('../assets/images/animals/png/seal-0.png');
const snowyOwlSprite = require('../assets/images/animals/png/snowyowl-0.png');
const penguinSprite = require('../assets/images/animals/png/ping-0.png');
const camelSprite = require('../assets/images/animals/png/camel-0.png');
const caracalSprite = require('../assets/images/animals/png/caracal-0.png');
const desertTortoiseSprite = require('../assets/images/animals/png/dtortoise-0.png');
const fenexFoxSprite = require('../assets/images/animals/png/fenncefox-0.png');
const iguanaSprite = require('../assets/images/animals/png/iguana-0.png');
const jackalSprite = require('../assets/images/animals/png/jackal-0.png');
const jerboaSprite = require('../assets/images/animals/png/jerboa-0.png');
const oryxSprite = require('../assets/images/animals/png/oryx-0.png');
const sandCatSprite = require('../assets/images/animals/png/sandcat-0.png');
const scorpionSprite = require('../assets/images/animals/png/scorpion-0.png');
const antelopeSprite = require('../assets/images/animals/png/Antelope-0.png');
const bizonSprite = require('../assets/images/animals/png/bizon-0.png');
const elephantSprite = require('../assets/images/animals/png/elephant-0.png');
const gepardSprite = require('../assets/images/animals/png/gepard-0.png');
const hyenaSprite = require('../assets/images/animals/png/hyena-0.png');
const leonSprite = require('../assets/images/animals/png/leon-0.png');
const tigerSprite = require('../assets/images/animals/png/tiger-0.png');
const wildBoarSprite = require('../assets/images/animals/png/wildboar-0.png');
const zebraSprite = require('../assets/images/animals/png/zebra-0.png');
const eagleSprite = require('../assets/images/animals/png/eagle-0.png');
const flamingoSprite = require('../assets/images/animals/png/flamingo-0.png');
const giraffeSprite = require('../assets/images/animals/png/giraffe-0.png');
const rhinocerosSprite = require('../assets/images/animals/png/rhinoceros-0.png');
const antSprite = require('../assets/images/animals/png/ant-0.png');
const beeSprite = require('../assets/images/animals/png/bee-0.png');
const butterflySprite = require('../assets/images/animals/png/butterfly-0.png');
const caterpillarSprite = require('../assets/images/animals/png/caterpillar-0.png');
const cockroachSprite = require('../assets/images/animals/png/cockroach-0.png');
const dragonflySprite = require('../assets/images/animals/png/dragonfly-0.png');
const flySprite = require('../assets/images/animals/png/fly-0.png');
const grasshopperSprite = require('../assets/images/animals/png/grasshopper-0.png');
const ladyBagSprite = require('../assets/images/animals/png/ladybag-0.png');
const mosquitoSprite = require('../assets/images/animals/png/mosquito-0.png');
const snailSprite = require('../assets/images/animals/png/snail-0.png');
const spiderSprite = require('../assets/images/animals/png/spider-0.png');
const crabSprite = require('../assets/images/animals/png/crab-0.png');
const dolphinSprite = require('../assets/images/animals/png/dolphin-0.png');
const fishSprite = require('../assets/images/animals/png/fish-0.png');
const jellyfishSprite = require('../assets/images/animals/png/jellyfish-0.png');
const lobsterSprite = require('../assets/images/animals/png/lobster-0.png');
const octopusSprite = require('../assets/images/animals/png/octopus-0.png');
const seaTurtleSprite = require('../assets/images/animals/png/seaturtle-0.png');
const seahorseSprite = require('../assets/images/animals/png/seahorse-0.png');
const sharkSprite = require('../assets/images/animals/png/shark-0.png');
const shrimpSprite = require('../assets/images/animals/png/shrimp-0.png');
const starfishSprite = require('../assets/images/animals/png/starfish-0.png');
const stingraySprite = require('../assets/images/animals/png/stringray-0.png');
const whaleSprite = require('../assets/images/animals/png/whale-0.png');
const canarySprite = require('../assets/images/animals/png/canary-0.png');
const doveSprite = require('../assets/images/animals/png/dove-0.png');
const parrotSprite = require('../assets/images/animals/png/parrot-0.png');
const pelicanSprite = require('../assets/images/animals/png/pelican-0.png');
const ravenSprite = require('../assets/images/animals/png/raven-0.png');
const seagullSprite = require('../assets/images/animals/png/seagull-0.png');
const sparrowSprite = require('../assets/images/animals/png/sparrow-0.png');
const storkSprite = require('../assets/images/animals/png/stork-0.png');
const swanSprite = require('../assets/images/animals/png/swan-0.png');
const toucanSprite = require('../assets/images/animals/png/toucan-0.png');
const woodpeckerSprite = require('../assets/images/animals/png/woodpecker-0.png');


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
const { frames: whiteBearFrames, meta: whiteBearMeta } = whiteBearData;
const { frames: whiteFoxFrames, meta: whiteFoxMeta } = whiteFoxData;
const { frames: reindeerFrames, meta: reindeerMeta } = reindeerData;
const { frames: sealFrames, meta: sealMeta } = sealData;
const { frames: snowyOwlFrames, meta: snowyOwlMeta } = snowyOwlData;
const { frames: penguinFrames, meta: penguinMeta } = penguinData;
const { frames: camelFrames, meta: camelMeta } = camelData;
const { frames: caracalFrames, meta: caracalMeta } = caracalData;
const { frames: desertTortoiseFrames, meta: desertTortoiseMeta } = desertTortoiseData;
const { frames: fenexFoxFrames, meta: fenexFoxMeta } = fenexFoxData;
const { frames: iguanaFrames, meta: iguanaMeta } = iguanaData;
const { frames: jackalFrames, meta: jackalMeta } = jackalData;
const { frames: jerboaFrames, meta: jerboaMeta } = jerboaData;
const { frames: oryxFrames, meta: oryxMeta } = oryxData;
const { frames: sandCatFrames, meta: sandCatMeta } = sandCatData;
const { frames: scorpionFrames, meta: scorpionMeta } = scorpionData;
const { frames: antelopeFrames, meta: antelopeMeta } = antelopeData;
const { frames: bizonFrames, meta: bizonMeta } = bizonData;
const { frames: elephantFrames, meta: elephantMeta } = elephantData;
const { frames: gepardFrames, meta: gepardMeta } = gepardData;
const { frames: hyenaFrames, meta: hyenaMeta } = hyenaData;
const { frames: leonFrames, meta: leonMeta } = leonData;
const { frames: tigerFrames, meta: tigerMeta } = tigerData;
const { frames: wildBoarFrames, meta: wildBoarMeta } = wildBoarData;
const { frames: zebraFrames, meta: zebraMeta } = zebraData;
const { frames: eagleFrames, meta: eagleMeta } = eagleData;
const { frames: flamingoFrames, meta: flamingoMeta } = flamingoData;
const { frames: giraffeFrames, meta: giraffeMeta } = giraffeData;
const { frames: rhinocerosFrames, meta: rhinocerosMeta } = rhinocerosData;
const { frames: antFrames, meta: antMeta } = antData;
const { frames: beeFrames, meta: beeMeta } = beeData;
const { frames: butterflyFrames, meta: butterflyMeta } = butterflyData;
const { frames: caterpillarFrames, meta: caterpillarMeta } = caterpillarData;
const { frames: cockroachFrames, meta: cockroachMeta } = cockroachData;
const { frames: dragonflyFrames, meta: dragonflyMeta } = dragonflyData;
const { frames: flyFrames, meta: flyMeta } = flyData;
const { frames: grasshopperFrames, meta: grasshopperMeta } = grasshopperData;
const { frames: ladyBagFrames, meta: ladyBagMeta } = ladyBagData; 
const { frames: mosquitoFrames, meta: mosquitoMeta } = mosquitoData;
const { frames: snailFrames, meta: snailMeta } = snailData;
const { frames: spiderFrames, meta: spiderMeta } = spiderData;
const { frames: crabFrames, meta: crabMeta } = crabData;
const { frames: dolphinFrames, meta: dolphinMeta } = dolphinData;
const { frames: fishFrames, meta: fishMeta } = fishData;
const { frames: jellyfishFrames, meta: jellyfishMeta } = jellyfishData;
const { frames: lobsterFrames, meta: lobsterMeta } = lobsterData;
const { frames: octopusFrames, meta: octopusMeta } = octopusData;
const { frames: seaTurtleFrames, meta: seaTurtleMeta } = seaTurtleData;
const { frames: seahorseFrames, meta: seahorseMeta } = seahorseData;
const { frames: sharkFrames, meta: sharkMeta } = sharkData;
const { frames: shrimpFrames, meta: shrimpMeta } = shrimpData;
const { frames: starfishFrames, meta: starfishMeta } = starfishData;
const { frames: stingrayFrames, meta: stingrayMeta } = stingrayData;
const { frames: whaleFrames, meta: whaleMeta } = whaleData;
const { frames: canaryFrames, meta: canaryMeta } = canaryData;
const { frames: doveFrames, meta: doveMeta } = doveData;
const { frames: parrotFrames, meta: parrotMeta } = parrotData;
const { frames: pelicanFrames, meta: pelicanMeta } = pelicanData;
const { frames: ravenFrames, meta: ravenMeta } = ravenData;
const { frames: seagullFrames, meta: seagullMeta } = seagullData;
const { frames: sparrowFrames, meta: sparrowMeta } = sparrowData;
const { frames: storkFrames, meta: storkMeta } = storkData;
const { frames: swanFrames, meta: swanMeta } = swanData;
const { frames: toucanFrames, meta: toucanMeta } = toucanData;
const { frames: woodpeckerFrames, meta: woodpeckerMeta } = woodpeckerData;


// Use localization via a function parameter
import { useLocalization } from '../hooks/useLocalization';



export function getAnimals(): AnimalType[] {
  const { t } = useLocalization();
  const animals: AnimalType[] = [
    {
      id: 1,
      name: t('animals.dog'),
      type: 'sprite' as const,
      animalType: 'Farm' as const,
      source: dogSpriteSheet,
      frames: dogFrames,
      spriteSheetSize: dogMeta.size,
      sound: require('../assets/sounds/dog.mp3'),
      labelSound: require('../assets/sounds/labels/dog.wav'),
      isMoving: false,
      movingDirection: 'left',
    },
    {
      id: 2,
      name: t('animals.cat'),
      type: 'sprite' as const,
      animalType: 'Farm' as const,
      source: catSpriteSheet,
      frames: catFrames,
      spriteSheetSize: catMeta.size,
      sound: require('../assets/sounds/cat.mp3'),
      labelSound: require('../assets/sounds/labels/cat.wav'),
      isMoving: true,
    },
    {
      id: 3,
      name: t('animals.chicken'),
      type: 'sprite' as const,
      animalType: 'Farm' as const,
      source: chickenSpriteSheet,
      frames: chickenFrames,
      spriteSheetSize: chickenMeta.size,
      sound: require('../assets/sounds/chicken.mp3'),
      labelSound: require('../assets/sounds/labels/chicken.wav'),
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
      sound: require('../assets/sounds/chick.mp3'),
      labelSound: require('../assets/sounds/labels/chick.wav'),
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
      sound: require('../assets/sounds/donkey.mp3'),
      labelSound: require('../assets/sounds/labels/donkey.wav'),
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
      sound: require('../assets/sounds/cow.mp3'),
      labelSound: require('../assets/sounds/labels/cow.wav'),
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
      sound: require('../assets/sounds/duck.mp3'),
      labelSound: require('../assets/sounds/labels/duck.wav'),
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
      sound: require('../assets/sounds/goat.mp3'),
      labelSound: require('../assets/sounds/labels/goat.wav'),
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
      sound: require('../assets/sounds/goose.mp3'),
      labelSound: require('../assets/sounds/labels/goose.wav'),
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
      sound: require('../assets/sounds/horse.mp3'),
      labelSound: require('../assets/sounds/labels/horse.wav'),
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
      sound: require('../assets/sounds/llama.mp3'),
      labelSound: require('../assets/sounds/labels/llama.wav'),
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
      sound: require('../assets/sounds/pig.mp3'),
      labelSound: require('../assets/sounds/labels/pig.wav'),
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
      sound: require('../assets/sounds/rabbit.mp3'),
      labelSound: require('../assets/sounds/labels/rabbit.wav'),
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
      sound: require('../assets/sounds/sheep.mp3'),
      labelSound: require('../assets/sounds/labels/sheep.wav'),
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
      sound: require('../assets/sounds/rooster.mp3'),
      labelSound: require('../assets/sounds/labels/rooster.wav'),
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
      sound: require('../assets/sounds/turkey.mp3'),
      labelSound: require('../assets/sounds/labels/turkey.wav'),
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
      sound: require('../assets/sounds/badger.mp3'),
      labelSound: require('../assets/sounds/labels/badger.wav'),
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
      sound: require('../assets/sounds/fox.mp3'),
      labelSound: require('../assets/sounds/labels/fox.wav'),
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
      sound: require('../assets/sounds/bear.mp3'),
      labelSound: require('../assets/sounds/labels/bear.wav'),
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
      sound: require('../assets/sounds/raccoon.mp3'),
      labelSound: require('../assets/sounds/labels/raccoon.wav'),
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
      sound: require('../assets/sounds/squirrel.mp3'),
      labelSound: require('../assets/sounds/labels/squirrel.wav'),
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
      sound: require('../assets/sounds/hedgehog.mp3'),
      labelSound: require('../assets/sounds/labels/hedgehog.wav'),
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
      sound: require('../assets/sounds/owl.mp3'),
      labelSound: require('../assets/sounds/labels/owl.wav'),
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
      sound: require('../assets/sounds/wolf.mp3'),
      labelSound: require('../assets/sounds/labels/wolf.wav'),
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
      sound: require('../assets/sounds/deer.mp3'),
      labelSound: require('../assets/sounds/labels/deer.wav'),
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
      sound: require('../assets/sounds/moose.mp3'),
      labelSound: require('../assets/sounds/labels/moose.wav'),
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
      sound: require('../assets/sounds/mouse.mp3'),
      labelSound: require('../assets/sounds/labels/mouse.wav'),
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
      sound: require('../assets/sounds/beaver.mp3'),
      labelSound: require('../assets/sounds/labels/beaver.wav'),
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
      sound: require('../assets/sounds/boar.mp3'),
      labelSound: require('../assets/sounds/labels/boar.wav'),
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
      sound: require('../assets/sounds/bat.mp3'),
      labelSound: require('../assets/sounds/labels/bat.wav'),
      isMoving: false,
    },
    {
      id: 32,
      name: t('animals.whiteBear'),
      type: 'sprite' as const,
      animalType: 'Arctic' as const,
      source: whiteBearSprite,
      frames: whiteBearFrames,
      spriteSheetSize: whiteBearMeta.size,
      sound: require('../assets/sounds/cat.mp3'),
      labelSound: require('../assets/sounds/labels/cat.wav'),
      isMoving: true,
    },
    {
      id: 33,
      name: t('animals.whiteFox'),
      type: 'sprite' as const,
      animalType: 'Arctic' as const,
      source: whiteFoxSprite,
      frames: whiteFoxFrames,
      spriteSheetSize: whiteFoxMeta.size,
      sound: require('../assets/sounds/cat.mp3'),
      labelSound: require('../assets/sounds/labels/cat.wav'),
      isMoving: true,
    },
    {
      id: 34,
      name: t('animals.reindeer'),
      type: 'sprite' as const,
      animalType: 'Arctic' as const,
      source: reindeerSprite,
      frames: reindeerFrames,
      spriteSheetSize: reindeerMeta.size,
      sound: require('../assets/sounds/cat.mp3'),
      labelSound: require('../assets/sounds/labels/cat.wav'),
      isMoving: true,
    },
    {
      id: 35,
      name: t('animals.seal'),
      type: 'sprite' as const,
      animalType: 'Arctic' as const,
      source: sealSprite,
      frames: sealFrames,
      spriteSheetSize: sealMeta.size,
      sound: require('../assets/sounds/cat.mp3'),
      labelSound: require('../assets/sounds/labels/cat.wav'),
      isMoving: false,
    }, 
    {
      id: 36,
      name: t('animals.snowyowl'),
      type: 'sprite' as const,
      animalType: 'Arctic' as const,
      source: snowyOwlSprite,
      frames: snowyOwlFrames,
      spriteSheetSize: snowyOwlMeta.size,
      sound: require('../assets/sounds/cat.mp3'),
      labelSound: require('../assets/sounds/labels/cat.wav'),
      isMoving: false,
    },
    {
      id: 37,
      name: t('animals.penguin'),
      type: 'sprite' as const,
      animalType: 'Arctic' as const,
      source: penguinSprite,
      frames: penguinFrames,
      spriteSheetSize: penguinMeta.size,
      sound: require('../assets/sounds/cat.mp3'),
      labelSound: require('../assets/sounds/labels/cat.wav'),
      isMoving: false,
    },
     {
    id: 38,
    name: t('animals.camel'),
    type: 'sprite' as const,
    animalType: 'Desert' as const,
    source: camelSprite,
    frames: camelFrames,
    spriteSheetSize: camelMeta.size,
    sound: require('../assets/sounds/camel.mp3'),
    labelSound: require('../assets/sounds/labels/cat.wav'),
    isMoving: true,
    movingDirection: 'left',
  },
  {
    id: 39,
    name: t('animals.caracal'),
    type: 'sprite' as const,
    animalType: 'Desert' as const,
    source: caracalSprite,
    frames: caracalFrames,
    spriteSheetSize: caracalMeta.size,
    sound: require('../assets/sounds/caracal.mp3'),
    labelSound: require('../assets/sounds/labels/cat.wav'),
    isMoving: false,
  },
  {
    id: 40,
    name: t('animals.desertTortoise'),
    type: 'sprite' as const,
    animalType: 'Desert' as const,
    source: desertTortoiseSprite,
    frames: desertTortoiseFrames,
    spriteSheetSize: desertTortoiseMeta.size,
    sound: require('../assets/sounds/turt.mp3'),
    labelSound: require('../assets/sounds/labels/cat.wav'),
    isMoving: true,
    movingDirection: 'right',
  },
  {
    id: 41,
    name: t('animals.fennecFox'),
    type: 'sprite' as const,
    animalType: 'Desert' as const,
    source: fenexFoxSprite,
    frames: fenexFoxFrames,
    spriteSheetSize: fenexFoxMeta.size,
    sound: require('../assets/sounds/fennecfox.mp3'),
    labelSound: require('../assets/sounds/labels/cat.wav'),
    isMoving: true,
    movingDirection: 'right',
  },
  {
    id: 42,
    name: t('animals.iguana'),
    type: 'sprite' as const,
    animalType: 'Desert' as const,
    source: iguanaSprite,
    frames: iguanaFrames,
    spriteSheetSize: iguanaMeta.size,
    sound: require('../assets/sounds/iguana.mp3'),
    labelSound: require('../assets/sounds/labels/cat.wav'),
    isMoving: false,
  },
  {
    id: 43,
    name: t('animals.jackal'),
    type: 'sprite' as const,
    animalType: 'Desert' as const,
    source: jackalSprite,
    frames: jackalFrames,
    spriteSheetSize: jackalMeta.size,
    sound: require('../assets/sounds/jackal.mp3'),
    labelSound: require('../assets/sounds/labels/cat.wav'),
    isMoving: true,
    movingDirection: 'left',
  },
  {
    id: 44,
    name: t('animals.jerboa'),
    type: 'sprite' as const,
    animalType: 'Desert' as const,
    source: jerboaSprite,
    frames: jerboaFrames,
    spriteSheetSize: jerboaMeta.size,
    sound: require('../assets/sounds/rabbit.mp3'),
    labelSound: require('../assets/sounds/labels/cat.wav'),
    isMoving: false,
  },
  {
    id: 45,
    name: t('animals.oryx'),
    type: 'sprite' as const,
    animalType: 'Desert' as const,
    source: oryxSprite,
    frames: oryxFrames,
    spriteSheetSize: oryxMeta.size,
    sound: require('../assets/sounds/oryx.mp3'),
    labelSound: require('../assets/sounds/labels/cat.wav'),
    isMoving: true,
    movingDirection: 'right',
  },
  {
    id: 46,
    name: t('animals.sandCat'),
    type: 'sprite' as const,
    animalType: 'Desert' as const,
    source: sandCatSprite,
    frames: sandCatFrames,
    spriteSheetSize: sandCatMeta.size,
    sound: require('../assets/sounds/sandcat.mp3'),
    labelSound: require('../assets/sounds/labels/cat.wav'),
    isMoving: true,
    movingDirection: 'left',
  },
  {
    id: 47,
    name: t('animals.scorpion'),
    type: 'sprite' as const,
    animalType: 'Desert' as const,
    source: scorpionSprite,
    frames: scorpionFrames,
    spriteSheetSize: scorpionMeta.size,
    sound: require('../assets/sounds/scorpion.mp3'),
    labelSound: require('../assets/sounds/labels/cat.wav'),
    isMoving: false,
  },
  {
  id: 48,
  name: t('animals.antelope'),
  type: 'sprite' as const,
  animalType: 'Savannah' as const,
  source: antelopeSprite,
  frames: antelopeFrames,
  spriteSheetSize: antelopeMeta.size,
  sound: require('../assets/sounds/antelope.mp3'),
  labelSound: require('../assets/sounds/labels/cat.wav'),
  isMoving: false,
},
{
  id: 49,
  name: t('animals.bison'),
  type: 'sprite' as const,
  animalType: 'Savannah' as const,
  source: bizonSprite,
  frames: bizonFrames,
  spriteSheetSize: bizonMeta.size,
  sound: require('../assets/sounds/bizon.mp3'),
  labelSound: require('../assets/sounds/labels/cat.wav'),
  isMoving: false,
},
{
  id: 50,
  name: t('animals.elephant'),
  type: 'sprite' as const,
  animalType: 'Savannah' as const,
  source: elephantSprite,
  frames: elephantFrames,
  spriteSheetSize: elephantMeta.size,
  sound: require('../assets/sounds/elephant.mp3'),
  labelSound: require('../assets/sounds/labels/cat.wav'),
  isMoving: true,
},
{
  id: 51,
  name: t('animals.gepard'),
  type: 'sprite' as const,
  animalType: 'Savannah' as const,
  source: gepardSprite,
  frames: gepardFrames,
  spriteSheetSize: gepardMeta.size,
  sound: require('../assets/sounds/cat.mp3'),
  labelSound: require('../assets/sounds/labels/cat.wav'),
  isMoving: true,
},
{
  id: 52,
  name: t('animals.hyena'),
  type: 'sprite' as const,
  animalType: 'Savannah' as const,
  source: hyenaSprite,
  frames: hyenaFrames,
  spriteSheetSize: hyenaMeta.size,
  sound: require('../assets/sounds/cat.mp3'),
  labelSound: require('../assets/sounds/labels/cat.wav'),
  isMoving: true,
},
{
  id: 53,
  name: t('animals.lion'),
  type: 'sprite' as const,
  animalType: 'Savannah' as const,
  source: leonSprite,
  frames: leonFrames,
  spriteSheetSize: leonMeta.size,
  sound: require('../assets/sounds/cat.mp3'),
  labelSound: require('../assets/sounds/labels/cat.wav'),
  isMoving: false,
},
{
  id: 54,
  name: t('animals.tiger'),
  type: 'sprite' as const,
  animalType: 'Savannah' as const,
  source: tigerSprite,
  frames: tigerFrames,
  spriteSheetSize: tigerMeta.size,
  sound: require('../assets/sounds/cat.mp3'),
  labelSound: require('../assets/sounds/labels/cat.wav'),
  isMoving: true,
  movingDirection: 'right',
},
{
  id: 55,
  name: t('animals.wildboar'),
  type: 'sprite' as const,
  animalType: 'Savannah' as const,
  source: wildBoarSprite,
  frames: wildBoarFrames,
  spriteSheetSize: wildBoarMeta.size,
  sound: require('../assets/sounds/cat.mp3'),
  labelSound: require('../assets/sounds/labels/cat.wav'),
  isMoving: true,
},
{
  id: 56,
  name: t('animals.zebra'),
  type: 'sprite' as const,
  animalType: 'Savannah' as const,
  source: zebraSprite,
  frames: zebraFrames,
  spriteSheetSize: zebraMeta.size,
  sound: require('../assets/sounds/cat.mp3'),
  labelSound: require('../assets/sounds/labels/cat.wav'),
  isMoving: false,
},
 {
    id: 57,
    name: t('animals.eagle'),
    type: 'sprite' as const,
    animalType: 'Savannah' as const,
    source: eagleSprite,
    frames: eagleFrames,
    spriteSheetSize: eagleMeta.size,
    sound: require('../assets/sounds/cat.mp3'),
    labelSound: require('../assets/sounds/labels/cat.wav'),
    isMoving: false,
  },
  {
    id: 58,
    name: t('animals.flamingo'),
    type: 'sprite' as const,
    animalType: 'Savannah' as const,
    source: flamingoSprite,
    frames: flamingoFrames,
    spriteSheetSize: flamingoMeta.size,
    sound: require('../assets/sounds/cat.mp3'),
    labelSound: require('../assets/sounds/labels/cat.wav'),
    isMoving: false,
  },
  {
    id: 59,
    name: t('animals.giraffe'),
    type: 'sprite' as const,
    animalType: 'Savannah' as const,
    source: giraffeSprite,
    frames: giraffeFrames,
    spriteSheetSize: giraffeMeta.size,
    sound: require('../assets/sounds/cat.mp3'),
    labelSound: require('../assets/sounds/labels/cat.wav'),
    isMoving: true,
    movingDirection: 'right',
  },
  {
    id: 60,
    name: t('animals.rhinoceros'),
    type: 'sprite' as const,
    animalType: 'Savannah' as const,
    source: rhinocerosSprite,
    frames: rhinocerosFrames,
    spriteSheetSize: rhinocerosMeta.size,
    sound: require('../assets/sounds/cat.mp3'),
    labelSound: require('../assets/sounds/labels/cat.wav'),
    isMoving: true,
  },
  {
    id: 61,
    name: t('animals.ant'),
    type: 'sprite' as const,
    animalType: 'Insects' as const,
    source: antSprite,
    frames: antData.frames,
    spriteSheetSize: antData.meta.size,
    sound: require('../assets/sounds/cat.mp3'),
    labelSound: require('../assets/sounds/labels/cat.wav'),
    isMoving: false,
  },
  {
    id: 62,
    name: t('animals.bee'),
    type: 'sprite' as const,
    animalType: 'Insects' as const,
    source: beeSprite,
    frames: beeData.frames,
    spriteSheetSize: beeData.meta.size,
    sound: require('../assets/sounds/cat.mp3'),
    labelSound: require('../assets/sounds/labels/cat.wav'),
    isMoving: false,
  },
  {
    id: 63,
    name: t('animals.butterfly'),
    type: 'sprite' as const,
    animalType: 'Insects' as const,
    source: butterflySprite,
    frames: butterflyData.frames,
    spriteSheetSize: butterflyData.meta.size,
    sound: require('../assets/sounds/cat.mp3'),
    labelSound: require('../assets/sounds/labels/cat.wav'),
    isMoving: false,
  },
  {
    id: 64,
    name: t('animals.caterpillar'),
    type: 'sprite' as const,
    animalType: 'Insects' as const,
    source: caterpillarSprite,
    frames: caterpillarData.frames,
    spriteSheetSize: caterpillarData.meta.size,
    sound: require('../assets/sounds/cat.mp3'),
    labelSound: require('../assets/sounds/labels/cat.wav'),
    isMoving: false,
  },
  {
    id: 65,
    name: t('animals.cockroach'),
    type: 'sprite' as const,
    animalType: 'Insects' as const,
    source: cockroachSprite,
    frames: cockroachData.frames,
    spriteSheetSize: cockroachData.meta.size,
    sound: require('../assets/sounds/cat.mp3'),
    labelSound: require('../assets/sounds/labels/cat.wav'),
    isMoving: false,
  },
  {
    id: 66,
    name: t('animals.dragonfly'),
    type: 'sprite' as const,
    animalType: 'Insects' as const,
    source: dragonflySprite,
    frames: dragonflyData.frames,
    spriteSheetSize: dragonflyData.meta.size,
    sound: require('../assets/sounds/cat.mp3'),
    labelSound: require('../assets/sounds/labels/cat.wav'),
    isMoving: false,
  },
  {
    id: 67,
    name: t('animals.fly'),
    type: 'sprite' as const,
    animalType: 'Insects' as const,
    source: flySprite,
    frames: flyData.frames,
    spriteSheetSize: flyData.meta.size,
    sound: require('../assets/sounds/cat.mp3'),
    labelSound: require('../assets/sounds/labels/cat.wav'),
    isMoving: false,
  },
  {
    id: 68,
    name: t('animals.grasshopper'),
    type: 'sprite' as const,
    animalType: 'Insects' as const,
    source: grasshopperSprite,
    frames: grasshopperData.frames,
    spriteSheetSize: grasshopperData.meta.size,
    sound: require('../assets/sounds/cat.mp3'),
    labelSound: require('../assets/sounds/labels/cat.wav'),
    isMoving: false,
  },
  {
    id: 69,
    name: t('animals.ladyBag'),
    type: 'sprite' as const,
    animalType: 'Insects' as const,
    source: ladyBagSprite,
    frames: ladyBagData.frames,
    spriteSheetSize: ladyBagData.meta.size,
    sound: require('../assets/sounds/cat.mp3'),
    labelSound: require('../assets/sounds/labels/cat.wav'),
    isMoving: false,
  },
  {
    id: 70,
    name: t('animals.mosquito'),
    type: 'sprite' as const,
    animalType: 'Insects' as const,
    source: mosquitoSprite,
    frames: mosquitoData.frames,
    spriteSheetSize: mosquitoData.meta.size,
    sound: require('../assets/sounds/cat.mp3'),
    labelSound: require('../assets/sounds/labels/cat.wav'),
    isMoving: false,
  },
  {
    id: 71,
    name: t('animals.snail'),
    type: 'sprite' as const,
    animalType: 'Insects' as const,
    source: snailSprite,
    frames: snailData.frames,
    spriteSheetSize: snailData.meta.size,
    sound: require('../assets/sounds/cat.mp3'),
    labelSound: require('../assets/sounds/labels/cat.wav'),
    isMoving: false,
  },
  {
    id: 72,
    name: t('animals.spider'),
    type: 'sprite' as const,
    animalType: 'Insects' as const,
    source: spiderSprite,
    frames: spiderData.frames,
    spriteSheetSize: spiderData.meta.size,
    sound: require('../assets/sounds/cat.mp3'),
    labelSound: require('../assets/sounds/labels/cat.wav'),
    isMoving: false,
  },
  {
    id: 73,
    name: t('animals.crab'),
    type: 'sprite' as const,
    animalType: 'Ocean' as const,
    source: crabSprite,
    frames: crabFrames,
    spriteSheetSize: crabMeta.size,
    sound: require('../assets/sounds/cat.mp3'),
    labelSound: require('../assets/sounds/labels/cat.wav'),
    isMoving: false,
  },
  {
    id: 74,
    name: t('animals.dolphin'),
    type: 'sprite' as const,
    animalType: 'Ocean' as const,
    source: dolphinSprite,
    frames: dolphinFrames,
    spriteSheetSize: dolphinMeta.size,
    sound: require('../assets/sounds/cat.mp3'),
    labelSound: require('../assets/sounds/labels/cat.wav'),
    isMoving: true,
    movingDirection: 'right',
  },
  {
    id: 75,
    name: t('animals.fish'),
    type: 'sprite' as const,
    animalType: 'Ocean' as const,
    source: fishSprite,
    frames: fishFrames,
    spriteSheetSize: fishMeta.size,
    sound: require('../assets/sounds/cat.mp3'),
    labelSound: require('../assets/sounds/labels/cat.wav'),
    isMoving: true,
    movingDirection: 'left',
  },
  {
    id: 76,
    name: t('animals.jellyfish'),
    type: 'sprite' as const,
    animalType: 'Ocean' as const,
    source: jellyfishSprite,
    frames: jellyfishFrames,
    spriteSheetSize: jellyfishMeta.size,
    sound: require('../assets/sounds/cat.mp3'),
    labelSound: require('../assets/sounds/labels/cat.wav'),
    isMoving: false,
  },
  {
    id: 77,
    name: t('animals.lobster'),
    type: 'sprite' as const,
    animalType: 'Ocean' as const,
    source: lobsterSprite,
    frames: lobsterFrames,
    spriteSheetSize: lobsterMeta.size,
    sound: require('../assets/sounds/cat.mp3'),
    labelSound: require('../assets/sounds/labels/cat.wav'),
    isMoving: false,
  },
  {
    id: 78,
    name: t('animals.octopus'),
    type: 'sprite' as const,
    animalType: 'Ocean' as const,
    source: octopusSprite,
    frames: octopusFrames,
    spriteSheetSize: octopusMeta.size,
    sound: require('../assets/sounds/cat.mp3'),
    labelSound: require('../assets/sounds/labels/cat.wav'),
    isMoving: false,
  },
  {
    id: 79,
    name: t('animals.seaTurtle'),
    type: 'sprite' as const,
    animalType: 'Ocean' as const,
    source: seaTurtleSprite,
    frames: seaTurtleFrames,
    spriteSheetSize: seaTurtleMeta.size,
    sound: require('../assets/sounds/cat.mp3'),
    labelSound: require('../assets/sounds/labels/cat.wav'),
    isMoving: true,
    movingDirection: 'right',
  },
  {
    id: 80,
    name: t('animals.seahorse'),
    type: 'sprite' as const,
    animalType: 'Ocean' as const,
    source: seahorseSprite,
    frames: seahorseFrames,
    spriteSheetSize: seahorseMeta.size,
    sound: require('../assets/sounds/cat.mp3'),
    labelSound: require('../assets/sounds/labels/cat.wav'),
    isMoving: false,
  },
  {
    id: 81,
    name: t('animals.shark'),
    type: 'sprite' as const,
    animalType: 'Ocean' as const,
    source: sharkSprite,
    frames: sharkFrames,
    spriteSheetSize: sharkMeta.size,
    sound: require('../assets/sounds/cat.mp3'),
    labelSound: require('../assets/sounds/labels/cat.wav'),
    isMoving: true,
    movingDirection: 'left',
  },
  {
    id: 82,
    name: t('animals.shrimp'),
    type: 'sprite' as const,
    animalType: 'Ocean' as const,
    source: shrimpSprite,
    frames: shrimpFrames,
    spriteSheetSize: shrimpMeta.size,
    sound: require('../assets/sounds/cat.mp3'),
    labelSound: require('../assets/sounds/labels/cat.wav'),
    isMoving: false,
  },
  {
    id: 83,
    name: t('animals.starfish'),
    type: 'sprite' as const,
    animalType: 'Ocean' as const,
    source: starfishSprite,
    frames: starfishFrames,
    spriteSheetSize: starfishMeta.size,
    sound: require('../assets/sounds/cat.mp3'),
    labelSound: require('../assets/sounds/labels/cat.wav'),
    isMoving: false,
  },
  {
    id: 84,
    name: t('animals.stingray'),
    type: 'sprite' as const,
    animalType: 'Ocean' as const,
    source: stingraySprite,
    frames: stingrayFrames,
    spriteSheetSize: stingrayMeta.size,
    sound: require('../assets/sounds/cat.mp3'),
    labelSound: require('../assets/sounds/labels/cat.wav'),
    isMoving: true,
    movingDirection: 'left',
  },
  {
    id: 85,
    name: t('animals.whale'),
    type: 'sprite' as const,
    animalType: 'Ocean' as const,
    source: whaleSprite,
    frames: whaleFrames,
    spriteSheetSize: whaleMeta.size,
    sound: require('../assets/sounds/cat.mp3'),
    labelSound: require('../assets/sounds/labels/cat.wav'),
    isMoving: true,
    movingDirection: 'right',
  },
   {
    id: 86,
    name: t('animals.canary'),
    type: 'sprite' as const,
    animalType: 'Birds' as const,
    source: canarySprite,
    frames: canaryFrames,
    spriteSheetSize: canaryMeta.size,
    sound: require('../assets/sounds/cat.mp3'),
    labelSound: require('../assets/sounds/labels/cat.wav'),
    isMoving: false,
  },
  {
    id: 87,
    name: t('animals.dove'),
    type: 'sprite' as const,
    animalType: 'Birds' as const,
    source: doveSprite,
    frames: doveFrames,
    spriteSheetSize: doveMeta.size,
    sound: require('../assets/sounds/cat.mp3'),
    labelSound: require('../assets/sounds/labels/cat.wav'),
    isMoving: false,
  },
  {
    id: 88,
    name: t('animals.parrot'),
    type: 'sprite' as const,
    animalType: 'Birds' as const,
    source: parrotSprite,
    frames: parrotFrames,
    spriteSheetSize: parrotMeta.size,
    sound: require('../assets/sounds/cat.mp3'),
    labelSound: require('../assets/sounds/labels/cat.wav'),
    isMoving: false,
  },
  {
    id: 89,
    name: t('animals.pelican'),
    type: 'sprite' as const,
    animalType: 'Birds' as const,
    source: pelicanSprite,
    frames: pelicanFrames,
    spriteSheetSize: pelicanMeta.size,
    sound: require('../assets/sounds/cat.mp3'),
    labelSound: require('../assets/sounds/labels/cat.wav'),
    isMoving: false,
  },
  {
    id: 90,
    name: t('animals.raven'),
    type: 'sprite' as const,
    animalType: 'Birds' as const,
    source: ravenSprite,
    frames: ravenFrames,
    spriteSheetSize: ravenMeta.size,
    sound: require('../assets/sounds/cat.mp3'),
    labelSound: require('../assets/sounds/labels/cat.wav'),
    isMoving: false,
  },
  {
    id: 91,
    name: t('animals.seagull'),
    type: 'sprite' as const,
    animalType: 'Birds' as const,
    source: seagullSprite,
    frames: seagullFrames,
    spriteSheetSize: seagullMeta.size,
    sound: require('../assets/sounds/cat.mp3'),
    labelSound: require('../assets/sounds/labels/cat.wav'),
    isMoving: false,
  },
  {
    id: 92,
    name: t('animals.sparrow'),
    type: 'sprite' as const,
    animalType: 'Birds' as const,
    source: sparrowSprite,
    frames: sparrowFrames,
    spriteSheetSize: sparrowMeta.size,
    sound: require('../assets/sounds/cat.mp3'),
    labelSound: require('../assets/sounds/labels/cat.wav'),
    isMoving: false,
  },
  {
    id: 93,
    name: t('animals.stork'),
    type: 'sprite' as const,
    animalType: 'Birds' as const,
    source: storkSprite,
    frames: storkFrames,
    spriteSheetSize: storkMeta.size,
    sound: require('../assets/sounds/cat.mp3'),
    labelSound: require('../assets/sounds/labels/cat.wav'),
    isMoving: false,
  },
  {
    id: 94,
    name: t('animals.swan'),
    type: 'sprite' as const,
    animalType: 'Birds' as const,
    source: swanSprite,
    frames: swanFrames,
    spriteSheetSize: swanMeta.size,
    sound: require('../assets/sounds/cat.mp3'),
    labelSound: require('../assets/sounds/labels/cat.wav'),
    isMoving: false,
  },
  {
    id: 95,
    name: t('animals.toucan'),
    type: 'sprite' as const,
    animalType: 'Birds' as const,
    source: toucanSprite,
    frames: toucanFrames,
    spriteSheetSize: toucanMeta.size,
    sound: require('../assets/sounds/cat.mp3'),
    labelSound: require('../assets/sounds/labels/cat.wav'),
    isMoving: false,
  },
  {
    id: 96,
    name: t('animals.woodpecker'),
    type: 'sprite' as const,
    animalType: 'Birds' as const,
    source: woodpeckerSprite,
    frames: woodpeckerFrames,
    spriteSheetSize: woodpeckerMeta.size,
    sound: require('../assets/sounds/cat.mp3'),
    labelSound: require('../assets/sounds/labels/cat.wav'),
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
