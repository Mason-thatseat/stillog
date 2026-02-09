import type { BlockType, ShapeType } from './types';

export interface BlockDefinition {
  type: BlockType;
  category: 'structure' | 'furniture' | 'facility';
  label: string;
  defaultWidth: number;
  defaultHeight: number;
  defaultFill: string;
  defaultStroke: string;
  createsSeat: boolean;
  minWidth: number;
  minHeight: number;
  dragDraw?: boolean;
}

export const BLOCK_REGISTRY: Record<BlockType, BlockDefinition> = {
  block_room: {
    type: 'block_room',
    category: 'structure',
    label: '방/공간',
    defaultWidth: 30,
    defaultHeight: 25,
    defaultFill: '#FFF8F0',
    defaultStroke: '#5C4033',
    createsSeat: false,
    minWidth: 5,
    minHeight: 5,
    dragDraw: true,
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
  block_door: {
    type: 'block_door',
    category: 'structure',
    label: '문',
    defaultWidth: 8,
    defaultHeight: 3,
    defaultFill: '#D4A574',
    defaultStroke: '#8B6914',
    createsSeat: false,
    minWidth: 3,
    minHeight: 2,
  },
  block_sliding_door: {
    type: 'block_sliding_door',
    category: 'structure',
    label: '중문',
    defaultWidth: 12,
    defaultHeight: 3,
    defaultFill: '#E8DDD3',
    defaultStroke: '#8B7355',
    createsSeat: false,
    minWidth: 4,
    minHeight: 2,
  },
  block_table_2: {
    type: 'block_table_2',
    category: 'furniture',
    label: '2인 테이블',
    defaultWidth: 8,
    defaultHeight: 8,
    defaultFill: '#F5E6D3',
    defaultStroke: '#A78B71',
    createsSeat: true,
    minWidth: 5,
    minHeight: 5,
  },
  block_table_4: {
    type: 'block_table_4',
    category: 'furniture',
    label: '4인 테이블',
    defaultWidth: 12,
    defaultHeight: 10,
    defaultFill: '#F5E6D3',
    defaultStroke: '#A78B71',
    createsSeat: true,
    minWidth: 6,
    minHeight: 5,
  },
  block_table_6: {
    type: 'block_table_6',
    category: 'furniture',
    label: '6인 테이블',
    defaultWidth: 18,
    defaultHeight: 10,
    defaultFill: '#F5E6D3',
    defaultStroke: '#A78B71',
    createsSeat: true,
    minWidth: 8,
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
  block_kitchen: {
    type: 'block_kitchen',
    category: 'facility',
    label: '주방',
    defaultWidth: 15,
    defaultHeight: 10,
    defaultFill: '#E8E8E8',
    defaultStroke: '#999999',
    createsSeat: false,
    minWidth: 6,
    minHeight: 5,
  },
  block_selfbar: {
    type: 'block_selfbar',
    category: 'facility',
    label: '셀프바',
    defaultWidth: 12,
    defaultHeight: 6,
    defaultFill: '#D4C4B5',
    defaultStroke: '#8B7355',
    createsSeat: false,
    minWidth: 5,
    minHeight: 3,
  },
  block_restroom: {
    type: 'block_restroom',
    category: 'facility',
    label: '화장실',
    defaultWidth: 12,
    defaultHeight: 10,
    defaultFill: '#E0EBF0',
    defaultStroke: '#8BAAB8',
    createsSeat: false,
    minWidth: 5,
    minHeight: 5,
  },
  block_dispenser: {
    type: 'block_dispenser',
    category: 'facility',
    label: '정수기',
    defaultWidth: 5,
    defaultHeight: 5,
    defaultFill: '#D5E8F0',
    defaultStroke: '#7BAFC0',
    createsSeat: false,
    minWidth: 3,
    minHeight: 3,
  },
};

export const BLOCK_CATEGORIES: Array<{ id: string; label: string; types: BlockType[] }> = [
  {
    id: 'structure',
    label: '구조',
    types: ['block_room', 'block_window', 'block_door', 'block_sliding_door'],
  },
  {
    id: 'furniture',
    label: '가구',
    types: ['block_table_2', 'block_table_4', 'block_table_6', 'block_table_round'],
  },
  {
    id: 'facility',
    label: '시설',
    types: ['block_kitchen', 'block_selfbar', 'block_restroom', 'block_dispenser'],
  },
];

export function isBlockType(type: ShapeType): type is BlockType {
  return type.startsWith('block_');
}

export function isSeatBlock(type: ShapeType): boolean {
  if (!isBlockType(type)) return false;
  return BLOCK_REGISTRY[type].createsSeat;
}

export function isDragDrawBlock(type: ShapeType): boolean {
  if (!isBlockType(type)) return false;
  return !!BLOCK_REGISTRY[type].dragDraw;
}
