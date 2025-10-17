/**
 * Furniture Pack and Rarity System
 * 
 * Complete furniture pack mechanics with weighted rarity drops
 * and tier-based furniture progression system for building logs economy.
 */

export type FurnitureRarity = 
  | 'Rough'
  | 'Sturdy'
  | 'Refined'
  | 'Noble'
  | 'Heirloom'
  | 'Exquisite'
  | 'Masterwork';

export type FurniturePackType = 'Basic' | 'Premium' | 'Limited';

export type FurnitureCategory = 'Outdoor' | 'Decorative' | 'Structures' | 'Natural';

export interface FurnitureData {
  id: string;
  name: string;
  rarity: FurnitureRarity;
  category: FurnitureCategory;
  modelId: string; // Reference to FURNITURE_MODELS
  obtainedAt: number;
  placed: boolean;
  placedAt?: number;
  position?: { x: number; y: number; z: number };
  rotation?: number;
  fromLimitedPack?: boolean;
}

export interface FurniturePackDefinition {
  type: FurniturePackType;
  name: string;
  cost: number; // Cost in Building Logs
  itemCount: number;
  description: string;
  emoji: string;
  dropRates: Record<FurnitureRarity, number>;
  isLimited?: boolean;
  limitedUntil?: number;
}

export interface FurniturePackState {
  ownedFurniture: FurnitureData[];
  packsOpened: number;
  totalFurnitureObtained: number;
  lastPackOpenedAt: number | null;
}

// Rarity information with visual metadata
export const FURNITURE_RARITY_INFO: Record<FurnitureRarity, {
  emoji: string;
  color: string;
  glowColor: string;
  description: string;
  marketValue: number;
  tier: number;
}> = {
  'Rough': {
    emoji: '🪵',
    color: '#8d6e63',
    glowColor: '#a1887f',
    description: 'Simple and functional',
    marketValue: 50,
    tier: 1,
  },
  'Sturdy': {
    emoji: '🔨',
    color: '#6d4c41',
    glowColor: '#8d6e63',
    description: 'Well-crafted basics',
    marketValue: 100,
    tier: 2,
  },
  'Refined': {
    emoji: '✨',
    color: '#5d4037',
    glowColor: '#795548',
    description: 'Elegant craftsmanship',
    marketValue: 200,
    tier: 3,
  },
  'Noble': {
    emoji: '👑',
    color: '#4a148c',
    glowColor: '#6a1b9a',
    description: 'Fit for royalty',
    marketValue: 400,
    tier: 4,
  },
  'Heirloom': {
    emoji: '💎',
    color: '#1565c0',
    glowColor: '#1976d2',
    description: 'Treasured antique',
    marketValue: 800,
    tier: 5,
  },
  'Exquisite': {
    emoji: '🌟',
    color: '#c2185b',
    glowColor: '#d81b60',
    description: 'Masterful artistry',
    marketValue: 1600,
    tier: 6,
  },
  'Masterwork': {
    emoji: '🏺',
    color: '#ffd700',
    glowColor: '#ffeb3b',
    description: 'Legendary creation',
    marketValue: 3200,
    tier: 7,
  },
};

// Expanded furniture templates - 50+ unique items!
export const FURNITURE_TEMPLATES: Record<string, {
  name: string;
  category: FurnitureCategory;
  modelId: string;
  baseEmoji: string;
  description: string;
}> = {
  // OUTDOOR (15 items)
  'wooden_bench': { name: 'Wooden Bench', category: 'Outdoor', modelId: 'bench_1', baseEmoji: '🪑', description: 'Simple resting spot' },
  'stone_bench': { name: 'Stone Bench', category: 'Outdoor', modelId: 'bench_2', baseEmoji: '🪨', description: 'Durable stone seating' },
  'picnic_table': { name: 'Picnic Table', category: 'Outdoor', modelId: 'table_1', baseEmoji: '🍽️', description: 'Perfect for outdoor meals' },
  'park_bench': { name: 'Park Bench', category: 'Outdoor', modelId: 'bench_3', baseEmoji: '🏞️', description: 'Classic park seating' },
  'wooden_chair': { name: 'Garden Chair', category: 'Outdoor', modelId: 'chair_1', baseEmoji: '🪑', description: 'Comfortable chair' },
  'hammock': { name: 'Forest Hammock', category: 'Outdoor', modelId: 'hammock_1', baseEmoji: '🌴', description: 'Relaxing swing' },
  'wooden_fence': { name: 'Wooden Fence', category: 'Outdoor', modelId: 'fence_1', baseEmoji: '🚧', description: 'Property boundary' },
  'stone_fence': { name: 'Stone Fence', category: 'Outdoor', modelId: 'fence_2', baseEmoji: '🧱', description: 'Sturdy barrier' },
  'garden_gate': { name: 'Garden Gate', category: 'Outdoor', modelId: 'gate_1', baseEmoji: '🚪', description: 'Entry point' },
  'wooden_bridge': { name: 'Wooden Bridge', category: 'Outdoor', modelId: 'bridge_1', baseEmoji: '🌉', description: 'Cross over water' },
  'stone_bridge': { name: 'Stone Bridge', category: 'Outdoor', modelId: 'bridge_2', baseEmoji: '🌉', description: 'Arched crossing' },
  'stepping_stones': { name: 'Stepping Stones', category: 'Outdoor', modelId: 'stones_1', baseEmoji: '🪨', description: 'Natural path' },
  'wooden_deck': { name: 'Wooden Deck', category: 'Outdoor', modelId: 'deck_1', baseEmoji: '🏗️', description: 'Elevated platform' },
  'garden_arch': { name: 'Garden Arch', category: 'Outdoor', modelId: 'arch_1', baseEmoji: '🏛️', description: 'Decorative passage' },
  'pergola': { name: 'Garden Pergola', category: 'Outdoor', modelId: 'pergola_1', baseEmoji: '🏛️', description: 'Shaded structure' },
  
  // DECORATIVE (20 items)
  'lantern': { name: 'Forest Lantern', category: 'Decorative', modelId: 'lantern_1', baseEmoji: '🏮', description: 'Warm glowing light' },
  'torch': { name: 'Garden Torch', category: 'Decorative', modelId: 'torch_1', baseEmoji: '🔥', description: 'Flickering flame' },
  'crystal_lamp': { name: 'Crystal Lamp', category: 'Decorative', modelId: 'lamp_1', baseEmoji: '💡', description: 'Magical illumination' },
  'street_lamp': { name: 'Street Lamp', category: 'Decorative', modelId: 'lamp_2', baseEmoji: '🕯️', description: 'Classic lighting' },
  'fairy_lights': { name: 'Fairy Lights', category: 'Decorative', modelId: 'lights_1', baseEmoji: '✨', description: 'Twinkling string lights' },
  'flower_pot': { name: 'Flower Pot', category: 'Decorative', modelId: 'pot_1', baseEmoji: '🌸', description: 'Colorful blooms' },
  'planter_box': { name: 'Planter Box', category: 'Decorative', modelId: 'planter_1', baseEmoji: '🌱', description: 'Raised garden bed' },
  'hanging_basket': { name: 'Hanging Basket', category: 'Decorative', modelId: 'basket_1', baseEmoji: '🪴', description: 'Suspended flowers' },
  'garden_gnome': { name: 'Garden Gnome', category: 'Decorative', modelId: 'gnome_1', baseEmoji: '🧙', description: 'Whimsical guardian' },
  'bird_bath': { name: 'Bird Bath', category: 'Decorative', modelId: 'bath_1', baseEmoji: '🛁', description: 'For feathered friends' },
  'bird_house': { name: 'Bird House', category: 'Decorative', modelId: 'house_1', baseEmoji: '🏠', description: 'Nesting spot' },
  'wind_chime': { name: 'Wind Chime', category: 'Decorative', modelId: 'chime_1', baseEmoji: '🎐', description: 'Musical decoration' },
  'garden_sign': { name: 'Garden Sign', category: 'Decorative', modelId: 'sign_1', baseEmoji: '🪧', description: 'Wooden marker' },
  'flag_post': { name: 'Flag Post', category: 'Decorative', modelId: 'flag_1', baseEmoji: '🚩', description: 'Colorful banner' },
  'statue': { name: 'Forest Statue', category: 'Decorative', modelId: 'statue_1', baseEmoji: '🗿', description: 'Stone monument' },
  'fountain': { name: 'Water Fountain', category: 'Decorative', modelId: 'fountain_1', baseEmoji: '⛲', description: 'Flowing water' },
  'sundial': { name: 'Sundial', category: 'Decorative', modelId: 'sundial_1', baseEmoji: '🕐', description: 'Time keeper' },
  'garden_mirror': { name: 'Garden Mirror', category: 'Decorative', modelId: 'mirror_1', baseEmoji: '🪞', description: 'Reflective art' },
  'decorative_urn': { name: 'Decorative Urn', category: 'Decorative', modelId: 'urn_1', baseEmoji: '🏺', description: 'Ancient vessel' },
  'totem_pole': { name: 'Totem Pole', category: 'Decorative', modelId: 'totem_1', baseEmoji: '🗿', description: 'Tribal art' },
  
  // STRUCTURES (10 items)
  'gazebo': { name: 'Forest Gazebo', category: 'Structures', modelId: 'gazebo_1', baseEmoji: '🏠', description: 'Covered shelter' },
  'shed': { name: 'Garden Shed', category: 'Structures', modelId: 'shed_1', baseEmoji: '🏚️', description: 'Tool storage' },
  'greenhouse': { name: 'Greenhouse', category: 'Structures', modelId: 'greenhouse_1', baseEmoji: '🪟', description: 'Plant sanctuary' },
  'treehouse': { name: 'Treehouse', category: 'Structures', modelId: 'treehouse_1', baseEmoji: '🏡', description: 'Elevated retreat' },
  'well': { name: 'Stone Well', category: 'Structures', modelId: 'well_1', baseEmoji: '🪣', description: 'Water source' },
  'archway': { name: 'Stone Archway', category: 'Structures', modelId: 'archway_1', baseEmoji: '🏛️', description: 'Grand entrance' },
  'pavilion': { name: 'Garden Pavilion', category: 'Structures', modelId: 'pavilion_1', baseEmoji: '⛺', description: 'Open shelter' },
  'tower': { name: 'Watch Tower', category: 'Structures', modelId: 'tower_1', baseEmoji: '🗼', description: 'Observation point' },
  'shrine': { name: 'Forest Shrine', category: 'Structures', modelId: 'shrine_1', baseEmoji: '⛩️', description: 'Sacred space' },
  'kiosk': { name: 'Garden Kiosk', category: 'Structures', modelId: 'kiosk_1', baseEmoji: '🏪', description: 'Small building' },
  
  // NATURAL (10 items)
  'bush': { name: 'Decorative Bush', category: 'Natural', modelId: 'bush_1', baseEmoji: '🌿', description: 'Lush greenery' },
  'rock_garden': { name: 'Rock Garden', category: 'Natural', modelId: 'rocks_1', baseEmoji: '⛰️', description: 'Stone arrangement' },
  'mushroom_circle': { name: 'Mushroom Circle', category: 'Natural', modelId: 'mushroom_1', baseEmoji: '🍄', description: 'Fairy ring' },
  'log_pile': { name: 'Log Pile', category: 'Natural', modelId: 'logs_1', baseEmoji: '🪵', description: 'Stacked wood' },
  'boulder': { name: 'Large Boulder', category: 'Natural', modelId: 'boulder_1', baseEmoji: '🪨', description: 'Natural stone' },
  'stump': { name: 'Tree Stump', category: 'Natural', modelId: 'stump_1', baseEmoji: '🪵', description: 'Rustic seat' },
  'flower_bed': { name: 'Flower Bed', category: 'Natural', modelId: 'flowerbed_1', baseEmoji: '🌺', description: 'Garden patch' },
  'herb_garden': { name: 'Herb Garden', category: 'Natural', modelId: 'herbs_1', baseEmoji: '🌿', description: 'Aromatic plants' },
  'bamboo_grove': { name: 'Bamboo Grove', category: 'Natural', modelId: 'bamboo_1', baseEmoji: '🎋', description: 'Tall grass' },
  'lily_pad': { name: 'Lily Pads', category: 'Natural', modelId: 'lily_1', baseEmoji: '🪷', description: 'Floating plants' },
};

// Pack definitions with different drop rates
export const FURNITURE_PACK_DEFINITIONS: Record<FurniturePackType, FurniturePackDefinition> = {
  Basic: {
    type: 'Basic',
    name: 'Basic Furniture Pack',
    cost: 25, // 25 Building Logs
    itemCount: 3,
    description: 'Simple furniture pieces',
    emoji: '📦',
    dropRates: {
      'Rough': 0.45,
      'Sturdy': 0.30,
      'Refined': 0.15,
      'Noble': 0.07,
      'Heirloom': 0.02,
      'Exquisite': 0.01,
      'Masterwork': 0.00,
    },
  },
  Premium: {
    type: 'Premium',
    name: 'Premium Furniture Pack',
    cost: 60, // 60 Building Logs
    itemCount: 5,
    description: 'Better odds for rare furniture',
    emoji: '🎁',
    dropRates: {
      'Rough': 0.25,
      'Sturdy': 0.30,
      'Refined': 0.20,
      'Noble': 0.15,
      'Heirloom': 0.07,
      'Exquisite': 0.02,
      'Masterwork': 0.01,
    },
  },
  Limited: {
    type: 'Limited',
    name: 'Limited Edition Pack',
    cost: 120, // 120 Building Logs
    itemCount: 7,
    description: 'Exclusive pack with boosted legendary rates',
    emoji: '🌟',
    isLimited: true,
    limitedUntil: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
    dropRates: {
      'Rough': 0.15,
      'Sturdy': 0.20,
      'Refined': 0.20,
      'Noble': 0.20,
      'Heirloom': 0.15,
      'Exquisite': 0.08,
      'Masterwork': 0.02,
    },
  },
};

/**
 * Roll a random furniture rarity based on weighted probabilities
 */
export function rollFurnitureRarity(dropRates: Record<FurnitureRarity, number>): FurnitureRarity {
  const random = Math.random();
  let cumulative = 0;
  
  for (const rarity of Object.keys(dropRates) as FurnitureRarity[]) {
    cumulative += dropRates[rarity];
    if (random <= cumulative) {
      return rarity;
    }
  }
  
  // Fallback to Rough (should never happen with proper rates)
  return 'Rough';
}

/**
 * Get a random furniture template
 */
function getRandomFurnitureTemplate(): { id: string; template: typeof FURNITURE_TEMPLATES[string] } {
  const templateIds = Object.keys(FURNITURE_TEMPLATES);
  const randomId = templateIds[Math.floor(Math.random() * templateIds.length)];
  const template = FURNITURE_TEMPLATES[randomId];
  
  // Validation: ensure template exists
  if (!template) {
    console.error('⚠️ Invalid template ID:', randomId);
    // Fallback to first template
    const fallbackId = templateIds[0];
    return { id: fallbackId, template: FURNITURE_TEMPLATES[fallbackId] };
  }
  
  return { id: randomId, template };
}

/**
 * Generate a furniture name based on rarity and template
 */
function generateFurnitureName(rarity: FurnitureRarity, baseName: string): string {
  const prefixes: Record<FurnitureRarity, string[]> = {
    'Rough': ['Basic', 'Simple', 'Plain', 'Common'],
    'Sturdy': ['Solid', 'Durable', 'Reliable', 'Strong'],
    'Refined': ['Elegant', 'Polished', 'Fine', 'Graceful'],
    'Noble': ['Royal', 'Majestic', 'Grand', 'Regal'],
    'Heirloom': ['Ancient', 'Ancestral', 'Timeless', 'Legendary'],
    'Exquisite': ['Divine', 'Perfect', 'Flawless', 'Supreme'],
    'Masterwork': ['Mythical', 'Celestial', 'Ultimate', 'Transcendent'],
  };
  
  const prefix = prefixes[rarity][Math.floor(Math.random() * prefixes[rarity].length)];
  return `${prefix} ${baseName}`;
}

/**
 * Open a furniture pack and return the rolled furniture items
 * WITH CRASH PREVENTION AND VALIDATION
 */
export function openFurniturePack(packType: FurniturePackType, isLimited: boolean = false): FurnitureData[] {
  try {
    const pack = FURNITURE_PACK_DEFINITIONS[packType];
    const furniture: FurnitureData[] = [];
    
    if (!pack) {
      console.error('❌ Invalid pack type:', packType);
      return [];
    }
    
    console.log(`📦 Opening ${packType} pack - generating ${pack.itemCount} items...`);
    
    for (let i = 0; i < pack.itemCount; i++) {
      try {
        const rarity = rollFurnitureRarity(pack.dropRates);
        const { id: templateId, template } = getRandomFurnitureTemplate();
        
        // VALIDATION: Ensure all required fields exist
        if (!template || !template.name || !template.category || !template.modelId) {
          console.error('⚠️ Invalid template data:', { templateId, template });
          continue; // Skip this item instead of crashing
        }
        
        const furnitureItem: FurnitureData = {
          id: 'furniture_' + Date.now() + '_' + i + '_' + Math.random().toString(36).substr(2, 9),
          name: generateFurnitureName(rarity, template.name),
          rarity,
          category: template.category,
          modelId: template.modelId,
          obtainedAt: Date.now(),
          placed: false,
          fromLimitedPack: isLimited,
        };
        
        // Final validation before adding
        if (furnitureItem.id && furnitureItem.name && furnitureItem.rarity && furnitureItem.category && furnitureItem.modelId) {
          furniture.push(furnitureItem);
          console.log(`✅ Generated: ${furnitureItem.name} (${rarity}) - ${template.category}`);
        } else {
          console.error('⚠️ Invalid furniture item generated:', furnitureItem);
        }
      } catch (itemError) {
        console.error('❌ Error generating furniture item:', itemError);
        // Continue to next item instead of crashing entire pack
        continue;
      }
    }
    
    console.log(`✅ Pack opened successfully! Got ${furniture.length} valid items`);
    return furniture;
  } catch (error) {
    console.error('❌ Critical error opening furniture pack:', error);
    // Return empty array instead of crashing
    return [];
  }
}

/**
 * Get furniture pack state from localStorage
 */
export function loadFurniturePackState(): FurniturePackState | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const data = localStorage.getItem('ecoforest_furniture_packs');
    if (!data) return null;
    
    const state = JSON.parse(data) as FurniturePackState;
    
    // Validate structure
    if (!state || typeof state !== 'object') return null;
    if (!Array.isArray(state.ownedFurniture)) return null;
    
    return state;
  } catch (error) {
    console.error('Failed to load furniture pack state:', error);
    return null;
  }
}

/**
 * Save furniture pack state to localStorage
 */
export function saveFurniturePackState(state: FurniturePackState): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('ecoforest_furniture_packs', JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save furniture pack state:', error);
  }
}

/**
 * Initialize furniture pack state (first time setup)
 */
export function initializeFurniturePackState(): FurniturePackState {
  const state: FurniturePackState = {
    ownedFurniture: [],
    packsOpened: 0,
    totalFurnitureObtained: 0,
    lastPackOpenedAt: null,
  };
  
  saveFurniturePackState(state);
  return state;
}

/**
 * Check if pack is currently limited-time available
 */
export function isPackAvailable(packType: FurniturePackType): boolean {
  const pack = FURNITURE_PACK_DEFINITIONS[packType];
  
  if (!pack.isLimited) return true;
  if (!pack.limitedUntil) return true;
  
  return Date.now() < pack.limitedUntil;
}

/**
 * Get time remaining for limited packs in human-readable format
 */
export function getLimitedPackTimeRemaining(packType: FurniturePackType): string {
  const pack = FURNITURE_PACK_DEFINITIONS[packType];
  
  if (!pack.isLimited || !pack.limitedUntil) return '';
  
  const msRemaining = pack.limitedUntil - Date.now();
  if (msRemaining <= 0) return 'Expired';
  
  const daysRemaining = Math.floor(msRemaining / (1000 * 60 * 60 * 24));
  const hoursRemaining = Math.floor((msRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (daysRemaining > 0) {
    return `${daysRemaining}d ${hoursRemaining}h`;
  }
  return `${hoursRemaining}h`;
}
