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
import antEaterData from '../assets/images/animals/json/anteater-0.json';
import asianElephantData from '../assets/images/animals/json/aelephant-0.json';
import bengalTigerData from '../assets/images/animals/json/btiger-0.json';
import blackPantherData from '../assets/images/animals/json/panther-0.json';
import capybaraData from '../assets/images/animals/json/capybara-0.json';
import chameleonData from '../assets/images/animals/json/chameleon-0.json';
import chimpanzeeData from '../assets/images/animals/json/chimpanzee-0.json';
import crocodileData from '../assets/images/animals/json/crocodile-0.json';
import frogData from '../assets/images/animals/json/frog-0.json';
import gorillaData from '../assets/images/animals/json/gorilla-0.json';
import hippopotamusData from '../assets/images/animals/json/hippopotamus-0.json';
import jaguarData from '../assets/images/animals/json/jaguar-0.json';
import lemurData from '../assets/images/animals/json/lemur-0.json';
import lizardData from '../assets/images/animals/json/lizard-0.json';
import orangutanData from '../assets/images/animals/json/orangutan-0.json';
import slothData from '../assets/images/animals/json/sloth-0.json';
import snakeData from '../assets/images/animals/json/snake-0.json';
import turtleData from '../assets/images/animals/json/turtle-0.json';



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
const fenexFoxSprite = require('../assets/images/animals/png/fennecfox-0.png');
const iguanaSprite = require('../assets/images/animals/png/iguana-0.png');
const jackalSprite = require('../assets/images/animals/png/jackal-0.png');
const jerboaSprite = require('../assets/images/animals/png/jerboa-0.png');
const oryxSprite = require('../assets/images/animals/png/oryx-0.png');
const sandCatSprite = require('../assets/images/animals/png/sandcat-0.png');
const scorpionSprite = require('../assets/images/animals/png/scorpion-0.png');
const antelopeSprite = require('../assets/images/animals/png/antelope-0.png');
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
const antEaterSprite = require('../assets/images/animals/png/anteater-0.png');
const asianElephantSprite = require('../assets/images/animals/png/aelephant-0.png');
const bengalTigerSprite = require('../assets/images/animals/png/btiger-0.png');
const blackPantherSprite = require('../assets/images/animals/png/panther-0.png');
const capybaraSprite = require('../assets/images/animals/png/capybara-0.png');
const chameleonSprite = require('../assets/images/animals/png/chameleon-0.png');
const chimpanzeeSprite = require('../assets/images/animals/png/chimpanzee-0.png');
const crocodileSprite = require('../assets/images/animals/png/crocodile-0.png');
const frogSprite = require('../assets/images/animals/png/frog-0.png');
const gorillaSprite = require('../assets/images/animals/png/gorilla-0.png');
const hippopotamusSprite = require('../assets/images/animals/png/hippopotamus-0.png');
const jaguarSprite = require('../assets/images/animals/png/jaguar-0.png');
const lemurSprite = require('../assets/images/animals/png/lemur-0.png');
const lizardSprite = require('../assets/images/animals/png/lizard-0.png');
const orangutanSprite = require('../assets/images/animals/png/orangutan-0.png');
const slothSprite = require('../assets/images/animals/png/sloth-0.png');
const snakeSprite = require('../assets/images/animals/png/snake-0.png');
const turtleSprite = require('../assets/images/animals/png/turtle-0.png');


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
const { frames: antEaterFrames, meta: antEaterMeta } = antEaterData;
const { frames: asianElephantFrames, meta: asianElephantMeta } = asianElephantData;
const { frames: bengalTigerFrames, meta: bengalTigerMeta } = bengalTigerData;
const { frames: blackPantherFrames, meta: blackPantherMeta } = blackPantherData;
const { frames: capybaraFrames, meta: capybaraMeta } = capybaraData;
const { frames: chameleonFrames, meta: chameleonMeta } = chameleonData;
const { frames: chimpanzeeFrames, meta: chimpanzeeMeta } = chimpanzeeData;
const { frames: crocodileFrames, meta: crocodileMeta } = crocodileData;
const { frames: frogFrames, meta: frogMeta } = frogData;
const { frames: gorillaFrames, meta: gorillaMeta } = gorillaData;
const { frames: hippopotamusFrames, meta: hippopotamusMeta } = hippopotamusData;
const { frames: jaguarFrames, meta: jaguarMeta } = jaguarData;
const { frames: lemurFrames, meta: lemurMeta } = lemurData;
const { frames: lizardFrames, meta: lizardMeta } = lizardData;
const { frames: orangutanFrames, meta: orangutanMeta } = orangutanData;
const { frames: slothFrames, meta: slothMeta } = slothData;
const { frames: snakeFrames, meta: snakeMeta } = snakeData;
const { frames: turtleFrames, meta: turtleMeta } = turtleData;


// Use localization via a function parameter
import { useLocalization } from '../hooks/useLocalization';

// Helper function to get the correct label sound based on language
const getLabelSound = (animalName: string, language: string) => {
  if (language === 'ru') {
    // Russian label sounds mapping - only including files that actually exist
    const russianLabels: { [key: string]: any } = {
      'ant': require('../assets/sounds/labels/ru/ru_ant.mp3'),
      'antelope': require('../assets/sounds/labels/ru/ru_antelope.mp3'),
      'badger': require('../assets/sounds/labels/ru/ru_badger.mp3'),
      'bat': require('../assets/sounds/labels/ru/ru_bat.mp3'),
      'bear': require('../assets/sounds/labels/ru/ru_bear.mp3'),
      'beaver': require('../assets/sounds/labels/ru/ru_beaver.mp3'),
      'bee': require('../assets/sounds/labels/ru/ru_bee.mp3'),
      'bison': require('../assets/sounds/labels/ru/ru_bison.mp3'),
      'boar': require('../assets/sounds/labels/ru/ru_boar.mp3'),
      'butterfly': require('../assets/sounds/labels/ru/ru_butterfly.mp3'),
      'camel': require('../assets/sounds/labels/ru/ru_camel.mp3'),
      'canary': require('../assets/sounds/labels/ru/ru_canary.mp3'),
      'cat': require('../assets/sounds/labels/ru/ru_cat.mp3'),
      'caterpillar': require('../assets/sounds/labels/ru/ru_caterpillar.mp3'),
      'chick': require('../assets/sounds/labels/ru/ru_chick.mp3'),
      'chicken': require('../assets/sounds/labels/ru/ru_chicken.mp3'),
      'cockroach': require('../assets/sounds/labels/ru/ru_cockroach.mp3'),
      'cow': require('../assets/sounds/labels/ru/ru_cow.mp3'),
      'crab': require('../assets/sounds/labels/ru/ru_crab.mp3'),
      'deer': require('../assets/sounds/labels/ru/ru_deer.mp3'),
      'desert_tortoise': require('../assets/sounds/labels/ru/ru_desert_tortoise.mp3'),
      'dog': require('../assets/sounds/labels/ru/ru_dog.mp3'),
      'dolphin': require('../assets/sounds/labels/ru/ru_dolphin.mp3'),
      'donkey': require('../assets/sounds/labels/ru/ru_donkey.mp3'),
      'dragonfly': require('../assets/sounds/labels/ru/ru_dragonfly.mp3'),
      'duck': require('../assets/sounds/labels/ru/ru_duck.mp3'),
      'eagle': require('../assets/sounds/labels/ru/ru_eagle.mp3'),
      'elephant': require('../assets/sounds/labels/ru/ru_elephant.mp3'),
      'fennec_fox': require('../assets/sounds/labels/ru/ru_fennec_fox.mp3'),
      'fish': require('../assets/sounds/labels/ru/ru_fish.mp3'),
      'flamingo': require('../assets/sounds/labels/ru/ru_flamingo.mp3'),
      'fly': require('../assets/sounds/labels/ru/ru_fly.mp3'),
      'fox': require('../assets/sounds/labels/ru/ru_fox.mp3'),
      'goat': require('../assets/sounds/labels/ru/ru_goat.mp3'),
      'goose': require('../assets/sounds/labels/ru/ru_goose.mp3'),
      'grasshopper': require('../assets/sounds/labels/ru/ru_grasshopper.mp3'),
      'hedgehog': require('../assets/sounds/labels/ru/ru_hedgehog.mp3'),
      'horse': require('../assets/sounds/labels/ru/ru_horse.mp3'),
      'hyena': require('../assets/sounds/labels/ru/ru_hyena.mp3'),
      'iguana': require('../assets/sounds/labels/ru/ru_iguana.mp3'),
      'jackal': require('../assets/sounds/labels/ru/ru_jackal.mp3'),
      'jerboa': require('../assets/sounds/labels/ru/ru_jerboa.mp3'),
      'ladybug': require('../assets/sounds/labels/ru/ru_ladybug.mp3'),
      'lion': require('../assets/sounds/labels/ru/ru_lion.mp3'),
      'llama': require('../assets/sounds/labels/ru/ru_llama.mp3'),
      'lobster': require('../assets/sounds/labels/ru/ru_lobster.mp3'),
      'moose': require('../assets/sounds/labels/ru/ru_moose.mp3'),
      'mosquito': require('../assets/sounds/labels/ru/ru_mosquito.mp3'),
      'mouse': require('../assets/sounds/labels/ru/ru_mouse.mp3'),
      'octopus': require('../assets/sounds/labels/ru/ru_octopus.mp3'),
      'oryx': require('../assets/sounds/labels/ru/ru_oryx.mp3'),
      'owl': require('../assets/sounds/labels/ru/ru_owl.mp3'),
      'penguin': require('../assets/sounds/labels/ru/ru_penguin.mp3'),
      'pig': require('../assets/sounds/labels/ru/ru_pig.mp3'),
      'rabbit': require('../assets/sounds/labels/ru/ru_rabbit.mp3'),
      'raccoon': require('../assets/sounds/labels/ru/ru_raccoon.mp3'),
      'raven': require('../assets/sounds/labels/ru/ru_raven.mp3'),
      'reindeer': require('../assets/sounds/labels/ru/ru_reindeer.mp3'),
      'rhinoceros': require('../assets/sounds/labels/ru/ru_rhinoceros.mp3'),
      'rooster': require('../assets/sounds/labels/ru/ru_rooster.mp3'),
      'sand_cat': require('../assets/sounds/labels/ru/ru_sand_cat.mp3'),
      'scorpion': require('../assets/sounds/labels/ru/ru_scorpion.mp3'),
      'seagull': require('../assets/sounds/labels/ru/ru_seagull.mp3'),
      'seahorse': require('../assets/sounds/labels/ru/ru_seahorse.mp3'),
      'seal': require('../assets/sounds/labels/ru/ru_seal.mp3'),
      'sea_turtle': require('../assets/sounds/labels/ru/ru_sea_turtle.mp3'),
      'shark': require('../assets/sounds/labels/ru/ru_shark.mp3'),
      'sheep': require('../assets/sounds/labels/ru/ru_sheep.mp3'),
      'shrimp': require('../assets/sounds/labels/ru/ru_shrimp.mp3'),
      'snail': require('../assets/sounds/labels/ru/ru_snail.mp3'),
      'sparrow': require('../assets/sounds/labels/ru/ru_sparrow.mp3'),
      'spider': require('../assets/sounds/labels/ru/ru_spider.mp3'),
      'squirrel': require('../assets/sounds/labels/ru/ru_squirrel.mp3'),
      'starfish': require('../assets/sounds/labels/ru/ru_starfish.mp3'),
      'stingray': require('../assets/sounds/labels/ru/ru_stingray.mp3'),
      'stork': require('../assets/sounds/labels/ru/ru_stork.mp3'),
      'tiger': require('../assets/sounds/labels/ru/ru_tiger.mp3'),
      'zebra': require('../assets/sounds/labels/ru/ru_zebra.mp3'),
      'giraffe': require('../assets/sounds/labels/ru/ru_giraffe.mp3'),
      'dove': require('../assets/sounds/labels/ru/ru_dove.mp3'),
      'pelican': require('../assets/sounds/labels/ru/ru_pelican.mp3'),
      'swan': require('../assets/sounds/labels/ru/ru_swan.mp3'),
      'toucan': require('../assets/sounds/labels/ru/ru_toucan.mp3'),
      'woodpecker': require('../assets/sounds/labels/ru/ru_woodpecker.mp3'),
      'anteater': require('../assets/sounds/labels/ru/ru_anteater.mp3'),
      'capybara': require('../assets/sounds/labels/ru/ru_capybara.mp3'),
      'chameleon': require('../assets/sounds/labels/ru/ru_chameleon.mp3'),
      'chimpanzee': require('../assets/sounds/labels/ru/ru_chimpanzee.mp3'),     
      'crocodile': require('../assets/sounds/labels/ru/ru_crocodile.mp3'), 
      'frog': require('../assets/sounds/labels/ru/ru_frog.mp3'),       
      'gorilla': require('../assets/sounds/labels/ru/ru_gorilla.mp3'),   
      'hippopotamus': require('../assets/sounds/labels/ru/ru_hippopotamus.mp3'),  
      'jaguar': require('../assets/sounds/labels/ru/ru_jaguar.mp3'),     
      'lemur': require('../assets/sounds/labels/ru/ru_lemur.mp3'), 
      'lizard': require('../assets/sounds/labels/ru/ru_lizard.mp3'),       
      'orangutan': require('../assets/sounds/labels/ru/ru_orangutan.mp3'),      
      'sloth': require('../assets/sounds/labels/ru/ru_sloth.mp3'),            
      'snake': require('../assets/sounds/labels/ru/ru_snake.mp3'),       
      'turtle': require('../assets/sounds/labels/ru/ru_turtle.mp3'),   
    
      
      
      // Special mappings for animals that have different names in Russian
      'white_bear': require('../assets/sounds/labels/ru/ru_polar_bear.mp3'),
      'white_fox': require('../assets/sounds/labels/ru/ru_arctic_fox.mp3'),
      'snow_owl': require('../assets/sounds/labels/ru/ru_snowy_owl.mp3'),
      'cheetah': require('../assets/sounds/labels/ru/ru_cheetah.mp3'),
      'wild_boar': require('../assets/sounds/labels/ru/ru_wildboar.mp3'),
      'asianElephant': require('../assets/sounds/labels/ru/ru_asianElephant.mp3'),
      'engalTiger': require('../assets/sounds/labels/ru/ru_bengalTiger.mp3'),
      'blackPanther': require('../assets/sounds/labels/ru/ru_blackPanther.mp3'),
    };
    return russianLabels[animalName] || russianLabels['cat']; // Fallback to cat sound if not found
  } else if (language === 'tr') {
  // Turkish label sounds mapping - based on existing files
  const turkishLabels: { [key: string]: any } = {
    'ant': require('../assets/sounds/labels/tr/ant.mp3'),
    'anteater': require('../assets/sounds/labels/tr/anteater.mp3'),
    'antelope': require('../assets/sounds/labels/tr/antelope.mp3'),
    'arctic-fox': require('../assets/sounds/labels/tr/arctic-fox.mp3'),
    'asian-elephant': require('../assets/sounds/labels/tr/asian-elephant.mp3'),
    'badger': require('../assets/sounds/labels/tr/badger.mp3'),
    'bat': require('../assets/sounds/labels/tr/bat.mp3'),
    'bear': require('../assets/sounds/labels/tr/bear.mp3'),
    'beaver': require('../assets/sounds/labels/tr/beaver.mp3'),
    'bee': require('../assets/sounds/labels/tr/bee.mp3'),
    'bengal-tiger': require('../assets/sounds/labels/tr/bengal-tiger.mp3'),
    'bison': require('../assets/sounds/labels/tr/bison.mp3'),
    'boar': require('../assets/sounds/labels/tr/boar.mp3'),
    'butterfly': require('../assets/sounds/labels/tr/butterfly.mp3'),
    'camel': require('../assets/sounds/labels/tr/camel.mp3'),
    'canary': require('../assets/sounds/labels/tr/canary.mp3'),
    'capybara': require('../assets/sounds/labels/tr/capybara.mp3'),
    'cat': require('../assets/sounds/labels/tr/cat.mp3'),
    'caterpillar': require('../assets/sounds/labels/tr/caterpillar.mp3'),
    'chameleon': require('../assets/sounds/labels/tr/chameleon.mp3'),
    'cheetah': require('../assets/sounds/labels/tr/cheetah.mp3'),
    'chicken': require('../assets/sounds/labels/tr/chicken.mp3'),
    'chimpanzee': require('../assets/sounds/labels/tr/chimpanzee.mp3'),
    'cockroach': require('../assets/sounds/labels/tr/cockroach.mp3'),
    'cow': require('../assets/sounds/labels/tr/cow.mp3'),
    'crab': require('../assets/sounds/labels/tr/crab.mp3'),
    'crocodile': require('../assets/sounds/labels/tr/crocodile.mp3'),
    'deer': require('../assets/sounds/labels/tr/deer.mp3'),
    'desert-tortoise': require('../assets/sounds/labels/tr/desert-tortoise.mp3'),
    'dog': require('../assets/sounds/labels/tr/dog.mp3'),
    'dolphin': require('../assets/sounds/labels/tr/dolphin.mp3'),
    'donkey': require('../assets/sounds/labels/tr/donkey.mp3'),
    'dove': require('../assets/sounds/labels/tr/dove.mp3'),
    'dragonfly': require('../assets/sounds/labels/tr/dragonfly.mp3'),
    'duck': require('../assets/sounds/labels/tr/duck.mp3'),
    'eagle': require('../assets/sounds/labels/tr/eagle.mp3'),
    'elephant': require('../assets/sounds/labels/tr/elephant.mp3'),
    'fennec-fox': require('../assets/sounds/labels/tr/fennec-fox.mp3'),
    'fish': require('../assets/sounds/labels/tr/fish.mp3'),
    'flamingo': require('../assets/sounds/labels/tr/flamingo.mp3'),
    'fly': require('../assets/sounds/labels/tr/fly.mp3'),
    'fox': require('../assets/sounds/labels/tr/fox.mp3'),
    'frog': require('../assets/sounds/labels/tr/frog.mp3'),
    'giraffe': require('../assets/sounds/labels/tr/giraffe.mp3'),
    'goat': require('../assets/sounds/labels/tr/goat.mp3'),
    'goose': require('../assets/sounds/labels/tr/goose.mp3'),
    'gorilla': require('../assets/sounds/labels/tr/gorilla.mp3'),
    'grasshopper': require('../assets/sounds/labels/tr/grasshopper.mp3'),
    'hedgehog': require('../assets/sounds/labels/tr/hedgehog.mp3'),
    'hippopotamus': require('../assets/sounds/labels/tr/hippopotamus.mp3'),
    'horse': require('../assets/sounds/labels/tr/horse.mp3'),
    'hyena': require('../assets/sounds/labels/tr/hyena.mp3'),
    'iguana': require('../assets/sounds/labels/tr/iguana.mp3'),
    'jackal': require('../assets/sounds/labels/tr/jackal.mp3'),
    'jaguar': require('../assets/sounds/labels/tr/jaguar.mp3'),
    'jellyfish': require('../assets/sounds/labels/tr/jellyfish.mp3'),
    'jerboa': require('../assets/sounds/labels/tr/jerboa.mp3'),
    'ladybug': require('../assets/sounds/labels/tr/ladybug.mp3'),
    'lemur': require('../assets/sounds/labels/tr/lemur.mp3'),
    'lion': require('../assets/sounds/labels/tr/lion.mp3'),
    'lizard': require('../assets/sounds/labels/tr/lizard.mp3'),
    'llama': require('../assets/sounds/labels/tr/llama.mp3'),
    'lobster': require('../assets/sounds/labels/tr/lobster.mp3'),
    'moose': require('../assets/sounds/labels/tr/moose.mp3'),
    'mosquito': require('../assets/sounds/labels/tr/mosquito.mp3'),
    'mouse': require('../assets/sounds/labels/tr/mouse.mp3'),
    'octopus': require('../assets/sounds/labels/tr/octopus.mp3'),
    'orangutan': require('../assets/sounds/labels/tr/orangutan.mp3'),
    'oryx': require('../assets/sounds/labels/tr/oryx.mp3'),
    'owl': require('../assets/sounds/labels/tr/owl.mp3'),
    'panther': require('../assets/sounds/labels/tr/panther.mp3'),
    'parrot': require('../assets/sounds/labels/tr/parrot.mp3'),
    'pelican': require('../assets/sounds/labels/tr/pelican.mp3'),
    'penguin': require('../assets/sounds/labels/tr/penguin.mp3'),
    'pig': require('../assets/sounds/labels/tr/pig.mp3'),
    'polar-bear': require('../assets/sounds/labels/tr/polar-bear.mp3'),
    'rabbit': require('../assets/sounds/labels/tr/rabbit.mp3'),
    'raccoon': require('../assets/sounds/labels/tr/raccoon.mp3'),
    'raven': require('../assets/sounds/labels/tr/raven.mp3'),
    'reindeer': require('../assets/sounds/labels/tr/reindeer.mp3'),
    'rhinoceros': require('../assets/sounds/labels/tr/rhinoceros.mp3'),
    'rooster': require('../assets/sounds/labels/tr/rooster.mp3'),
    'sand-cat': require('../assets/sounds/labels/tr/sand-cat.mp3'),
    'scorpion': require('../assets/sounds/labels/tr/scorpion.mp3'),
    'seagull': require('../assets/sounds/labels/tr/seagull.mp3'),
    'seahorse': require('../assets/sounds/labels/tr/seahorse.mp3'),
    'seal': require('../assets/sounds/labels/tr/seal.mp3'),
    'sea-turtle': require('../assets/sounds/labels/tr/sea-turtle.mp3'),
    'shark': require('../assets/sounds/labels/tr/shark.mp3'),
    'sheep': require('../assets/sounds/labels/tr/sheep.mp3'),
    'shrimp': require('../assets/sounds/labels/tr/shrimp.mp3'),
    'sloth': require('../assets/sounds/labels/tr/sloth.mp3'),
    'snail': require('../assets/sounds/labels/tr/snail.mp3'),
    'snake': require('../assets/sounds/labels/tr/snake.mp3'),
    'snowy-owl': require('../assets/sounds/labels/tr/snowy-owl.mp3'),
    'sparrow': require('../assets/sounds/labels/tr/sparrow.mp3'),
    'spider': require('../assets/sounds/labels/tr/spider.mp3'),
    'squirrel': require('../assets/sounds/labels/tr/squirrel.mp3'),
    'starfish': require('../assets/sounds/labels/tr/starfish.mp3'),
    'stingray': require('../assets/sounds/labels/tr/stingray.mp3'),
    'stork': require('../assets/sounds/labels/tr/stork.mp3'),
    'swan': require('../assets/sounds/labels/tr/swan.mp3'),
    'tiger': require('../assets/sounds/labels/tr/tiger.mp3'),
    'toucan': require('../assets/sounds/labels/tr/toucan.mp3'),
    'turkey': require('../assets/sounds/labels/tr/turkey.mp3'),
    'turtle': require('../assets/sounds/labels/tr/turtle.mp3'),
    'whale': require('../assets/sounds/labels/tr/whale.mp3'),
    'wild-boar': require('../assets/sounds/labels/tr/wild-boar.mp3'),
    'wolf': require('../assets/sounds/labels/tr/wolf.mp3'),
    'woodpecker': require('../assets/sounds/labels/tr/woodpecker.mp3'),
    'zebra': require('../assets/sounds/labels/tr/zebra.mp3')
  } } else {
    // English label sounds mapping - only including files that actually exist
    const englishLabels: { [key: string]: any } = {
  'ant': require('../assets/sounds/labels/en/ant.mp3'),
  'anteater': require('../assets/sounds/labels/en/anteater.mp3'),
  'antelope': require('../assets/sounds/labels/en/antelope.mp3'),
  'arctic-fox': require('../assets/sounds/labels/en/arctic-fox.mp3'),
  'asian-elephant': require('../assets/sounds/labels/en/asian-elephant.mp3'),
  'badger': require('../assets/sounds/labels/en/badger.mp3'),
  'bat': require('../assets/sounds/labels/en/bat.mp3'),
  'bear': require('../assets/sounds/labels/en/bear.mp3'),
  'beaver': require('../assets/sounds/labels/en/beaver.mp3'),
  'bee': require('../assets/sounds/labels/en/bee.mp3'),
  'bengal-tiger': require('../assets/sounds/labels/en/bengal-tiger.mp3'),
  'bison': require('../assets/sounds/labels/en/bison.mp3'),
  'boar': require('../assets/sounds/labels/en/boar.mp3'),
  'butterfly': require('../assets/sounds/labels/en/butterfly.mp3'),
  'camel': require('../assets/sounds/labels/en/camel.mp3'),
  'canary': require('../assets/sounds/labels/en/canary.mp3'),
  'capybara': require('../assets/sounds/labels/en/capybara.mp3'),
  'cat': require('../assets/sounds/labels/en/cat.mp3'),
  'caterpillar': require('../assets/sounds/labels/en/caterpillar.mp3'),
  'chameleon': require('../assets/sounds/labels/en/chameleon.mp3'),
  'cheetah': require('../assets/sounds/labels/en/cheetah.mp3'),
  'chicken': require('../assets/sounds/labels/en/chicken.mp3'),
  'chimpanzee': require('../assets/sounds/labels/en/chimpanzee.mp3'),
  'cockroach': require('../assets/sounds/labels/en/cockroach.mp3'),
  'cow': require('../assets/sounds/labels/en/cow.mp3'),
  'crab': require('../assets/sounds/labels/en/crab.mp3'),
  'crocodile': require('../assets/sounds/labels/en/crocodile.mp3'),
  'deer': require('../assets/sounds/labels/en/deer.mp3'),
  'desert-tortoise': require('../assets/sounds/labels/en/desert-tortoise.mp3'),
  'dog': require('../assets/sounds/labels/en/dog.mp3'),
  'dolphin': require('../assets/sounds/labels/en/dolphin.mp3'),
  'donkey': require('../assets/sounds/labels/en/donkey.mp3'),
  'dove': require('../assets/sounds/labels/en/dove.mp3'),
  'dragonfly': require('../assets/sounds/labels/en/dragonfly.mp3'),
  'duck': require('../assets/sounds/labels/en/duck.mp3'),
  'eagle': require('../assets/sounds/labels/en/eagle.mp3'),
  'elephant': require('../assets/sounds/labels/en/elephant.mp3'),
  'fennec-fox': require('../assets/sounds/labels/en/fennec-fox.mp3'),
  'fish': require('../assets/sounds/labels/en/fish.mp3'),
  'flamingo': require('../assets/sounds/labels/en/flamingo.mp3'),
  'fly': require('../assets/sounds/labels/en/fly.mp3'),
  'fox': require('../assets/sounds/labels/en/fox.mp3'),
  'frog': require('../assets/sounds/labels/en/frog.mp3'),
  'giraffe': require('../assets/sounds/labels/en/giraffe.mp3'),
  'goat': require('../assets/sounds/labels/en/goat.mp3'),
  'goose': require('../assets/sounds/labels/en/goose.mp3'),
  'gorilla': require('../assets/sounds/labels/en/gorilla.mp3'),
  'grasshopper': require('../assets/sounds/labels/en/grasshopper.mp3'),
  'hedgehog': require('../assets/sounds/labels/en/hedgehog.mp3'),
  'hippopotamus': require('../assets/sounds/labels/en/hippopotamus.mp3'),
  'horse': require('../assets/sounds/labels/en/horse.mp3'),
  'hyena': require('../assets/sounds/labels/en/hyena.mp3'),
  'iguana': require('../assets/sounds/labels/en/iguana.mp3'),
  'jackal': require('../assets/sounds/labels/en/jackal.mp3'),
  'jaguar': require('../assets/sounds/labels/en/jaguar.mp3'),
  'jellyfish': require('../assets/sounds/labels/en/jellyfish.mp3'),
  'jerboa': require('../assets/sounds/labels/en/jerboa.mp3'),
  'ladybug': require('../assets/sounds/labels/en/ladybug.mp3'),
  'lemur': require('../assets/sounds/labels/en/lemur.mp3'),
  'lion': require('../assets/sounds/labels/en/lion.mp3'),
  'lizard': require('../assets/sounds/labels/en/lizard.mp3'),
  'llama': require('../assets/sounds/labels/en/llama.mp3'),
  'lobster': require('../assets/sounds/labels/en/lobster.mp3'),
  'moose': require('../assets/sounds/labels/en/moose.mp3'),
  'mosquito': require('../assets/sounds/labels/en/mosquito.mp3'),
  'mouse': require('../assets/sounds/labels/en/mouse.mp3'),
  'octopus': require('../assets/sounds/labels/en/octopus.mp3'),
  'orangutan': require('../assets/sounds/labels/en/orangutan.mp3'),
  'oryx': require('../assets/sounds/labels/en/oryx.mp3'),
  'owl': require('../assets/sounds/labels/en/owl.mp3'),
  'panther': require('../assets/sounds/labels/en/panther.mp3'),
  'parrot': require('../assets/sounds/labels/en/parrot.mp3'),
  'pelican': require('../assets/sounds/labels/en/pelican.mp3'),
  'penguin': require('../assets/sounds/labels/en/penguin.mp3'),
  'pig': require('../assets/sounds/labels/en/pig.mp3'),
  'polar-bear': require('../assets/sounds/labels/en/polar-bear.mp3'),
  'rabbit': require('../assets/sounds/labels/en/rabbit.mp3'),
  'raccoon': require('../assets/sounds/labels/en/raccoon.mp3'),
  'raven': require('../assets/sounds/labels/en/raven.mp3'),
  'reindeer': require('../assets/sounds/labels/en/reindeer.mp3'),
  'rhinoceros': require('../assets/sounds/labels/en/rhinoceros.mp3'),
  'rooster': require('../assets/sounds/labels/en/rooster.mp3'),
  'sand-cat': require('../assets/sounds/labels/en/sand-cat.mp3'),
  'scorpion': require('../assets/sounds/labels/en/scorpion.mp3'),
  'seagull': require('../assets/sounds/labels/en/seagull.mp3'),
  'seahorse': require('../assets/sounds/labels/en/seahorse.mp3'),
  'seal': require('../assets/sounds/labels/en/seal.mp3'),
  'sea-turtle': require('../assets/sounds/labels/en/sea-turtle.mp3'),
  'shark': require('../assets/sounds/labels/en/shark.mp3'),
  'sheep': require('../assets/sounds/labels/en/sheep.mp3'),
  'shrimp': require('../assets/sounds/labels/en/shrimp.mp3'),
  'sloth': require('../assets/sounds/labels/en/sloth.mp3'),
  'snail': require('../assets/sounds/labels/en/snail.mp3'),
  'snake': require('../assets/sounds/labels/en/snake.mp3'),
  'snowy-owl': require('../assets/sounds/labels/en/snowy-owl.mp3'),
  'sparrow': require('../assets/sounds/labels/en/sparrow.mp3'),
  'spider': require('../assets/sounds/labels/en/spider.mp3'),
  'squirrel': require('../assets/sounds/labels/en/squirrel.mp3'),
  'starfish': require('../assets/sounds/labels/en/starfish.mp3'),
  'stingray': require('../assets/sounds/labels/en/stingray.mp3'),
  'stork': require('../assets/sounds/labels/en/stork.mp3'),
  'swan': require('../assets/sounds/labels/en/swan.mp3'),
  'tiger': require('../assets/sounds/labels/en/tiger.mp3'),
  'toucan': require('../assets/sounds/labels/en/toucan.mp3'),
  'turkey': require('../assets/sounds/labels/en/turkey.mp3'),
  'turtle': require('../assets/sounds/labels/en/turtle.mp3'),
  'whale': require('../assets/sounds/labels/en/whale.mp3'),
  'wild-boar': require('../assets/sounds/labels/en/wild-boar.mp3'),
  'wolf': require('../assets/sounds/labels/en/wolf.mp3'),
  'woodpecker': require('../assets/sounds/labels/en/woodpecker.mp3'),
  'zebra': require('../assets/sounds/labels/en/zebra.mp3'),
    };
    return englishLabels[animalName] || englishLabels['cat']; // Fallback to cat sound if not found
  }
};

export function getAnimals(language: string = 'en'): AnimalType[] {
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
      sound: require('../assets/sounds/animal_sounds/dog.mp3'),
      labelSound: getLabelSound('dog', language),
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
      sound: require('../assets/sounds/animal_sounds/cat.mp3'),
      labelSound: getLabelSound('cat', language),
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
      sound: require('../assets/sounds/animal_sounds/chicken.mp3'),
      labelSound: getLabelSound('chicken', language),
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
      sound: require('../assets/sounds/animal_sounds/chick.mp3'),
      labelSound: getLabelSound('chick', language),
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
      sound: require('../assets/sounds/animal_sounds/donkey.mp3'),
      labelSound: getLabelSound('donkey', language),
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
      sound: require('../assets/sounds/animal_sounds/cow.mp3'),
      labelSound: getLabelSound('cow', language),
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
      sound: require('../assets/sounds/animal_sounds/duck.mp3'),
      labelSound: getLabelSound('duck', language),
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
      sound: require('../assets/sounds/animal_sounds/goat.mp3'),
      labelSound: getLabelSound('goat', language),
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
      sound: require('../assets/sounds/animal_sounds/goose.mp3'),
      labelSound: getLabelSound('goose', language),
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
      sound: require('../assets/sounds/animal_sounds/horse.mp3'),
      labelSound: getLabelSound('horse', language),
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
      sound: require('../assets/sounds/animal_sounds/llama.mp3'),
      labelSound: getLabelSound('llama', language),
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
      sound: require('../assets/sounds/animal_sounds/pig.mp3'),
      labelSound: getLabelSound('pig', language),
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
      sound: require('../assets/sounds/animal_sounds/rabbit.mp3'),
      labelSound: getLabelSound('rabbit', language),
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
      sound: require('../assets/sounds/animal_sounds/sheep.mp3'),
      labelSound: getLabelSound('sheep', language),
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
      sound: require('../assets/sounds/animal_sounds/rooster.mp3'),
      labelSound: getLabelSound('rooster', language),
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
      sound: require('../assets/sounds/animal_sounds/turkey.mp3'),
      labelSound: getLabelSound('turkey', language),
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
      sound: require('../assets/sounds/animal_sounds/badger.mp3'),
      labelSound: getLabelSound('badger', language),
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
      sound: require('../assets/sounds/animal_sounds/fox.mp3'),
      labelSound: getLabelSound('fox', language),
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
      sound: require('../assets/sounds/animal_sounds/bear.mp3'),
      labelSound: getLabelSound('bear', language),
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
      sound: require('../assets/sounds/animal_sounds/raccoon.mp3'),
      labelSound: getLabelSound('raccoon', language),
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
      sound: require('../assets/sounds/animal_sounds/squirrel.mp3'),
      labelSound: getLabelSound('squirrel', language),
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
      sound: require('../assets/sounds/animal_sounds/hedgehog.mp3'),
      labelSound: getLabelSound('hedgehog', language),
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
      sound: require('../assets/sounds/animal_sounds/owl.mp3'),
      labelSound: getLabelSound('owl', language),
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
      sound: require('../assets/sounds/animal_sounds/wolf.mp3'),
      labelSound: getLabelSound('wolf', language),
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
      sound: require('../assets/sounds/animal_sounds/deer.mp3'),
      labelSound: getLabelSound('deer', language),
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
      sound: require('../assets/sounds/animal_sounds/moose.mp3'),
      labelSound: getLabelSound('moose', language),
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
      sound: require('../assets/sounds/animal_sounds/mouse.mp3'),
      labelSound: getLabelSound('mouse', language),
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
      sound: require('../assets/sounds/animal_sounds/beaver.mp3'),
      labelSound: getLabelSound('beaver', language),
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
      sound: require('../assets/sounds/animal_sounds/boar.mp3'),
      labelSound: getLabelSound('boar', language),
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
      sound: require('../assets/sounds/animal_sounds/bat.mp3'),
      labelSound: getLabelSound('bat', language),
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
      sound: require('../assets/sounds/animal_sounds/bear.mp3'),
      labelSound: getLabelSound('white_bear', language),
      isMoving: true,
      movingDirection: 'left',
    },
    {
      id: 33,
      name: t('animals.whiteFox'),
      type: 'sprite' as const,
      animalType: 'Arctic' as const,
      source: whiteFoxSprite,
      frames: whiteFoxFrames,
      spriteSheetSize: whiteFoxMeta.size,
      sound: require('../assets/sounds/animal_sounds/fox.mp3'),
      labelSound: getLabelSound('white_fox', language),
      isMoving: true,
      movingDirection: 'left',
    },
    {
      id: 34,
      name: t('animals.reindeer'),
      type: 'sprite' as const,
      animalType: 'Arctic' as const,
      source: reindeerSprite,
      frames: reindeerFrames,
      spriteSheetSize: reindeerMeta.size,
      sound: require('../assets/sounds/animal_sounds/deer.mp3'),
      labelSound: getLabelSound('reindeer', language),
      isMoving: true,
      movingDirection: 'left',
    },
    {
      id: 35,
      name: t('animals.seal'),
      type: 'sprite' as const,
      animalType: 'Arctic' as const,
      source: sealSprite,
      frames: sealFrames,
      spriteSheetSize: sealMeta.size,
      sound: require('../assets/sounds/animal_sounds/cat.mp3'),
      labelSound: getLabelSound('seal', language),
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
      sound: require('../assets/sounds/animal_sounds/owl.mp3'),
      labelSound: getLabelSound('snow_owl', language),
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
      sound: require('../assets/sounds/animal_sounds/duck.mp3'),
      labelSound: getLabelSound('penguin', language),
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
      sound: require('../assets/sounds/animal_sounds/camel.mp3'),
      labelSound: getLabelSound('camel', language),
      isMoving: false,
    },
    {
      id: 39,
      name: t('animals.desertTortoise'),
      type: 'sprite' as const,
      animalType: 'Desert' as const,
      source: desertTortoiseSprite,
      frames: desertTortoiseFrames,
      spriteSheetSize: desertTortoiseMeta.size,
      sound: require('../assets/sounds/animal_sounds/turt.mp3'),
      labelSound: getLabelSound('desert_tortoise', language),
      isMoving: false,
    },
    {
      id: 40,
      name: t('animals.fennecFox'),
      type: 'sprite' as const,
      animalType: 'Desert' as const,
      source: fenexFoxSprite,
      frames: fenexFoxFrames,
      spriteSheetSize: fenexFoxMeta.size,
      sound: require('../assets/sounds/animal_sounds/fennecfox.mp3'),
      labelSound: getLabelSound('fennec_fox', language),
      isMoving: false,
    },
    {
      id: 41,
      name: t('animals.iguana'),
      type: 'sprite' as const,
      animalType: 'Desert' as const,
      source: iguanaSprite,
      frames: iguanaFrames,
      spriteSheetSize: iguanaMeta.size,
      sound: require('../assets/sounds/animal_sounds/iguana.mp3'),
      labelSound: getLabelSound('iguana', language),
      isMoving: false,
    },
    {
      id: 42,
      name: t('animals.jackal'),
      type: 'sprite' as const,
      animalType: 'Desert' as const,
      source: jackalSprite,
      frames: jackalFrames,
      spriteSheetSize: jackalMeta.size,
      sound: require('../assets/sounds/animal_sounds/jackal.mp3'),
      labelSound: getLabelSound('jackal', language),
      isMoving: false,
    },
    {
      id: 43,
      name: t('animals.jerboa'),
      type: 'sprite' as const,
      animalType: 'Desert' as const,
      source: jerboaSprite,
      frames: jerboaFrames,
      spriteSheetSize: jerboaMeta.size,
      sound: require('../assets/sounds/animal_sounds/mouse.mp3'),
      labelSound: getLabelSound('jerboa', language),
      isMoving: false,
    },
    {
      id: 44,
      name: t('animals.oryx'),
      type: 'sprite' as const,
      animalType: 'Desert' as const,
      source: oryxSprite,
      frames: oryxFrames,
      spriteSheetSize: oryxMeta.size,
      sound: require('../assets/sounds/animal_sounds/oryx.mp3'),
      labelSound: getLabelSound('oryx', language),
      isMoving: false,
    },
    {
      id: 45,
      name: t('animals.sandCat'),
      type: 'sprite' as const,
      animalType: 'Desert' as const,
      source: sandCatSprite,
      frames: sandCatFrames,
      spriteSheetSize: sandCatMeta.size,
      sound: require('../assets/sounds/animal_sounds/sandcat.mp3'),
      labelSound: getLabelSound('sand_cat', language),
      isMoving: false,
    },
    {
      id: 46,
      name: t('animals.scorpion'),
      type: 'sprite' as const,
      animalType: 'Desert' as const,
      source: scorpionSprite,
      frames: scorpionFrames,
      spriteSheetSize: scorpionMeta.size,
      sound: require('../assets/sounds/animal_sounds/scorpion.mp3'),
      labelSound: getLabelSound('scorpion', language),
      isMoving: false,
    },
    {
      id: 47,
      name: t('animals.antelope'),
      type: 'sprite' as const,
      animalType: 'Savannah' as const,
      source: antelopeSprite,
      frames: antelopeFrames,
      spriteSheetSize: antelopeMeta.size,
      sound: require('../assets/sounds/animal_sounds/antelope.mp3'),
      labelSound: getLabelSound('antelope', language),
      isMoving: false,
    },
    {
      id: 48,
      name: t('animals.bison'),
      type: 'sprite' as const,
      animalType: 'Savannah' as const,
      source: bizonSprite,
      frames: bizonFrames,
      spriteSheetSize: bizonMeta.size,
      sound: require('../assets/sounds/animal_sounds/bizon.mp3'),
      labelSound: getLabelSound('bison', language),
      isMoving: false,
    },
    {
      id: 49,
      name: t('animals.elephant'),
      type: 'sprite' as const,
      animalType: 'Savannah' as const,
      source: elephantSprite,
      frames: elephantFrames,
      spriteSheetSize: elephantMeta.size,
      sound: require('../assets/sounds/animal_sounds/elephant.mp3'),
      labelSound: getLabelSound('elephant', language),
      isMoving: false,
    },
    {
      id: 50,
      name: t('animals.gepard'),
      type: 'sprite' as const,
      animalType: 'Savannah' as const,
      source: gepardSprite,
      frames: gepardFrames,
      spriteSheetSize: gepardMeta.size,
      sound: require('../assets/sounds/animal_sounds/cat.mp3'),
      labelSound: getLabelSound('cheetah', language),
      isMoving: false,
    },
    {
      id: 51,
      name: t('animals.hyena'),
      type: 'sprite' as const,
      animalType: 'Savannah' as const,
      source: hyenaSprite,
      frames: hyenaFrames,
      spriteSheetSize: hyenaMeta.size,
      sound: require('../assets/sounds/animal_sounds/cat.mp3'),
      labelSound: getLabelSound('hyena', language),
      isMoving: false,
    },
    {
      id: 52,
      name: t('animals.leon'),
      type: 'sprite' as const,
      animalType: 'Savannah' as const,
      source: leonSprite,
      frames: leonFrames,
      spriteSheetSize: leonMeta.size,
      sound: require('../assets/sounds/animal_sounds/cat.mp3'),
      labelSound: getLabelSound('lion', language),
      isMoving: false,
    },
    {
      id: 53,
      name: t('animals.tiger'),
      type: 'sprite' as const,
      animalType: 'Savannah' as const,
      source: tigerSprite,
      frames: tigerFrames,
      spriteSheetSize: tigerMeta.size,
      sound: require('../assets/sounds/animal_sounds/cat.mp3'),
      labelSound: getLabelSound('tiger', language),
      isMoving: false,
    },
    {
      id: 54,
      name: t('animals.wildboar'),
      type: 'sprite' as const,
      animalType: 'Savannah' as const,
      source: wildBoarSprite,
      frames: wildBoarFrames,
      spriteSheetSize: wildBoarMeta.size,
      sound: require('../assets/sounds/animal_sounds/boar.mp3'),
      labelSound: getLabelSound('wild_boar', language),
      isMoving: false,
    },
    {
      id: 55,
      name: t('animals.zebra'),
      type: 'sprite' as const,
      animalType: 'Savannah' as const,
      source: zebraSprite,
      frames: zebraFrames,
      spriteSheetSize: zebraMeta.size,
      sound: require('../assets/sounds/animal_sounds/cat.mp3'),
      labelSound: getLabelSound('zebra', language),
      isMoving: false,
    },
    {
      id: 56,
      name: t('animals.eagle'),
      type: 'sprite' as const,
      animalType: 'Savannah' as const,
      source: eagleSprite,
      frames: eagleFrames,
      spriteSheetSize: eagleMeta.size,
      sound: require('../assets/sounds/animal_sounds/cat.mp3'),
      labelSound: getLabelSound('eagle', language),
      isMoving: false,
    },
    {
      id: 57,
      name: t('animals.flamingo'),
      type: 'sprite' as const,
      animalType: 'Savannah' as const,
      source: flamingoSprite,
      frames: flamingoFrames,
      spriteSheetSize: flamingoMeta.size,
      sound: require('../assets/sounds/animal_sounds/cat.mp3'),
      labelSound: getLabelSound('flamingo', language),
      isMoving: false,
    },
    {
      id: 58,
      name: t('animals.giraffe'),
      type: 'sprite' as const,
      animalType: 'Savannah' as const,
      source: giraffeSprite,
      frames: giraffeFrames,
      spriteSheetSize: giraffeMeta.size,
      sound: require('../assets/sounds/animal_sounds/cat.mp3'),
      labelSound: getLabelSound('giraffe', language),
      isMoving: false,
    },
    {
      id: 59,
      name: t('animals.rhinoceros'),
      type: 'sprite' as const,
      animalType: 'Savannah' as const,
      source: rhinocerosSprite,
      frames: rhinocerosFrames,
      spriteSheetSize: rhinocerosMeta.size,
      sound: require('../assets/sounds/animal_sounds/cat.mp3'),
      labelSound: getLabelSound('rhinoceros', language),
      isMoving: false,
    },
    {
      id: 60,
      name: t('animals.ant'),
      type: 'sprite' as const,
      animalType: 'Insects' as const,
      source: antSprite,
      frames: antFrames,
      spriteSheetSize: antMeta.size,
      sound: require('../assets/sounds/animal_sounds/cat.mp3'),
      labelSound: getLabelSound('ant', language),
      isMoving: false,
    },
    {
      id: 61,
      name: t('animals.bee'),
      type: 'sprite' as const,
      animalType: 'Insects' as const,
      source: beeSprite,
      frames: beeFrames,
      spriteSheetSize: beeMeta.size,
      sound: require('../assets/sounds/animal_sounds/cat.mp3'),
      labelSound: getLabelSound('bee', language),
      isMoving: false,
    },
    {
      id: 62,
      name: t('animals.butterfly'),
      type: 'sprite' as const,
      animalType: 'Insects' as const,
      source: butterflySprite,
      frames: butterflyFrames,
      spriteSheetSize: butterflyMeta.size,
      sound: require('../assets/sounds/animal_sounds/cat.mp3'),
      labelSound: getLabelSound('butterfly', language),
      isMoving: false,
    },
    {
      id: 63,
      name: t('animals.caterpillar'),
      type: 'sprite' as const,
      animalType: 'Insects' as const,
      source: caterpillarSprite,
      frames: caterpillarFrames,
      spriteSheetSize: caterpillarMeta.size,
      sound: require('../assets/sounds/animal_sounds/cat.mp3'),
      labelSound: getLabelSound('caterpillar', language),
      isMoving: false,
    },
    {
      id: 64,
      name: t('animals.cockroach'),
      type: 'sprite' as const,
      animalType: 'Insects' as const,
      source: cockroachSprite,
      frames: cockroachFrames,
      spriteSheetSize: cockroachMeta.size,
      sound: require('../assets/sounds/animal_sounds/cat.mp3'),
      labelSound: getLabelSound('cockroach', language),
      isMoving: false,
    },
    {
      id: 65,
      name: t('animals.dragonfly'),
      type: 'sprite' as const,
      animalType: 'Insects' as const,
      source: dragonflySprite,
      frames: dragonflyFrames,
      spriteSheetSize: dragonflyMeta.size,
      sound: require('../assets/sounds/animal_sounds/cat.mp3'),
      labelSound: getLabelSound('dragonfly', language),
      isMoving: false,
    },
    {
      id: 66,
      name: t('animals.fly'),
      type: 'sprite' as const,
      animalType: 'Insects' as const,
      source: flySprite,
      frames: flyFrames,
      spriteSheetSize: flyMeta.size,
      sound: require('../assets/sounds/animal_sounds/cat.mp3'),
      labelSound: getLabelSound('fly', language),
      isMoving: false,
    },
    {
      id: 67,
      name: t('animals.grasshopper'),
      type: 'sprite' as const,
      animalType: 'Insects' as const,
      source: grasshopperSprite,
      frames: grasshopperFrames,
      spriteSheetSize: grasshopperMeta.size,
      sound: require('../assets/sounds/animal_sounds/cat.mp3'),
      labelSound: getLabelSound('grasshopper', language),
      isMoving: false,
    },
    {
      id: 68,
      name: t('animals.ladyBag'),
      type: 'sprite' as const,
      animalType: 'Insects' as const,
      source: ladyBagSprite,
      frames: ladyBagFrames,
      spriteSheetSize: ladyBagMeta.size,
      sound: require('../assets/sounds/animal_sounds/cat.mp3'),
      labelSound: getLabelSound('ladybug', language),
      isMoving: false,
    },
    {
      id: 69,
      name: t('animals.mosquito'),
      type: 'sprite' as const,
      animalType: 'Insects' as const,
      source: mosquitoSprite,
      frames: mosquitoFrames,
      spriteSheetSize: mosquitoMeta.size,
      sound: require('../assets/sounds/animal_sounds/cat.mp3'),
      labelSound: getLabelSound('mosquito', language),
      isMoving: false,
    },
    {
      id: 70,
      name: t('animals.snail'),
      type: 'sprite' as const,
      animalType: 'Insects' as const,
      source: snailSprite,
      frames: snailFrames,
      spriteSheetSize: snailMeta.size,
      sound: require('../assets/sounds/animal_sounds/cat.mp3'),
      labelSound: getLabelSound('snail', language),
      isMoving: false,
    },
    {
      id: 71,
      name: t('animals.spider'),
      type: 'sprite' as const,
      animalType: 'Insects' as const,
      source: spiderSprite,
      frames: spiderFrames,
      spriteSheetSize: spiderMeta.size,
      sound: require('../assets/sounds/animal_sounds/cat.mp3'),
      labelSound: getLabelSound('spider', language),
      isMoving: false,
    },
    {
      id: 72,
      name: t('animals.crab'),
      type: 'sprite' as const,
      animalType: 'Ocean' as const,
      source: crabSprite,
      frames: crabFrames,
      spriteSheetSize: crabMeta.size,
      sound: require('../assets/sounds/animal_sounds/cat.mp3'),
      labelSound: getLabelSound('crab', language),
      isMoving: false,
    },
    {
      id: 73,
      name: t('animals.dolphin'),
      type: 'sprite' as const,
      animalType: 'Ocean' as const,
      source: dolphinSprite,
      frames: dolphinFrames,
      spriteSheetSize: dolphinMeta.size,
      sound: require('../assets/sounds/animal_sounds/cat.mp3'),
      labelSound: getLabelSound('dolphin', language),
      isMoving: true,
      movingDirection: 'left',
    },
    {
      id: 74,
      name: t('animals.fish'),
      type: 'sprite' as const,
      animalType: 'Ocean' as const,
      source: fishSprite,
      frames: fishFrames,
      spriteSheetSize: fishMeta.size,
      sound: require('../assets/sounds/animal_sounds/cat.mp3'),
      labelSound: getLabelSound('fish', language),
      isMoving: false,
    },
    {
      id: 75,
      name: t('animals.jellyfish'),
      type: 'sprite' as const,
      animalType: 'Ocean' as const,
      source: jellyfishSprite,
      frames: jellyfishFrames,
      spriteSheetSize: jellyfishMeta.size,
      sound: require('../assets/sounds/animal_sounds/cat.mp3'),
      labelSound: getLabelSound('jellyfish', language),
      isMoving: false,
    },
    {
      id: 76,
      name: t('animals.lobster'),
      type: 'sprite' as const,
      animalType: 'Ocean' as const,
      source: lobsterSprite,
      frames: lobsterFrames,
      spriteSheetSize: lobsterMeta.size,
      sound: require('../assets/sounds/animal_sounds/cat.mp3'),
      labelSound: getLabelSound('lobster', language),
      isMoving: false,
    },
    {
      id: 77,
      name: t('animals.octopus'),
      type: 'sprite' as const,
      animalType: 'Ocean' as const,
      source: octopusSprite,
      frames: octopusFrames,
      spriteSheetSize: octopusMeta.size,
      sound: require('../assets/sounds/animal_sounds/cat.mp3'),
      labelSound: getLabelSound('octopus', language),
      isMoving: true,
      movingDirection: 'left',
    },
    {
      id: 78,
      name: t('animals.seaTurtle'),
      type: 'sprite' as const,
      animalType: 'Ocean' as const,
      source: seaTurtleSprite,
      frames: seaTurtleFrames,
      spriteSheetSize: seaTurtleMeta.size,
      sound: require('../assets/sounds/animal_sounds/turt.mp3'),
      labelSound: getLabelSound('sea_turtle', language),
      isMoving: true,
      movingDirection: 'left',
    },
    {
      id: 79,
      name: t('animals.seahorse'),
      type: 'sprite' as const,
      animalType: 'Ocean' as const,
      source: seahorseSprite,
      frames: seahorseFrames,
      spriteSheetSize: seahorseMeta.size,
      sound: require('../assets/sounds/animal_sounds/cat.mp3'),
      labelSound: getLabelSound('seahorse', language),
      isMoving: false,
    },
    {
      id: 80,
      name: t('animals.shark'),
      type: 'sprite' as const,
      animalType: 'Ocean' as const,
      source: sharkSprite,
      frames: sharkFrames,
      spriteSheetSize: sharkMeta.size,
      sound: require('../assets/sounds/animal_sounds/cat.mp3'),
      labelSound: getLabelSound('shark', language),
      isMoving: true,
      movingDirection: 'left',
    },
    {
      id: 81,
      name: t('animals.shrimp'),
      type: 'sprite' as const,
      animalType: 'Ocean' as const,
      source: shrimpSprite,
      frames: shrimpFrames,
      spriteSheetSize: shrimpMeta.size,
      sound: require('../assets/sounds/animal_sounds/cat.mp3'),
      labelSound: getLabelSound('shrimp', language),
      isMoving: false,
    },
    {
      id: 82,
      name: t('animals.starfish'),
      type: 'sprite' as const,
      animalType: 'Ocean' as const,
      source: starfishSprite,
      frames: starfishFrames,
      spriteSheetSize: starfishMeta.size,
      sound: require('../assets/sounds/animal_sounds/cat.mp3'),
      labelSound: getLabelSound('starfish', language),
      isMoving: false,
    },
    {
      id: 83,
      name: t('animals.stingray'),
      type: 'sprite' as const,
      animalType: 'Ocean' as const,
      source: stingraySprite,
      frames: stingrayFrames,
      spriteSheetSize: stingrayMeta.size,
      sound: require('../assets/sounds/animal_sounds/cat.mp3'),
      labelSound: getLabelSound('stingray', language),
      isMoving: true,
      movingDirection: 'left',
    },
    {
      id: 84,
      name: t('animals.whale'),
      type: 'sprite' as const,
      animalType: 'Ocean' as const,
      source: whaleSprite,
      frames: whaleFrames,
      spriteSheetSize: whaleMeta.size,
      sound: require('../assets/sounds/animal_sounds/cat.mp3'),
      labelSound: getLabelSound('whale', language),
      isMoving: true,
      movingDirection: 'right',
    },
    {
      id: 85,
      name: t('animals.canary'),
      type: 'sprite' as const,
      animalType: 'Birds' as const,
      source: canarySprite,
      frames: canaryFrames,
      spriteSheetSize: canaryMeta.size,
      sound: require('../assets/sounds/animal_sounds/cat.mp3'),
      labelSound: getLabelSound('canary', language),
      isMoving: false,
    },
    {
      id: 86,
      name: t('animals.dove'),
      type: 'sprite' as const,
      animalType: 'Birds' as const,
      source: doveSprite,
      frames: doveFrames,
      spriteSheetSize: doveMeta.size,
      sound: require('../assets/sounds/animal_sounds/cat.mp3'),
      labelSound: getLabelSound('dove', language),
      isMoving: false,
    },
    {
      id: 87,
      name: t('animals.parrot'),
      type: 'sprite' as const,
      animalType: 'Birds' as const,
      source: parrotSprite,
      frames: parrotFrames,
      spriteSheetSize: parrotMeta.size,
      sound: require('../assets/sounds/animal_sounds/cat.mp3'),
      labelSound: getLabelSound('parrot', language),
      isMoving: false,
    },
    {
      id: 88,
      name: t('animals.pelican'),
      type: 'sprite' as const,
      animalType: 'Birds' as const,
      source: pelicanSprite,
      frames: pelicanFrames,
      spriteSheetSize: pelicanMeta.size,
      sound: require('../assets/sounds/animal_sounds/cat.mp3'),
      labelSound: getLabelSound('pelican', language),
      isMoving: false,
    },
    {
      id: 89,
      name: t('animals.raven'),
      type: 'sprite' as const,
      animalType: 'Birds' as const,
      source: ravenSprite,
      frames: ravenFrames,
      spriteSheetSize: ravenMeta.size,
      sound: require('../assets/sounds/animal_sounds/cat.mp3'),
      labelSound: getLabelSound('raven', language),
      isMoving: false,
    },
    {
      id: 90,
      name: t('animals.seagull'),
      type: 'sprite' as const,
      animalType: 'Birds' as const,
      source: seagullSprite,
      frames: seagullFrames,
      spriteSheetSize: seagullMeta.size,
      sound: require('../assets/sounds/animal_sounds/cat.mp3'),
      labelSound: getLabelSound('seagull', language),
      isMoving: false,
    },
    {
      id: 91,
      name: t('animals.sparrow'),
      type: 'sprite' as const,
      animalType: 'Birds' as const,
      source: sparrowSprite,
      frames: sparrowFrames,
      spriteSheetSize: sparrowMeta.size,
      sound: require('../assets/sounds/animal_sounds/cat.mp3'),
      labelSound: getLabelSound('sparrow', language),
      isMoving: false,
    },
    {
      id: 92,
      name: t('animals.stork'),
      type: 'sprite' as const,
      animalType: 'Birds' as const,
      source: storkSprite,
      frames: storkFrames,
      spriteSheetSize: storkMeta.size,
      sound: require('../assets/sounds/animal_sounds/cat.mp3'),
      labelSound: getLabelSound('stork', language),
      isMoving: false,
    },
    {
      id: 93,
      name: t('animals.swan'),
      type: 'sprite' as const,
      animalType: 'Birds' as const,
      source: swanSprite,
      frames: swanFrames,
      spriteSheetSize: swanMeta.size,
      sound: require('../assets/sounds/animal_sounds/cat.mp3'),
      labelSound: getLabelSound('swan', language),
      isMoving: false,
    },
    {
      id: 94,
      name: t('animals.toucan'),
      type: 'sprite' as const,
      animalType: 'Birds' as const,
      source: toucanSprite,
      frames: toucanFrames,
      spriteSheetSize: toucanMeta.size,
      sound: require('../assets/sounds/animal_sounds/cat.mp3'),
      labelSound: getLabelSound('toucan', language),
      isMoving: false,
    },
    {
      id: 95,
      name: t('animals.woodpecker'),
      type: 'sprite' as const,
      animalType: 'Birds' as const,
      source: woodpeckerSprite,
      frames: woodpeckerFrames,
      spriteSheetSize: woodpeckerMeta.size,
      sound: require('../assets/sounds/animal_sounds/cat.mp3'),
      labelSound: getLabelSound('woodpecker', language),
      isMoving: false,
    },
        {
      id: 97,
      name: t('animals.chicken'),
      type: 'sprite' as const,
      animalType: 'Birds' as const,
      source: chickenSpriteSheet,
      frames: chickenFrames,
      spriteSheetSize: chickenMeta.size,
      sound: require('../assets/sounds/animal_sounds/chicken.mp3'),
      labelSound: getLabelSound('chicken', language),
      isMoving: false,
    },
    {
      id: 98,
      name: t('animals.chick'),
      type: 'sprite' as const,
      animalType: 'Birds' as const,
      source: chickSpriteSheet,
      frames: chickFrames,
      spriteSheetSize: chickMeta.size,
      sound: require('../assets/sounds/animal_sounds/chick.mp3'),
      labelSound: getLabelSound('chick', language),
      isMoving: false,
    },
	    {
      id: 99,
      name: t('animals.duck'),
      type: 'sprite' as const,
      animalType: 'Birds' as const,
      source: duckSpriteSheet,
      frames: duckFrames,
      spriteSheetSize: duckMeta.size,
      sound: require('../assets/sounds/animal_sounds/duck.mp3'),
      labelSound: getLabelSound('duck', language),
      isMoving: false,
    },
	    {
      id: 100,
      name: t('animals.goose'),
      type: 'sprite' as const,
      animalType: 'Birds' as const,
      source: gooseSpriteSheet,
      frames: gooseFrames,
      spriteSheetSize: gooseMeta.size,
      sound: require('../assets/sounds/animal_sounds/goose.mp3'),
      labelSound: getLabelSound('goose', language),
      isMoving: false,
    },
	    {
      id: 101,
      name: t('animals.rooster'),
      type: 'sprite' as const,
      animalType: 'Birds' as const,
      source: roosterSpriteSheet,
      frames: roosterFrames,
      spriteSheetSize: roosterMeta.size,
      sound: require('../assets/sounds/animal_sounds/rooster.mp3'),
      labelSound: getLabelSound('rooster', language),
      isMoving: true,
      movingDirection: 'left',
    },
	    {
      id: 102,
      name: t('animals.turkey'),
      type: 'sprite' as const,
      animalType: 'Birds' as const,
      source: turkeySpriteSheet,
      frames: turkeyFrames,
      spriteSheetSize: turkeyMeta.size,
      sound: require('../assets/sounds/animal_sounds/turkey.mp3'),
      labelSound: getLabelSound('turkey', language),
      isMoving: false,
    },
	    {
      id: 103,
      name: t('animals.owl'),
      type: 'sprite' as const,
      animalType: 'Birds' as const,
      source: owlSpriteSheet,
      frames: owlFrames,
      spriteSheetSize: owlMeta.size,
      sound: require('../assets/sounds/animal_sounds/owl.mp3'),
      labelSound: getLabelSound('owl', language),
      isMoving: false,
    },
	    {
      id: 104,
      name: t('animals.penguin'),
      type: 'sprite' as const,
      animalType: 'Birds' as const,
      source: penguinSprite,
      frames: penguinFrames,
      spriteSheetSize: penguinMeta.size,
      sound: require('../assets/sounds/animal_sounds/duck.mp3'),
      labelSound: getLabelSound('penguin', language),
      isMoving: false,
    },
	    {
      id: 105,
      name: t('animals.eagle'),
      type: 'sprite' as const,
      animalType: 'Birds' as const,
      source: eagleSprite,
      frames: eagleFrames,
      spriteSheetSize: eagleMeta.size,
      sound: require('../assets/sounds/animal_sounds/cat.mp3'),
      labelSound: getLabelSound('eagle', language),
      isMoving: false,
    },
	    {
      id: 106,
      name: t('animals.flamingo'),
      type: 'sprite' as const,
      animalType: 'Birds' as const,
      source: flamingoSprite,
      frames: flamingoFrames,
      spriteSheetSize: flamingoMeta.size,
      sound: require('../assets/sounds/animal_sounds/cat.mp3'),
      labelSound: getLabelSound('flamingo', language),
      isMoving: false,
    },
    {
    id: 107,
    name: t('animals.antEater'),
    type: 'sprite' as const,
    animalType: 'Jungle' as const,
    source: antEaterSprite,
    frames: antEaterFrames,
    spriteSheetSize: antEaterMeta.size,
    sound: require('../assets/sounds/animal_sounds/cat.mp3'),
    labelSound: getLabelSound('antEater', language),
    isMoving: false,
  },
  {
    id: 108,
    name: t('animals.asianElephant'),
    type: 'sprite' as const,
    animalType: 'Jungle' as const,
    source: asianElephantSprite,
    frames: asianElephantFrames,
    spriteSheetSize: asianElephantMeta.size,
    sound: require('../assets/sounds/animal_sounds/cat.mp3'),
    labelSound: getLabelSound('asianElephant', language),
    isMoving: false,
  },
  {
    id: 109,
    name: t('animals.bengalTiger'),
    type: 'sprite' as const,
    animalType: 'Jungle' as const,
    source: bengalTigerSprite,
    frames: bengalTigerFrames,
    spriteSheetSize: bengalTigerMeta.size,
    sound: require('../assets/sounds/animal_sounds/cat.mp3'),
    labelSound: getLabelSound('bengalTiger', language),
    isMoving: false,
  },
  {
    id: 110,
    name: t('animals.blackPanther'),
    type: 'sprite' as const,
    animalType: 'Jungle' as const,
    source: blackPantherSprite,
    frames: blackPantherFrames,
    spriteSheetSize: blackPantherMeta.size,
    sound: require('../assets/sounds/animal_sounds/cat.mp3'),
    labelSound: getLabelSound('blackPanther', language),
    isMoving: false,
  },
  {
    id: 111,
    name: t('animals.capybara'),
    type: 'sprite' as const,
    animalType: 'Jungle' as const,
    source: capybaraSprite,
    frames: capybaraFrames,
    spriteSheetSize: capybaraMeta.size,
    sound: require('../assets/sounds/animal_sounds/cat.mp3'),
    labelSound: getLabelSound('capybara', language),
    isMoving: false,
  },
  {
    id: 112,
    name: t('animals.chameleon'),
    type: 'sprite' as const,
    animalType: 'Jungle' as const,
    source: chameleonSprite,
    frames: chameleonFrames,
    spriteSheetSize: chameleonMeta.size,
    sound: require('../assets/sounds/animal_sounds/cat.mp3'),
    labelSound: getLabelSound('chameleon', language),
    isMoving: false,
  },
  {
    id: 113,
    name: t('animals.chimpanzee'),
    type: 'sprite' as const,
    animalType: 'Jungle' as const,
    source: chimpanzeeSprite,
    frames: chimpanzeeFrames,
    spriteSheetSize: chimpanzeeMeta.size,
    sound: require('../assets/sounds/animal_sounds/cat.mp3'),
    labelSound: getLabelSound('chimpanzee', language),
    isMoving: false,
  },
  {
    id: 114,
    name: t('animals.crocodile'),
    type: 'sprite' as const,
    animalType: 'Jungle' as const,
    source: crocodileSprite,
    frames: crocodileFrames,
    spriteSheetSize: crocodileMeta.size,
    sound: require('../assets/sounds/animal_sounds/cat.mp3'),
    labelSound: getLabelSound('crocodile', language),
    isMoving: false,
  },
  {
    id: 115,
    name: t('animals.frog'),
    type: 'sprite' as const,
    animalType: 'Jungle' as const,
    source: frogSprite,
    frames: frogFrames,
    spriteSheetSize: frogMeta.size,
    sound: require('../assets/sounds/animal_sounds/cat.mp3'),
    labelSound: getLabelSound('frog', language),
    isMoving: false,
  },
  {
    id: 116,
    name: t('animals.gorilla'),
    type: 'sprite' as const,
    animalType: 'Jungle' as const,
    source: gorillaSprite,
    frames: gorillaFrames,
    spriteSheetSize: gorillaMeta.size,
    sound: require('../assets/sounds/animal_sounds/cat.mp3'),
    labelSound: getLabelSound('gorilla', language),
    isMoving: false,
  },
  {
    id: 117,
    name: t('animals.hippopotamus'),
    type: 'sprite' as const,
    animalType: 'Jungle' as const,
    source: hippopotamusSprite,
    frames: hippopotamusFrames,
    spriteSheetSize: hippopotamusMeta.size,
    sound: require('../assets/sounds/animal_sounds/cat.mp3'),
    labelSound: getLabelSound('hippopotamus', language),
    isMoving: false,
  },
  {
    id: 118,
    name: t('animals.jaguar'),
    type: 'sprite' as const,
    animalType: 'Jungle' as const,
    source: jaguarSprite,
    frames: jaguarFrames,
    spriteSheetSize: jaguarMeta.size,
    sound: require('../assets/sounds/animal_sounds/cat.mp3'),
    labelSound: getLabelSound('jaguar', language),
    isMoving: false,
  },
  {
    id: 119,
    name: t('animals.lemur'),
    type: 'sprite' as const,
    animalType: 'Jungle' as const,
    source: lemurSprite,
    frames: lemurFrames,
    spriteSheetSize: lemurMeta.size,
    sound: require('../assets/sounds/animal_sounds/cat.mp3'),
    labelSound: getLabelSound('lemur', language),
    isMoving: false,
  },
  {
    id: 120,
    name: t('animals.lizard'),
    type: 'sprite' as const,
    animalType: 'Jungle' as const,
    source: lizardSprite,
    frames: lizardFrames,
    spriteSheetSize: lizardMeta.size,
    sound: require('../assets/sounds/animal_sounds/cat.mp3'),
    labelSound: getLabelSound('lizard', language),
    isMoving: false,
  },
  {
    id: 121,
    name: t('animals.orangutan'),
    type: 'sprite' as const,
    animalType: 'Jungle' as const,
    source: orangutanSprite,
    frames: orangutanFrames,
    spriteSheetSize: orangutanMeta.size,
    sound: require('../assets/sounds/animal_sounds/cat.mp3'),
    labelSound: getLabelSound('orangutan', language),
    isMoving: false,
  },
  {
    id: 122,
    name: t('animals.sloth'),
    type: 'sprite' as const,
    animalType: 'Jungle' as const,
    source: slothSprite,
    frames: slothFrames,
    spriteSheetSize: slothMeta.size,
    sound: require('../assets/sounds/animal_sounds/cat.mp3'),
    labelSound: getLabelSound('sloth', language),
    isMoving: false,
  },
  {
    id: 123,
    name: t('animals.snake'),
    type: 'sprite' as const,
    animalType: 'Jungle' as const,
    source: snakeSprite,
    frames: snakeFrames,
    spriteSheetSize: snakeMeta.size,
    sound: require('../assets/sounds/animal_sounds/cat.mp3'),
    labelSound: getLabelSound('snake', language),
    isMoving: false,
  },
  {
    id: 124,
    name: t('animals.turtle'),
    type: 'sprite' as const,
    animalType: 'Jungle' as const,
    source: turtleSprite,
    frames: turtleFrames,
    spriteSheetSize: turtleMeta.size,
    sound: require('../assets/sounds/animal_sounds/cat.mp3'),
    labelSound: getLabelSound('turtle', language),
    isMoving: false,
  }
  ];

  // Preload all animal images regardless of type
  animals.forEach(animal => {
    if (typeof animal.source === 'number') {
      Asset.fromModule(animal.source).downloadAsync();
    }
  });

  return animals;
}
