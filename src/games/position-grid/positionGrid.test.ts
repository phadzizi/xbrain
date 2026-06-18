import { describe, it, expect } from 'vitest';
import {
  getDifficulty,
  generatePlacement,
  buildCorrectGrid,
  checkPlacements,
  isGameOver,
} from './positionGrid.logic';
import type { ObjectItem } from '../object-disappears/objectDisappears.types';

describe('getDifficulty', () => {
  it('returns correct values for level 1', () => {
    expect(getDifficulty(1)).toEqual({ gridSize: 3, objectCount: 3, previewMs: 4000 });
  });

  it('returns correct values for level 7', () => {
    expect(getDifficulty(7)).toEqual({ gridSize: 5, objectCount: 10, previewMs: 3500 });
  });

  it('returns 5×5 grid for level 8+', () => {
    const d = getDifficulty(8);
    expect(d.gridSize).toBe(5);
    expect(d.previewMs).toBe(3000);
    expect(d.objectCount).toBe(11); // min(3 + 8, 14)
  });

  it('caps objectCount at 14 for very high levels', () => {
    expect(getDifficulty(20).objectCount).toBeLessThanOrEqual(14);
  });
});

describe('generatePlacement', () => {
  const fixedRng = () => 0.1;

  it('returns the correct gridSize', () => {
    const round = generatePlacement(1, fixedRng);
    expect(round.gridSize).toBe(3);
  });

  it('has exactly objectCount objects and placements', () => {
    const round = generatePlacement(1, fixedRng);
    expect(round.objects).toHaveLength(3);
    expect(round.placements).toHaveLength(3);
  });

  it('object ids are all unique', () => {
    const round = generatePlacement(2, fixedRng);
    const ids = round.objects.map((o) => o.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('cell indices are all unique (no two objects in same cell)', () => {
    const round = generatePlacement(3, fixedRng);
    const indices = round.placements.map((p) => p.cellIndex);
    expect(new Set(indices).size).toBe(indices.length);
  });

  it('all cell indices are within grid bounds', () => {
    const round = generatePlacement(4, fixedRng);
    const totalCells = round.gridSize * round.gridSize;
    round.placements.forEach((p) => {
      expect(p.cellIndex).toBeGreaterThanOrEqual(0);
      expect(p.cellIndex).toBeLessThan(totalCells);
    });
  });

  it('placements reference object ids that exist in objects array', () => {
    const round = generatePlacement(2, fixedRng);
    const objectIds = new Set(round.objects.map((o) => o.id));
    round.placements.forEach((p) => {
      expect(objectIds.has(p.objectId)).toBe(true);
    });
  });

  it('is deterministic with the same rng', () => {
    const r1 = generatePlacement(3, () => 0.42);
    const r2 = generatePlacement(3, () => 0.42);
    expect(r1.placements).toEqual(r2.placements);
  });
});

describe('buildCorrectGrid', () => {
  it('places each object in its correct cell', () => {
    const obj: ObjectItem = { id: 'cat', label: '🐱' };
    const round = {
      gridSize: 3,
      objects: [obj],
      placements: [{ objectId: 'cat', cellIndex: 4 }],
    };
    const grid = buildCorrectGrid(round);
    expect(grid[4]).toEqual(obj);
    expect(grid.filter((c) => c !== null)).toHaveLength(1);
  });
});

describe('checkPlacements', () => {
  const cat: ObjectItem = { id: 'cat', label: '🐱' };
  const dog: ObjectItem = { id: 'dog', label: '🐶' };
  const fox: ObjectItem = { id: 'fox', label: '🦊' };

  const round = {
    gridSize: 3,
    objects: [cat, dog, fox],
    placements: [
      { objectId: 'cat', cellIndex: 0 },
      { objectId: 'dog', cellIndex: 4 },
      { objectId: 'fox', cellIndex: 8 },
    ],
  };
  const emptyGrid = Array(9).fill(null) as (ObjectItem | null)[];

  it('scores 3/3 for a perfect match', () => {
    const playerGrid = [...emptyGrid];
    playerGrid[0] = cat;
    playerGrid[4] = dog;
    playerGrid[8] = fox;
    const result = checkPlacements(round, playerGrid);
    expect(result.roundScore).toBe(3);
    expect(result.cellResults[0].status).toBe('correct');
    expect(result.cellResults[4].status).toBe('correct');
    expect(result.cellResults[8].status).toBe('correct');
  });

  it('scores 0 for empty player grid', () => {
    const result = checkPlacements(round, emptyGrid);
    expect(result.roundScore).toBe(0);
    expect(result.cellResults[0].status).toBe('missed');
    expect(result.cellResults[4].status).toBe('missed');
    expect(result.cellResults[8].status).toBe('missed');
  });

  it('marks wrong placements correctly', () => {
    const playerGrid = [...emptyGrid];
    playerGrid[0] = dog; // dog in cat's spot
    const result = checkPlacements(round, playerGrid);
    expect(result.cellResults[0].status).toBe('wrong');
    expect(result.cellResults[0].playerObject).toEqual(dog);
    expect(result.cellResults[0].correctObject).toEqual(cat);
    expect(result.roundScore).toBe(0);
  });

  it('scores partial matches correctly', () => {
    const playerGrid = [...emptyGrid];
    playerGrid[0] = cat; // correct
    playerGrid[4] = fox; // wrong (fox in dog's spot)
    const result = checkPlacements(round, playerGrid);
    expect(result.roundScore).toBe(1);
    expect(result.cellResults[0].status).toBe('correct');
    expect(result.cellResults[4].status).toBe('wrong');
    expect(result.cellResults[8].status).toBe('missed');
  });

  it('totalObjects equals round.objects.length', () => {
    const result = checkPlacements(round, emptyGrid);
    expect(result.totalObjects).toBe(3);
  });

  it('empty cells are marked as empty', () => {
    const result = checkPlacements(round, emptyGrid);
    // Cell 1 has no correct object and no player object
    expect(result.cellResults[1].status).toBe('empty');
  });
});

describe('isGameOver', () => {
  it('returns true when roundScore is 0', () => {
    expect(isGameOver(0, 4)).toBe(true);
  });

  it('returns true when roundScore < ceil(totalObjects / 2)', () => {
    expect(isGameOver(1, 3)).toBe(true); // need 2 of 3
    expect(isGameOver(2, 5)).toBe(true); // need 3 of 5
  });

  it('returns false when roundScore >= ceil(totalObjects / 2)', () => {
    expect(isGameOver(2, 3)).toBe(false); // 2 >= ceil(3/2)=2
    expect(isGameOver(3, 5)).toBe(false); // 3 >= ceil(5/2)=3
    expect(isGameOver(5, 5)).toBe(false); // perfect score
  });

  it('returns false when roundScore equals totalObjects', () => {
    expect(isGameOver(4, 4)).toBe(false);
  });
});
