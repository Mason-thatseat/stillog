import type { BlockType, ShapeType } from './types';

export interface BlockDefinition {
  type: BlockType;
  category: 'structure' | 'furniture' | 'decor';
  label: string;
  defaultWidth: number;
  defaultHeight: number;
  defaultFill: string;
  defaultStroke: string;
  createsSeat: boolean;
  minWidth: number;
  minHeight: number;
}

export const BLOCK_REGISTRY: Record<BlockType, BlockDefinition> = {
  block_wall: {
    type: 'block_wall',
    category: 'structure',
    label: '벽',
    defaultWidth: 20,
    defaultHeight: 3,
    defaultFill: '#5C4033',
    defaultStroke: '#3D2B1F',
    createsSeat: false,
    minWidth: 3,
    minHeight: 2,
  },
  block_floor: {
    type: 'block_floor',
    category: 'structure',
    label: '바닥',
    defaultWidth: 40,
    defaultHeight: 40,
    defaultFill: '#FFF8F0',
    defaultStroke: '#D4C4B5',
    createsSeat: false,
    minWidth: 10,
    minHeight: 10,
  },
  block_window: {
    type: 'block_window',
    category: 'structure',
    label: '창문',
    defaultWidth: 15,
    defaultHeight: 3,
    defaultFill: '#D5E8F0',
    defaultStroke: '#8BB8CC',
    createsSeat: false,
    minWidth: 3,
    minHeight: 2,
  },
  block_table_rect: {
    type: 'block_table_rect',
    category: 'furniture',
    label: '테이블',
    defaultWidth: 14,
    defaultHeight: 10,
    defaultFill: '#F5E6D3',
    defaultStroke: '#A78B71',
    createsSeat: true,
    minWidth: 6,
    minHeight: 5,
  },
  block_table_round: {
    type: 'block_table_round',
    category: 'furniture',
    label: '원형테이블',
    defaultWidth: 10,
    defaultHeight: 10,
    defaultFill: '#F5E6D3',
    defaultStroke: '#A78B71',
    createsSeat: true,
    minWidth: 5,
    minHeight: 5,
  },
  block_chair: {
    type: 'block_chair',
    category: 'furniture',
    label: '의자',
    defaultWidth: 5,
    defaultHeight: 5,
    defaultFill: '#D4C4B5',
    defaultStroke: '#8B7355',
    createsSeat: true,
    minWidth: 3,
    minHeight: 3,
  },
  block_sofa: {
    type: 'block_sofa',
    category: 'furniture',
    label: '소파',
    defaultWidth: 16,
    defaultHeight: 8,
    defaultFill: '#C9A882',
    defaultStroke: '#8B7355',
    createsSeat: true,
    minWidth: 8,
    minHeight: 5,
  },
  block_plant: {
    type: 'block_plant',
    category: 'decor',
    label: '식물',
    defaultWidth: 6,
    defaultHeight: 6,
    defaultFill: '#A8C686',
    defaultStroke: '#6B8E4E',
    createsSeat: false,
    minWidth: 3,
    minHeight: 3,
  },
};

export const BLOCK_CATEGORIES: Array<{ id: string; label: string; types: BlockType[] }> = [
  {
    id: 'structure',
    label: '구조',
    types: ['block_wall', 'block_floor', 'block_window'],
  },
  {
    id: 'furniture',
    label: '가구',
    types: ['block_table_rect', 'block_table_round', 'block_chair', 'block_sofa'],
  },
  {
    id: 'decor',
    label: '장식',
    types: ['block_plant'],
  },
];

export function isBlockType(type: ShapeType): type is BlockType {
  return type.startsWith('block_');
}

export function isSeatBlock(type: ShapeType): boolean {
  if (!isBlockType(type)) return false;
  return BLOCK_REGISTRY[type].createsSeat;
}
