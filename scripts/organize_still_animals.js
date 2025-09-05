const fs = require('fs');
const path = require('path');

// Define the mapping of animals to their respective levels based on the animals.ts file
const animalLevelMapping = {
  // Farm animals
  'dog': 'Farm',
  'cat': 'Farm',
  'chicken': 'Farm',
  'chick': 'Farm',
  'donkey': 'Farm',
  'cow': 'Farm',
  'duck': 'Farm',
  'goat': 'Farm',
  'goose': 'Farm',
  'horse': 'Farm',
  'llama': 'Farm',
  'pig': 'Farm',
  'rabbit': 'Farm',
  'sheep': 'Farm',
  'rooster': 'Farm',
  'turkey': 'Farm',
  
  // Forest animals
  'badger': 'Forest',
  'fox': 'Forest',
  'bear': 'Forest',
  'raccoon': 'Forest',
  'squirrel': 'Forest',
  'hedgehog': 'Forest',
  'owl': 'Forest',
  'wolf': 'Forest',
  'deer': 'Forest',
  'moose': 'Forest',
  'otter': 'Forest',
  'skunk': 'Forest',
  'mouse': 'Forest',
  'beaver': 'Forest',
  'boar': 'Forest',
  'bat': 'Forest',
  
  // Arctic animals
  'whitebear': 'Arctic',
  'whitefox': 'Arctic',
  'reindeer': 'Arctic',
  'seal': 'Arctic',
  'snowyowl': 'Arctic',
  'ping': 'Arctic', // penguin
  'walrus': 'Arctic',
  
  // Desert animals
  'camel': 'Desert',
  'dtortoise': 'Desert',
  'fennecfox': 'Desert',
  'iguana': 'Desert',
  'jackal': 'Desert',
  'jerboa': 'Desert',
  'meerkat': 'Desert',
  'oryx': 'Desert',
  'sandcat': 'Desert',
  'scorpion': 'Desert',
  'caracal': 'Desert',
  'snake': 'Desert',
  'lizard': 'Desert',
  
  // Savannah animals
  'antelope': 'Savannah',
  'bizon': 'Savannah',
  'elephant': 'Savannah',
  'aelephant': 'Savannah', // baby elephant
  'gepard': 'Savannah',
  'hyena': 'Savannah',
  'leon': 'Savannah',
  'tiger': 'Savannah',
  'btiger': 'Savannah', // baby tiger
  'wildboar': 'Savannah',
  'zebra': 'Savannah',
  'eagle': 'Savannah',
  'flamingo': 'Savannah',
  'giraffe': 'Savannah',
  'ostrich': 'Savannah',
  'rhinoceros': 'Savannah',
  'hippopotamus': 'Savannah',
  
  // Insects
  'ant': 'Insects',
  'bee': 'Insects',
  'butterfly': 'Insects',
  'caterpillar': 'Insects',
  'cockroach': 'Insects',
  'dragonfly': 'Insects',
  'fly': 'Insects',
  'grasshopper': 'Insects',
  'ladybag': 'Insects',
  'mosquito': 'Insects',
  'mantis': 'Insects',
  'worm': 'Insects',
  'snail': 'Insects',
  'spider': 'Insects',
  
  // Ocean animals
  'crab': 'Ocean',
  'dolphin': 'Ocean',
  'fish': 'Ocean',
  'jellyfish': 'Ocean',
  'lobster': 'Ocean',
  'octopus': 'Ocean',
  'seaturtle': 'Ocean',
  'seahorse': 'Ocean',
  'shark': 'Ocean',
  'shrimp': 'Ocean',
  'starfish': 'Ocean',
  'stringray': 'Ocean',
  'whale': 'Ocean',
  
  // Birds
  'canary': 'Birds',
  'dove': 'Birds',
  'parrot': 'Birds',
  'pelican': 'Birds',
  'raven': 'Birds',
  'seagull': 'Birds',
  'sparrow': 'Birds',
  'stork': 'Birds',
  'swan': 'Birds',
  'woodpecker': 'Birds',
  
  // Jungle animals
  'anteater': 'Jungle',
  'capybara': 'Jungle',
  'chameleon': 'Jungle',
  'chimpanzee': 'Jungle',
  'crocodile': 'Jungle',
  'frog': 'Jungle',
  'gorilla': 'Jungle',
  'jaguar': 'Jungle',
  'koala': 'Jungle',
  'lemur': 'Jungle',
  'orangutan': 'Jungle',
  'panda': 'Jungle',
  'panther': 'Jungle',
  'sloth': 'Jungle',
  'toucan': 'Jungle',
  'turtle': 'Jungle'
};

const sourceDir = path.join(__dirname, '../src/assets/images/still-animals');
const targetBaseDir = path.join(__dirname, '../src/assets/images/still-animals-organized');

// Create the base target directory if it doesn't exist
if (!fs.existsSync(targetBaseDir)) {
  fs.mkdirSync(targetBaseDir, { recursive: true });
}

// Create level directories
const levels = ['Farm', 'Forest', 'Arctic', 'Desert', 'Savannah', 'Insects', 'Ocean', 'Birds', 'Jungle'];
levels.forEach(level => {
  const levelDir = path.join(targetBaseDir, level);
  if (!fs.existsSync(levelDir)) {
    fs.mkdirSync(levelDir, { recursive: true });
  }
});

// Read all files from the source directory
const files = fs.readdirSync(sourceDir);

// Copy each file to its corresponding level directory
files.forEach(file => {
  if (file.endsWith('.png')) {
    const animalName = file.replace('.png', '');
    const level = animalLevelMapping[animalName];
    
    if (level) {
      const sourcePath = path.join(sourceDir, file);
      const targetPath = path.join(targetBaseDir, level, file);
      
      // Copy the file
      fs.copyFileSync(sourcePath, targetPath);
      console.log(`Copied ${file} to ${level}/`);
    } else {
      console.warn(`Warning: No level mapping found for ${file}`);
    }
  }
});

console.log('\nOrganization complete!');
console.log(`Files organized in: ${targetBaseDir}`);

// List summary
console.log('\nSummary:');
levels.forEach(level => {
  const levelDir = path.join(targetBaseDir, level);
  const levelFiles = fs.readdirSync(levelDir);
  console.log(`${level}: ${levelFiles.length} animals`);
});
