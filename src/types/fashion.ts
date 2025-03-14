
export interface WardrobeItem {
  id: string;
  name: string;
  category: 'head' | 'face' | 'neck' | 'body' | 'feet' | 'extras';
  image: string;
  unlocked: boolean;
  pixelSize: { width: number; height: number };
  position: { x: number; y: number };
}

export interface EquippedItem extends WardrobeItem {
  position: { x: number; y: number };
}

export interface WardrobeCategory {
  id: string;
  name: string;
  items: WardrobeItem[];
}

export const ANCHOR_POINTS = {
  head: { x: 0, y: -10 },
  face: { x: 0, y: 0 },
  neck: { x: 0, y: 5 },
  body: { x: 0, y: 0 },
  feet: { x: 0, y: 12 },
  extras: { x: 0, y: 0 },
};

export const generatePixelArt = (
  colors: string[], 
  size: { width: number; height: number },
  pattern: string[]
): string => {
  const canvas = document.createElement('canvas');
  canvas.width = size.width;
  canvas.height = size.height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  
  // Set transparent background
  ctx.clearRect(0, 0, size.width, size.height);
  
  // Draw pixel art based on pattern
  const pixelSize = 1;
  pattern.forEach((row, y) => {
    [...row].forEach((char, x) => {
      if (char !== ' ' && char !== '.') {
        const colorIndex = parseInt(char, 10) - 1;
        if (colorIndex >= 0 && colorIndex < colors.length) {
          ctx.fillStyle = colors[colorIndex];
          ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
        }
      }
    });
  });
  
  return canvas.toDataURL();
};

// Utility for creating SVG pixel art from patterns
export const createPixelSvg = (
  colors: string[],
  pattern: string[],
  scale: number = 1
): string => {
  const width = pattern[0].length;
  const height = pattern.length;
  let svgContent = '';

  // Create SVG pixels
  pattern.forEach((row, y) => {
    [...row].forEach((char, x) => {
      if (char !== ' ' && char !== '.') {
        const colorIndex = parseInt(char, 10) - 1;
        if (colorIndex >= 0 && colorIndex < colors.length) {
          svgContent += `<rect x="${x}" y="${y}" width="1" height="1" fill="${colors[colorIndex]}" />`;
        }
      }
    });
  });

  // Wrap in SVG tag
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width * scale}" height="${height * scale}" viewBox="0 0 ${width} ${height}">
    ${svgContent}
  </svg>`;
};

// Define some sample items
export const WARDROBE_DATA: WardrobeCategory[] = [
  {
    id: 'headwear',
    name: 'Headwear',
    items: [
      {
        id: 'baseball-cap',
        name: 'Baseball Cap',
        category: 'head',
        image: 'data:image/svg+xml,' + encodeURIComponent(createPixelSvg(
          ['#e53935', '#ffffff', '#333333'],
          [
            '......11111.......',
            '.....1111111......',
            '....111111111.....',
            '...11111111113....',
            '..3333333333333...',
            '.333333333333333..',
            '33333222222233333.',
            '3333222222222333..',
            '.................'
          ]
        )),
        unlocked: true,
        pixelSize: { width: 24, height: 9 },
        position: { x: 0, y: 0 }
      },
      {
        id: 'tiara',
        name: 'Tiara',
        category: 'head',
        image: 'data:image/svg+xml,' + encodeURIComponent(createPixelSvg(
          ['#ffd700', '#ff69b4', '#ffffff'],
          [
            '..333................',
            '.31113...............',
            '3111113..............',
            '3122113..............'
          ]
        )),
        unlocked: true,
        pixelSize: { width: 24, height: 4 },
        position: { x: 0, y: 0 }
      },
      {
        id: 'propeller-hat',
        name: 'Propeller Hat',
        category: 'head',
        image: 'data:image/svg+xml,' + encodeURIComponent(createPixelSvg(
          ['#3498db', '#e74c3c', '#2ecc71', '#333333'],
          [
            '......2442......',
            '......4224......',
            '.......44.......',
            '.......44.......',
            '.....111111.....',
            '....11111111....',
            '....13131311....',
            '....11111111....'
          ]
        )),
        unlocked: false,
        pixelSize: { width: 24, height: 8 },
        position: { x: 0, y: 0 }
      },
      {
        id: 'cat-ears',
        name: 'Cat Ears',
        category: 'head',
        image: 'data:image/svg+xml,' + encodeURIComponent(createPixelSvg(
          ['#333333', '#ff69b4', '#ffffff'],
          [
            '1.....1............',
            '11...11............',
            '121.121............',
            '.121121............'
          ]
        )),
        unlocked: true,
        pixelSize: { width: 24, height: 4 },
        position: { x: 0, y: 0 }
      }
    ]
  },
  {
    id: 'accessories',
    name: 'Accessories',
    items: [
      {
        id: 'neon-glasses',
        name: 'Neon Glasses',
        category: 'face',
        image: 'data:image/svg+xml,' + encodeURIComponent(createPixelSvg(
          ['#333333', '#00ffff', '#ffffff'],
          [
            '111...111..........',
            '122...221..........',
            '111...111..........'
          ]
        )),
        unlocked: true,
        pixelSize: { width: 24, height: 3 },
        position: { x: 0, y: 0 }
      },
      {
        id: 'scarf',
        name: 'Scarf',
        category: 'neck',
        image: 'data:image/svg+xml,' + encodeURIComponent(createPixelSvg(
          ['#e74c3c', '#c0392b', '#ffffff', '#ecf0f1'],
          [
            '11111111..........',
            '13131331..........',
            '11111111.....4444.'
          ]
        )),
        unlocked: true,
        pixelSize: { width: 24, height: 3 },
        position: { x: 0, y: 0 }
      },
      {
        id: 'bow-tie',
        name: 'Bow Tie',
        category: 'neck',
        image: 'data:image/svg+xml,' + encodeURIComponent(createPixelSvg(
          ['#e74c3c', '#c0392b', '#ffffff'],
          [
            '11...11............',
            '.11111.............',
            '11...11............'
          ]
        )),
        unlocked: false,
        pixelSize: { width: 24, height: 3 },
        position: { x: 0, y: 0 }
      }
    ]
  },
  {
    id: 'body',
    name: 'Body Items',
    items: [
      {
        id: 'cape',
        name: 'Cape',
        category: 'body',
        image: 'data:image/svg+xml,' + encodeURIComponent(createPixelSvg(
          ['#3498db', '#2980b9', '#1f3a93'],
          [
            '111111111111........',
            '111111111111........',
            '111111111111........',
            '111111111111........',
            '.1111111111.........',
            '..11111111..........',
            '...111111...........',
            '....1111............',
            '.....11.............'
          ]
        )),
        unlocked: true,
        pixelSize: { width: 24, height: 9 },
        position: { x: 0, y: 0 }
      },
      {
        id: 'suspenders',
        name: 'Suspenders',
        category: 'body',
        image: 'data:image/svg+xml,' + encodeURIComponent(createPixelSvg(
          ['#e74c3c', '#c0392b', '#333333', '#7f8c8d'],
          [
            '1....1.............',
            '1....1.............',
            '1....1.............',
            '1....1.............',
            '.1..1..............',
            '..33...............',
            '.3443..............'
          ]
        )),
        unlocked: true,
        pixelSize: { width: 24, height: 7 },
        position: { x: 0, y: 0 }
      },
      {
        id: 'hero-belt',
        name: 'Hero Belt',
        category: 'body',
        image: 'data:image/svg+xml,' + encodeURIComponent(createPixelSvg(
          ['#ffd700', '#f39c12', '#2c3e50'],
          [
            '111111.............',
            '121121.............'
          ]
        )),
        unlocked: false,
        pixelSize: { width: 24, height: 2 },
        position: { x: 0, y: 0 }
      }
    ]
  },
  {
    id: 'footwear',
    name: 'Footwear',
    items: [
      {
        id: 'rain-boots',
        name: 'Rain Boots',
        category: 'feet',
        image: 'data:image/svg+xml,' + encodeURIComponent(createPixelSvg(
          ['#f1c40f', '#f39c12', '#7f8c8d', '#333333'],
          [
            '11..11..............',
            '13..31..............',
            '11..11..............',
            '11..11..............'
          ]
        )),
        unlocked: true,
        pixelSize: { width: 24, height: 4 },
        position: { x: 0, y: 0 }
      },
      {
        id: 'skates',
        name: 'Skates',
        category: 'feet',
        image: 'data:image/svg+xml,' + encodeURIComponent(createPixelSvg(
          ['#333333', '#7f8c8d', '#e74c3c', '#ffffff'],
          [
            '111..111............',
            '424..424............',
            '.11..11.............'
          ]
        )),
        unlocked: false,
        pixelSize: { width: 24, height: 3 },
        position: { x: 0, y: 0 }
      }
    ]
  },
  {
    id: 'extras',
    name: 'Fun Extras',
    items: [
      {
        id: 'jetpack',
        name: 'Jetpack',
        category: 'extras',
        image: 'data:image/svg+xml,' + encodeURIComponent(createPixelSvg(
          ['#7f8c8d', '#95a5a6', '#e74c3c', '#f39c12'],
          [
            '11..11.............',
            '12..21.............',
            '12..21.............',
            '12..21.............',
            '12..21.............',
            '12..21.............',
            '12..21.............',
            '13..31.............'
          ]
        )),
        unlocked: true,
        pixelSize: { width: 24, height: 8 },
        position: { x: 0, y: 0 }
      },
      {
        id: 'halo',
        name: 'Halo',
        category: 'extras',
        image: 'data:image/svg+xml,' + encodeURIComponent(createPixelSvg(
          ['#ffd700', '#f39c12', '#ffffff'],
          [
            '...333333333.......',
            '.33111111133.......',
            '3311111111133......',
            '3311.......133.....',
            '331.........33.....',
            '33............3....'
          ]
        )),
        unlocked: false,
        pixelSize: { width: 24, height: 6 },
        position: { x: 0, y: 0 }
      },
      {
        id: 'bubble-shield',
        name: 'Bubble Shield',
        category: 'extras',
        image: 'data:image/svg+xml,' + encodeURIComponent(createPixelSvg(
          ['#3498db', '#2980b9', '#ffffff'],
          [
            '....111111111......',
            '..111.......11.....',
            '.11...........1....',
            '.1.............1...',
            '1...............1..',
            '1...............1..',
            '1...............1..',
            '.1.............1...',
            '.11...........1....',
            '..111.......11.....',
            '....111111111......'
          ]
        )),
        unlocked: true,
        pixelSize: { width: 24, height: 11 },
        position: { x: 0, y: 0 }
      }
    ]
  }
];
