// Sudoku Engine — generation, solving, validation

export type Board = number[][];
export type Difficulty = "easy" | "medium" | "hard" | "expert";

const DIFFICULTY_CLUES: Record<Difficulty, [number, number]> = {
  easy: [38, 45],
  medium: [30, 37],
  hard: [25, 29],
  expert: [17, 24],
};

// --- Validation ---

export function isValidPlacement(
  board: Board,
  row: number,
  col: number,
  num: number
): boolean {
  // Check row
  for (let c = 0; c < 9; c++) {
    if (c !== col && board[row][c] === num) return false;
  }
  // Check column
  for (let r = 0; r < 9; r++) {
    if (r !== row && board[r][col] === num) return false;
  }
  // Check 3x3 box
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if (r !== row && c !== col && board[r][c] === num) return false;
    }
  }
  return true;
}

export function getConflicts(
  board: Board,
  row: number,
  col: number,
  num: number
): { row: number; col: number }[] {
  const conflicts: { row: number; col: number }[] = [];
  if (num === 0) return conflicts;

  // Row conflicts
  for (let c = 0; c < 9; c++) {
    if (c !== col && board[row][c] === num) {
      conflicts.push({ row, col: c });
    }
  }
  // Column conflicts
  for (let r = 0; r < 9; r++) {
    if (r !== row && board[r][col] === num) {
      conflicts.push({ row: r, col });
    }
  }
  // Box conflicts
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if ((r !== row || c !== col) && board[r][c] === num) {
        conflicts.push({ row: r, col: c });
      }
    }
  }
  return conflicts;
}

export function isBoardComplete(board: Board): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] === 0) return false;
    }
  }
  return true;
}

export function isBoardCorrect(board: Board, solution: Board): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] !== solution[r][c]) return false;
    }
  }
  return true;
}

// --- Solver (backtracking) ---

function findEmpty(board: Board): [number, number] | null {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] === 0) return [r, c];
    }
  }
  return null;
}

export function solve(board: Board): Board | null {
  const copy = board.map((row) => [...row]);
  if (solveInPlace(copy)) return copy;
  return null;
}

function solveInPlace(board: Board): boolean {
  const empty = findEmpty(board);
  if (!empty) return true;

  const [row, col] = empty;
  for (let num = 1; num <= 9; num++) {
    if (isValidPlacement(board, row, col, num)) {
      board[row][col] = num;
      if (solveInPlace(board)) return true;
      board[row][col] = 0;
    }
  }
  return false;
}

// Count solutions (stop at 2 to check uniqueness)
function countSolutions(board: Board, limit: number = 2): number {
  const empty = findEmpty(board);
  if (!empty) return 1;

  const [row, col] = empty;
  let count = 0;
  for (let num = 1; num <= 9; num++) {
    if (isValidPlacement(board, row, col, num)) {
      board[row][col] = num;
      count += countSolutions(board, limit);
      board[row][col] = 0;
      if (count >= limit) return count;
    }
  }
  return count;
}

// --- Generator ---

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateFullBoard(): Board {
  const board: Board = Array.from({ length: 9 }, () => Array(9).fill(0));
  fillBoard(board);
  return board;
}

function fillBoard(board: Board): boolean {
  const empty = findEmpty(board);
  if (!empty) return true;

  const [row, col] = empty;
  const nums = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);

  for (const num of nums) {
    if (isValidPlacement(board, row, col, num)) {
      board[row][col] = num;
      if (fillBoard(board)) return true;
      board[row][col] = 0;
    }
  }
  return false;
}

export function generatePuzzle(difficulty: Difficulty): {
  puzzle: Board;
  solution: Board;
} {
  const solution = generateFullBoard();
  const puzzle = solution.map((row) => [...row]);

  const [minClues, maxClues] = DIFFICULTY_CLUES[difficulty];
  const targetClues =
    minClues + Math.floor(Math.random() * (maxClues - minClues + 1));
  const cellsToRemove = 81 - targetClues;

  // Create list of all cell positions and shuffle
  const positions: [number, number][] = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      positions.push([r, c]);
    }
  }
  const shuffled = shuffleArray(positions);

  let removed = 0;
  for (const [r, c] of shuffled) {
    if (removed >= cellsToRemove) break;

    const backup = puzzle[r][c];
    puzzle[r][c] = 0;

    // Check unique solution
    const copy = puzzle.map((row) => [...row]);
    if (countSolutions(copy) === 1) {
      removed++;
    } else {
      puzzle[r][c] = backup; // Restore — removing this would create ambiguity
    }
  }

  return { puzzle, solution };
}

// --- Helpers ---

export function copyBoard(board: Board): Board {
  return board.map((row) => [...row]);
}

export function getNumberCounts(board: Board): Record<number, number> {
  const counts: Record<number, number> = {};
  for (let n = 1; n <= 9; n++) counts[n] = 0;
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] !== 0) counts[board[r][c]]++;
    }
  }
  return counts;
}

export function isInSameBox(
  row1: number,
  col1: number,
  row2: number,
  col2: number
): boolean {
  return (
    Math.floor(row1 / 3) === Math.floor(row2 / 3) &&
    Math.floor(col1 / 3) === Math.floor(col2 / 3)
  );
}
