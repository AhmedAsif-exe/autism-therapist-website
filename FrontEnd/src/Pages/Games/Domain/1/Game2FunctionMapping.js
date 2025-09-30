// Game 2 Function Mappings - Clean and logical mappings for select-all gameplay
// Separates tools/instruments from objects/consumables for better gameplay logic

export const GAME2_FUNCTION_MAPPINGS = {
  // Things you can EAT (consumables only)
  'Eat': [
    { name: 'Cookies', imagePath: 'cookies' },
    { name: 'Chips', imagePath: 'chips' },
    { name: 'Fries', imagePath: 'fries' },
    { name: 'Apple', imagePath: 'apple' },
    { name: 'Burger', imagePath: 'burger' },
    { name: 'Ice Cream', imagePath: 'icecream' },
    { name: 'Pizza', imagePath: 'pizza' },
    { name: 'Brownie', imagePath: 'brownie' },
    { name: 'Lollipop', imagePath: 'lollipop' },
    { name: 'Marshmallow', imagePath: 'marshmallow' },
    { name: 'Cracker', imagePath: 'cracker' },
    { name: 'Bread', imagePath: 'bread' },
    { name: 'Mango', imagePath: 'mango' },
    { name: 'Strawberry', imagePath: 'strawberry' },
    { name: 'Cherries', imagePath: 'cherries' },
  ],

  // Things you can DRINK (liquids only)
  'Drink': [
    { name: 'Milk', imagePath: 'milk' },
    { name: 'Orange Juice', imagePath: 'orangejuice' },
    { name: 'Tea', imagePath: 'tea' },
    { name: 'Water', imagePath: 'waterbottle' },
  ],

  // Things you can PLAY with/on

  'Play': [
    { name: 'Guitar', imagePath: 'guitar' },
    { name: 'Piano', imagePath: 'piano' },
    { name: 'Violin', imagePath: 'violin' },
    { name: 'Drums', imagePath: 'drums' },
    { name: 'Harp', imagePath: 'harp' },
    { name: 'Flute', imagePath: 'flute' },
  ],

  'Play With': [
    { name: 'Ball', imagePath: 'ball' },
    { name: 'Blocks', imagePath: 'blocks' },
    { name: 'Doll', imagePath: 'doll' },
    { name: 'Puzzle', imagePath: 'puzzle' },
    { name: 'Spinning Top', imagePath: 'spinningtop' },
  ],

    'Play On': [
    { name: 'Swing', imagePath: 'swing' },
    { name: 'Slide', imagePath: 'slide' },
    { name: 'Monkey Bar', imagePath: 'monkeybar' },
  ],

  // Vehicles you can DRIVE (ground vehicles requiring a license)
  'Drive': [
    { name: 'Car', imagePath: 'car' },
    { name: 'Van', imagePath: 'van' },
    { name: 'Train', imagePath: 'train' },
    { name: 'Bus', imagePath: 'bus' },
    { name: 'Truck', imagePath: 'truck' },
  ],

  // Things you can RIDE (personal transportation)
  'Ride': [
    { name: 'Bike', imagePath: 'bike' },
    { name: 'Scooter', imagePath: 'scooter' },
    { name: 'Skateboard', imagePath: 'skateboard' },
    { name: 'Boat', imagePath: 'boat' },
    { name: 'Airplane', imagePath: 'airplane' },
  ],
  
  // Things you can CARRY
  'Carry': [
    { name: 'School Bag', imagePath: 'schoolbag' },
    { name: 'Box', imagePath: 'box' },
  ],

  // Things you can READ
  'Read': [
    { name: 'Book', imagePath: 'book' },
    { name: 'Magazine', imagePath: 'magazine' },
    { name: 'Newspaper', imagePath: 'newspaper' },
    { name: 'Map', imagePath: 'map' },
    { name: 'Catalogue', imagePath: 'catalogue' },
  ],

  // Things that can FLY
  'Fly': [
    { name: 'Kite', imagePath: 'kite' },
    { name: 'Airplane', imagePath: 'airplane' },
    { name: 'Helicopter', imagePath: 'helicopter' },
  ],

  // Things you can THROW
  'Throw': [
    { name: 'Ball', imagePath: 'ball' },
    { name: 'Trash', imagePath: 'trash' },
    { name: 'Frisbee', imagePath: 'frisbee' },
    { name: 'Paper Plane', imagePath: 'paperplane' },
  ],

  // Things you can FOLD
  'Fold': [
    { name: 'Shirt', imagePath: 'shirt' },
    { name: 'Jeans', imagePath: 'jeans' },
    { name: 'Blanket', imagePath: 'blanket' },
    { name: 'Towel', imagePath: 'towel' },
    { name: 'Tissue', imagePath: 'tissue' },
    { name: 'Paper', imagePath: 'paper' },
  ],

  // Things you can BLOW (air instruments/toys)
  'Blow': [
    { name: 'Bubble', imagePath: 'bubble' },
    { name: 'Whistle', imagePath: 'whistle' },
    { name: 'Flute', imagePath: 'flute' },
    { name: 'Balloon', imagePath: 'balloon' },
  ],

  // Things you can TURN ON (electronics/appliances)
  'Turn on': [
    { name: 'TV', imagePath: 'tv' },
    { name: 'Radio', imagePath: 'radio' },
    { name: 'Light Bulb', imagePath: 'lightbulb' },
    { name: 'iPad', imagePath: 'ipad' },
    { name: 'iPhone', imagePath: 'iphone' },
    { name: 'Laptop', imagePath: 'laptop' },
    { name: 'Oven', imagePath: 'oven' },
    { name: 'Washing Machine', imagePath: 'washingmachine' },
  ],

  // Things you can WEAR
  'Wear': [
    { name: 'Shirt', imagePath: 'shirt' },
    { name: 'Jeans', imagePath: 'jeans' },
    { name: 'Underwear', imagePath: 'underwear' },
    { name: 'Hat', imagePath: 'hat' },
    { name: 'Jacket', imagePath: 'jacket' },
    { name: 'Coat', imagePath: 'coat' },
    { name: 'Shoe', imagePath: 'shoe' },
    { name: 'Dress', imagePath: 'dress' },
    { name: 'Raincoat', imagePath: 'raincoat' },
  ],

  // Furniture you can SIT on
  'Sit': [
    { name: 'Chair', imagePath: 'chair' },
    { name: 'Sofa', imagePath: 'sofa' },
    { name: 'Stool', imagePath: 'stool' },
    { name: 'Bench', imagePath: 'bench' },
  ],

  // Instruments you can SHAKE
  'Shake': [
    { name: 'Tambourine', imagePath: 'tambourine' },
    { name: 'Rattle', imagePath: 'rattle' },
    { name: 'Maraca', imagePath: 'maraca' },
  ],

  // Things you can OPEN
  'Open': [
    { name: 'Door', imagePath: 'door' },
    { name: 'Present', imagePath: 'present' },
    { name: 'Window', imagePath: 'window' },
    { name: 'Jar', imagePath: 'jar' },
  ],
  // === "WITH" VARIANTS - Tools and instruments ===
  
  // Tools you use to EAT with
  'Eat with': [
    { name: 'Fork', imagePath: 'fork' },
    { name: 'Spoon', imagePath: 'spoon' },
    { name: 'Chopstick', imagePath: 'chopstick' },
  ],
  
  // Containers you use to DRINK with
  'Drink with': [
    { name: 'Cup', imagePath: 'cup' },
    { name: 'Bottle', imagePath: 'waterbottle' },
    { name: 'Glass', imagePath: 'waterglass' },
    { name: 'Straw', imagePath: 'straw' },
  ],
  
  // Tools you use to WRITE with
  'Write with': [
    { name: 'Marker', imagePath: 'marker' },
    { name: 'Pencil', imagePath: 'pencil' },
    { name: 'Crayon', imagePath: 'crayon' },
    { name: 'Pen', imagePath: 'pen' },
  ],
  
  // Surfaces you can WRITE on
  'Write on': [
    { name: 'Paper', imagePath: 'paper' },
    { name: 'Whiteboard', imagePath: 'whiteboard' },
    { name: 'Blackboard', imagePath: 'blackboard' },
  ],
  
  // Tools you use to CUT with
  'Cut with': [
    { name: 'Saw', imagePath: 'saw' },
    { name: 'Scissors', imagePath: 'scissor' },
    { name: 'Knife', imagePath: 'knife' },
  ],
  
  // Things you can CUT (materials)
  'Cut': [
    { name: 'String', imagePath: 'string' },
    { name: 'Paper', imagePath: 'paper' },
    { name: 'Bread', imagePath: 'bread' },
  ],
  
  // Tools you use to BRUSH with
  'Brush with': [
    { name: 'Comb', imagePath: 'comb' },
    { name: 'Toothbrush', imagePath: 'toothbrush' },
    { name: 'Brush', imagePath: 'brush' },
    { name: 'Paint Brush', imagePath: 'paintbrush' },
  ],
  
  // Things you can BRUSH
  'Brush': [
    { name: 'Teeth', imagePath: 'teeth' },
    { name: 'Shoe', imagePath: 'shoe' },
  ],
  
  // Surfaces you can SLEEP on
  'Sleep on': [
    { name: 'Bed', imagePath: 'bed' },
    { name: 'Sofa', imagePath: 'sofa' },
    { name: 'Sleeping Bag', imagePath: 'sleepingbag' },
  ],
  
  // Tools you use to WIPE with
  'Wipe with': [
    { name: 'Tissue', imagePath: 'tissue' },
    { name: 'Towel', imagePath: 'towel' },
  ],

  // Things you can WIPE (surfaces/objects)
  'Wipe': [
    { name: 'Window', imagePath: 'window' },
    { name: 'Table', imagePath: 'table' },
  ],

  // Things you use to BATHE with
  'Bathe with': [
    { name: 'Soap', imagePath: 'soap' },
    { name: 'Shampoo', imagePath: 'shampoo' },
    { name: 'Sponge', imagePath: 'sponge' },
  ],
};

// Helper functions for Game 2
export function getAllGame2Functions() {
  return Object.keys(GAME2_FUNCTION_MAPPINGS);
}

export function getGame2AssetsForFunction(functionName) {
  return GAME2_FUNCTION_MAPPINGS[functionName] || [];
}

// Generate proper grammar for function prompts
export function getGame2Prompt(functionName) {
  const specialCases = {
    'Eat': 'Select all the items you can eat',
    'Eat with': 'Select all the items you use to eat',
    'Drink': 'Select all the items you can drink', 
    'Drink with': 'Select all the items you use to drink',
    'Play With': 'Select all the items you can play with',
    'Play': 'Select all the items you can play',
    'Play On': 'Select all the items you can play on',
    'Drive': 'Select all the items you can drive',
    'Ride': 'Select all the items you can ride',
    'Carry': 'Select all the items you can carry',
    'Read': 'Select all the items you can read',
    'Brush': 'Select all the items you can brush',
    'Brush with': 'Select all the items you use to brush',
    'Turn on': 'Select all the items you can turn on',
    'Throw': 'Select all the items you can throw',
    'Fold': 'Select all the items you can fold',
    'Blow': 'Select all the items you can blow',
    'Write with': 'Select all the items you use to write',
    'Write on': 'Select all the items you can write on',
    'Cut': 'Select all the items you can cut',
    'Cut with': 'Select all the items you use to cut',
    'Wear': 'Select all the items you can wear',
    'Sleep on': 'Select all the items you can sleep on',
    'Sleep with': 'Select all the items you use when sleeping',
    'Wipe': 'Select all the items you can wipe',
    'Wipe with': 'Select all the items you use to wipe',
    'Fly': 'Select all the items that can fly',
    'Sit': 'Select all the items you can sit on',
    'Shake': 'Select all the items you can shake',
    'Bathe': 'Select all the places you can bathe',
    'Bathe with': 'Select all the items you use to bathe',
    'Open': 'Select all the items you can open',
  };
  
  return specialCases[functionName] || `Select all the items you can ${functionName.toLowerCase()}`;
}

// Generate MCQ options for Game 2
export function generateGame2MCQ(functionName, totalOptions = 8) {
  const correctItems = getGame2AssetsForFunction(functionName);
  
  if (correctItems.length === 0) {
    console.warn(`No items found for function: ${functionName}`);
    return { correct: [], incorrect: [] };
  }
  
  // Choose 2-4 correct answers randomly
  const numCorrect = Math.min(
    correctItems.length,
    Math.floor(Math.random() * 3) + 2 // Random between 2-4
  );
  
  const shuffledCorrect = [...correctItems].sort(() => Math.random() - 0.5);
  const selectedCorrect = shuffledCorrect.slice(0, numCorrect);
  
  // Get ALL imagePaths that exist in the correct function category (not just selected ones)
  const allCorrectImagePaths = new Set(correctItems.map(item => item.imagePath));
  
  // Get all incorrect items (from other functions, excluding ANY item that appears in correct category)
  const incorrectItems = [];
  
  Object.entries(GAME2_FUNCTION_MAPPINGS).forEach(([fn, items]) => {
    if (fn !== functionName) {
      items.forEach(item => {
        // Exclude if this imagePath appears ANYWHERE in the correct function category
        if (!allCorrectImagePaths.has(item.imagePath)) {
          incorrectItems.push(item);
        }
      });
    }
  });
  
  // Remove duplicates from incorrect items
  const uniqueIncorrect = Array.from(
    new Map(incorrectItems.map(item => [item.imagePath, item])).values()
  );
  
  // Select random incorrect items to fill remaining slots
  const numIncorrect = totalOptions - numCorrect;
  const shuffledIncorrect = [...uniqueIncorrect].sort(() => Math.random() - 0.5);
  const selectedIncorrect = shuffledIncorrect.slice(0, numIncorrect);
  
  return {
    correct: selectedCorrect,
    incorrect: selectedIncorrect,
    allOptions: [...selectedCorrect, ...selectedIncorrect].sort(() => Math.random() - 0.5)
  };
}
