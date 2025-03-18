import { BlobType } from "@/hooks/useBlobAppearance";

export type AttackCategory = "physical" | "special" | "status";

export interface Attack {
  id: string;
  name: string;
  type: BlobType;
  category: AttackCategory;
  basePower: number;
  accuracy: number;
  description: string;
  icon: string; // Emoji representation
  effectDescription?: string;
  animation?: string; // CSS animation class
}

const attacks: Attack[] = [
  // Fire type attacks
  {
    id: "fireball",
    name: "Fireball",
    type: "fire",
    category: "special",
    basePower: 75,
    accuracy: 95,
    description: "A burning ball of fire hurled at the opponent",
    icon: "🔥",
    animation: "animate-fire-attack"
  },
  {
    id: "flamethrower",
    name: "Flamethrower",
    type: "fire",
    category: "special",
    basePower: 90,
    accuracy: 100,
    description: "A powerful stream of flames engulfs the opponent",
    icon: "🔥",
    animation: "animate-fire-stream"
  },
  {
    id: "fire_spin",
    name: "Fire Spin",
    type: "fire",
    category: "special",
    basePower: 60,
    accuracy: 85,
    description: "Traps the opponent in a vortex of flames for several turns",
    icon: "🌀",
    effectDescription: "Opponent takes damage for 2-5 turns and cannot escape",
    animation: "animate-fire-spin"
  },
  
  // Water type attacks
  {
    id: "watergun",
    name: "Water Gun",
    type: "water",
    category: "special",
    basePower: 40,
    accuracy: 100,
    description: "A jet of water sprayed at high velocity",
    icon: "💦",
    animation: "animate-water-gun"
  },
  {
    id: "hydro_pump",
    name: "Hydro Pump",
    type: "water",
    category: "special",
    basePower: 110,
    accuracy: 80,
    description: "A powerful blast of water launched at high pressure",
    icon: "💦",
    animation: "animate-hydro-pump"
  },
  {
    id: "aqua_jet",
    name: "Aqua Jet",
    type: "water",
    category: "physical",
    basePower: 40,
    accuracy: 100,
    description: "A quick attack that always strikes first",
    icon: "💨",
    effectDescription: "Always moves first",
    animation: "animate-aqua-jet"
  },
  
  // Electric type attacks
  {
    id: "thunderbolt",
    name: "Thunderbolt",
    type: "electric",
    category: "special",
    basePower: 90,
    accuracy: 100,
    description: "A strong electric shock that may paralyze",
    icon: "⚡",
    effectDescription: "10% chance to paralyze the opponent",
    animation: "animate-thunderbolt"
  },
  {
    id: "thunder_shock",
    name: "Thunder Shock",
    type: "electric",
    category: "special",
    basePower: 40,
    accuracy: 100,
    description: "An electrical attack that may paralyze",
    icon: "⚡",
    effectDescription: "10% chance to paralyze the opponent",
    animation: "animate-thunder-shock"
  },
  {
    id: "volt_tackle",
    name: "Volt Tackle",
    type: "electric",
    category: "physical",
    basePower: 120,
    accuracy: 100,
    description: "A powerful tackle charged with electricity that also damages the user",
    icon: "⚡",
    effectDescription: "User takes 33% of the damage dealt as recoil",
    animation: "animate-volt-tackle"
  },
  
  // Grass type attacks
  {
    id: "leafblade",
    name: "Leaf Blade",
    type: "grass",
    category: "physical",
    basePower: 90,
    accuracy: 100,
    description: "Sharp-edged leaves slice the opponent",
    icon: "🌿",
    animation: "animate-leaf-blade"
  },
  {
    id: "solar_beam",
    name: "Solar Beam",
    type: "grass",
    category: "special",
    basePower: 120,
    accuracy: 100,
    description: "Gathers light energy, then blasts a beam on the next turn",
    icon: "☀️",
    effectDescription: "Charges on first turn, attacks on second",
    animation: "animate-solar-beam"
  },
  {
    id: "seed_bomb",
    name: "Seed Bomb",
    type: "grass",
    category: "physical",
    basePower: 80,
    accuracy: 100,
    description: "Hard-shelled seeds are hurled at the opponent",
    icon: "🌱",
    animation: "animate-seed-bomb"
  },
  
  // Ice type attacks
  {
    id: "icebeam",
    name: "Ice Beam",
    type: "ice",
    category: "special",
    basePower: 90,
    accuracy: 100,
    description: "Fires a beam of freezing energy that may freeze the opponent",
    icon: "❄️",
    effectDescription: "10% chance to freeze the opponent",
    animation: "animate-ice-beam"
  },
  {
    id: "blizzard",
    name: "Blizzard",
    type: "ice",
    category: "special",
    basePower: 110,
    accuracy: 70,
    description: "A howling blizzard that may freeze the opponent",
    icon: "🌨️",
    effectDescription: "10% chance to freeze the opponent",
    animation: "animate-blizzard"
  },
  {
    id: "ice_shard",
    name: "Ice Shard",
    type: "ice",
    category: "physical",
    basePower: 40,
    accuracy: 100,
    description: "A fast attack that always strikes first",
    icon: "🧊",
    effectDescription: "Always moves first",
    animation: "animate-ice-shard"
  },
  
  // Fighting type attacks
  {
    id: "dynamic_punch",
    name: "Dynamic Punch",
    type: "fighting",
    category: "physical",
    basePower: 100,
    accuracy: 50,
    description: "A powerful punch that confuses if it hits",
    icon: "👊",
    effectDescription: "100% chance to confuse if it hits",
    animation: "animate-dynamic-punch"
  },
  {
    id: "close_combat",
    name: "Close Combat",
    type: "fighting",
    category: "physical",
    basePower: 120,
    accuracy: 100,
    description: "A full-power attack that lowers the user's defenses",
    icon: "👊",
    effectDescription: "Lowers user's defense and special defense",
    animation: "animate-close-combat"
  },
  {
    id: "pixel_punch",
    name: "Pixel Punch",
    type: "fighting",
    category: "physical",
    basePower: 70,
    accuracy: 100,
    description: "A blocky punch that deals solid damage",
    icon: "🎮",
    animation: "animate-pixel-punch"
  },
  
  // Poison type attacks
  {
    id: "sludge_bomb",
    name: "Sludge Bomb",
    type: "poison",
    category: "special",
    basePower: 90,
    accuracy: 100,
    description: "Hurls filthy sludge that may poison the opponent",
    icon: "☠️",
    effectDescription: "30% chance to poison the opponent",
    animation: "animate-sludge-bomb"
  },
  {
    id: "toxic",
    name: "Toxic",
    type: "poison",
    category: "status",
    basePower: 0,
    accuracy: 90,
    description: "Badly poisons the opponent, with damage increasing each turn",
    icon: "☣️",
    effectDescription: "Badly poisons the opponent",
    animation: "animate-toxic"
  },
  {
    id: "acid_spray",
    name: "Acid Spray",
    type: "poison",
    category: "special",
    basePower: 40,
    accuracy: 100,
    description: "Sprays acid that severely reduces the opponent's special defense",
    icon: "💧",
    effectDescription: "Sharply lowers opponent's special defense",
    animation: "animate-acid-spray"
  },
  
  // Ground type attacks
  {
    id: "rockthrow",
    name: "Rock Throw",
    type: "rock",
    category: "physical",
    basePower: 50,
    accuracy: 90,
    description: "Hurls hard rocks at the opponent",
    icon: "🪨",
    animation: "animate-rock-throw"
  },
  {
    id: "earthquake",
    name: "Earthquake",
    type: "ground",
    category: "physical",
    basePower: 100,
    accuracy: 100,
    description: "A powerful quake that deals massive damage",
    icon: "🌋",
    animation: "animate-earthquake"
  },
  {
    id: "sandstorm",
    name: "Sandstorm",
    type: "ground",
    category: "status",
    basePower: 0,
    accuracy: 100,
    description: "Summons a sandstorm that damages certain types over time",
    icon: "🏜️",
    effectDescription: "Creates a sandstorm that lasts for 5 turns",
    animation: "animate-sandstorm"
  },
  
  // Psychic type attacks
  {
    id: "psychicwave",
    name: "Psychic Wave",
    type: "psychic",
    category: "special",
    basePower: 90,
    accuracy: 100,
    description: "A telekinetic wave that may lower special defense",
    icon: "🔮",
    effectDescription: "10% chance to lower special defense",
    animation: "animate-psychic-wave"
  },
  {
    id: "future_sight",
    name: "Future Sight",
    type: "psychic",
    category: "special",
    basePower: 120,
    accuracy: 100,
    description: "Predicts an attack that strikes two turns later",
    icon: "👁️",
    effectDescription: "Attacks 2 turns later",
    animation: "animate-future-sight"
  },
  {
    id: "digital_dash",
    name: "Digital Dash",
    type: "psychic",
    category: "physical",
    basePower: 80,
    accuracy: 100,
    description: "A quick digital teleportation attack that confuses the opponent",
    icon: "🌐",
    effectDescription: "20% chance to confuse the opponent",
    animation: "animate-digital-dash"
  },
  
  // Ghost type attacks
  {
    id: "shadowball",
    name: "Shadow Ball",
    type: "ghost",
    category: "special",
    basePower: 80,
    accuracy: 100,
    description: "Hurls a shadowy blob that may lower special defense",
    icon: "👻",
    effectDescription: "20% chance to lower special defense",
    animation: "animate-shadow-ball"
  },
  {
    id: "phantom_force",
    name: "Phantom Force",
    type: "ghost",
    category: "physical",
    basePower: 90,
    accuracy: 100,
    description: "Disappears and attacks on the next turn, bypassing protections",
    icon: "👻",
    effectDescription: "Disappears on first turn, attacks on second, bypasses Protect",
    animation: "animate-phantom-force"
  },
  {
    id: "static_slam",
    name: "Static Slam",
    type: "ghost",
    category: "physical",
    basePower: 70,
    accuracy: 90,
    description: "A glitchy static attack that can cause paralysis",
    icon: "📺",
    effectDescription: "30% chance to paralyze",
    animation: "animate-static-slam"
  },
  
  // Normal type attacks
  {
    id: "blob_beam",
    name: "Blob Beam",
    type: "normal",
    category: "special",
    basePower: 85,
    accuracy: 100,
    description: "A colorful beam of blob energy",
    icon: "🔴",
    animation: "animate-blob-beam"
  },
  {
    id: "hyper_beam",
    name: "Hyper Beam",
    type: "normal",
    category: "special",
    basePower: 150,
    accuracy: 90,
    description: "A powerful beam that requires recharging",
    icon: "💥",
    effectDescription: "User must recharge on the next turn",
    animation: "animate-hyper-beam"
  },
  {
    id: "quick_attack",
    name: "Quick Attack",
    type: "normal",
    category: "physical",
    basePower: 40,
    accuracy: 100,
    description: "An extremely fast attack that always goes first",
    icon: "💨",
    effectDescription: "Always moves first",
    animation: "animate-quick-attack"
  }
];

export default attacks;

// Helper function to get attacks by type
export const getAttacksByType = (type: BlobType) => {
  return attacks.filter(attack => attack.type === type);
};

// Helper function to get an attack by ID
export const getAttackById = (id: string) => {
  return attacks.find(attack => attack.id === id);
};

// Helper function to get a random attack
export const getRandomAttack = () => {
  const randomIndex = Math.floor(Math.random() * attacks.length);
  return attacks[randomIndex];
};

// Helper function to get available attacks for a specific evolution level
export const getAttacksByEvolutionLevel = (level: number) => {
  // Higher evolution levels unlock more powerful attacks
  if (level <= 1) {
    // Egg level - no attacks available
    return [];
  } else if (level <= 3) {
    // Blob level - basic attacks only
    return attacks.filter(attack => attack.basePower <= 50);
  } else if (level <= 6) {
    // Baby level - medium attacks
    return attacks.filter(attack => attack.basePower <= 90);
  } else {
    // Adult level - all attacks
    return attacks;
  }
}; 