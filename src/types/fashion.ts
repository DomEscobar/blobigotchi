
export type ItemType = 'headwear' | 'accessory' | 'body' | 'footwear' | 'effect';
export type ItemPosition = 'head' | 'neck' | 'back' | 'feet' | 'effect';

export type ItemCategory = {
  id: string;
  name: string;
  position: ItemPosition;
}

export type ClothingItem = {
  id: string;
  name: string;
  type: ItemType;
  position: ItemPosition;
  imageUrl: string;
  colors: string[];
  unlocked: boolean;
  gridSize: {
    width: number;
    height: number;
  };
  requiresLevel?: number;
  specialEffect?: 'glow' | 'animate' | 'pulse';
};

export type EquippedItems = {
  [key in ItemPosition]?: ClothingItem;
};
