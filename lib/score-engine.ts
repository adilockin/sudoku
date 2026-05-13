import type { Board, Difficulty } from "./sudoku-engine";

// --- Types ---

export interface ScoreEvent {
  type:
    | "correct"
    | "streak"
    | "speed"
    | "row"
    | "col"
    | "box"
    | "mistake"
    | "hint"
    | "completion"
    | "time"
    | "no_mistake"
    | "no_hint"
    | "first";
  points: number;
  timestamp: number;
  details?: string;
}

export interface ScoreState {
  totalScore: number;
  currentStreak: number;
  bestStreak: number;
  lastPlacementTime: number;
  completedRows: number[];
  completedCols: number[];
  completedBoxes: number[];
  scoreLog: ScoreEvent[];
  pendingPopups: ScoreEvent[]; // for floating point display
  totalCorrectPlacements: number;
}

export function createInitialScoreState(): ScoreState {
  return {
    totalScore: 0,
    currentStreak: 0,
    bestStreak: 0,
    lastPlacementTime: 0,
    completedRows: [],
    completedCols: [],
    completedBoxes: [],
    scoreLog: [],
    pendingPopups: [],
    totalCorrectPlacements: 0,
  };
}

// --- Streak Multiplier ---

export function getStreakMultiplier(streak: number): number {
  if (streak >= 20) return 5;
  if (streak >= 15) return 4;
  if (streak >= 10) return 3;
  if (streak >= 5) return 2;
  if (streak >= 3) return 1.5;
  return 1;
}

// --- Completion Checks ---

function isRowComplete(board: Board, solution: Board, row: number): boolean {
  for (let c = 0; c < 9; c++) {
    if (board[row][c] !== solution[row][c]) return false;
  }
  return true;
}

function isColComplete(board: Board, solution: Board, col: number): boolean {
  for (let r = 0; r < 9; r++) {
    if (board[r][col] !== solution[r][col]) return false;
  }
  return true;
}

function isBoxComplete(
  board: Board,
  solution: Board,
  boxIndex: number
): boolean {
  const br = Math.floor(boxIndex / 3) * 3;
  const bc = (boxIndex % 3) * 3;
  for (let r = br; r < br + 3; r++) {
    for (let c = bc; c < bc + 3; c++) {
      if (board[r][c] !== solution[r][c]) return false;
    }
  }
  return true;
}

function getBoxIndex(row: number, col: number): number {
  return Math.floor(row / 3) * 3 + Math.floor(col / 3);
}

// --- Time Bonus ---

const BASE_TIMES: Record<Difficulty, number> = {
  easy: 600,
  medium: 900,
  hard: 1200,
  expert: 1800,
};

const DIFF_MULTIPLIER: Record<Difficulty, number> = {
  easy: 0.5,
  medium: 1.0,
  hard: 1.5,
  expert: 2.0,
};

const COMPLETION_REWARD: Record<Difficulty, number> = {
  easy: 100,
  medium: 200,
  hard: 400,
  expert: 800,
};

// --- Main Score Calculation ---

export function calculatePlacementScore(
  scoreState: ScoreState,
  board: Board,
  solution: Board,
  row: number,
  col: number,
  isCorrect: boolean
): { newScoreState: ScoreState; events: ScoreEvent[] } {
  const now = Date.now();
  const events: ScoreEvent[] = [];
  let newState = { ...scoreState };

  if (!isCorrect) {
    // Mistake
    const mistakeEvent: ScoreEvent = {
      type: "mistake",
      points: -15,
      timestamp: now,
      details: "Mistake!",
    };
    events.push(mistakeEvent);
    newState.currentStreak = 0;
    newState.totalScore = Math.max(0, newState.totalScore - 15);
    newState.scoreLog = [...newState.scoreLog, mistakeEvent];
    newState.pendingPopups = [...events];
    return { newScoreState: newState, events };
  }

  // --- Correct placement ---
  newState.totalCorrectPlacements++;
  newState.currentStreak++;
  if (newState.currentStreak > newState.bestStreak) {
    newState.bestStreak = newState.currentStreak;
  }

  // First correct number bonus
  if (newState.totalCorrectPlacements === 1) {
    const firstEvent: ScoreEvent = {
      type: "first",
      points: 5,
      timestamp: now,
      details: "First move!",
    };
    events.push(firstEvent);
  }

  // Base points
  const multiplier = getStreakMultiplier(newState.currentStreak);
  const basePoints = Math.round(10 * multiplier);
  const correctEvent: ScoreEvent = {
    type: "correct",
    points: basePoints,
    timestamp: now,
    details: multiplier > 1 ? `×${multiplier}` : undefined,
  };
  events.push(correctEvent);

  // Speed bonus (within 3 seconds of last action)
  if (newState.lastPlacementTime > 0) {
    const elapsed = (now - newState.lastPlacementTime) / 1000;
    if (elapsed <= 3) {
      const speedPoints = Math.round((3 - elapsed) * 2);
      if (speedPoints > 0) {
        events.push({
          type: "speed",
          points: speedPoints,
          timestamp: now,
          details: "Quick!",
        });
      }
    }
  }

  // Streak milestone bonus
  if (
    [3, 5, 10, 15, 20].includes(newState.currentStreak) &&
    newState.currentStreak > 0
  ) {
    events.push({
      type: "streak",
      points: newState.currentStreak * 5,
      timestamp: now,
      details: `${newState.currentStreak} streak!`,
    });
  }

  // Row complete
  if (
    !newState.completedRows.includes(row) &&
    isRowComplete(board, solution, row)
  ) {
    newState.completedRows = [...newState.completedRows, row];
    events.push({
      type: "row",
      points: 50,
      timestamp: now,
      details: `Row ${row + 1} complete!`,
    });
  }

  // Column complete
  if (
    !newState.completedCols.includes(col) &&
    isColComplete(board, solution, col)
  ) {
    newState.completedCols = [...newState.completedCols, col];
    events.push({
      type: "col",
      points: 50,
      timestamp: now,
      details: `Column ${col + 1} complete!`,
    });
  }

  // Box complete
  const bi = getBoxIndex(row, col);
  if (
    !newState.completedBoxes.includes(bi) &&
    isBoxComplete(board, solution, bi)
  ) {
    newState.completedBoxes = [...newState.completedBoxes, bi];
    events.push({
      type: "box",
      points: 75,
      timestamp: now,
      details: "Box complete!",
    });
  }

  // Sum up
  const totalPoints = events.reduce((sum, e) => sum + e.points, 0);
  newState.totalScore += totalPoints;
  newState.lastPlacementTime = now;
  newState.scoreLog = [...newState.scoreLog, ...events];
  newState.pendingPopups = [...events];

  return { newScoreState: newState, events };
}

export function calculateHintPenalty(scoreState: ScoreState): ScoreState {
  const event: ScoreEvent = {
    type: "hint",
    points: -25,
    timestamp: Date.now(),
    details: "Used hint",
  };
  return {
    ...scoreState,
    totalScore: Math.max(0, scoreState.totalScore - 25),
    scoreLog: [...scoreState.scoreLog, event],
    pendingPopups: [event],
  };
}

export function calculateCompletionBonus(
  scoreState: ScoreState,
  difficulty: Difficulty,
  elapsedSeconds: number,
  mistakes: number,
  hintsUsed: number,
  maxHints: number
): ScoreState {
  const now = Date.now();
  const events: ScoreEvent[] = [];
  let newState = { ...scoreState };

  // Puzzle completion reward
  events.push({
    type: "completion",
    points: COMPLETION_REWARD[difficulty],
    timestamp: now,
    details: `${difficulty} puzzle complete!`,
  });

  // Time bonus
  const timeRemaining = BASE_TIMES[difficulty] - elapsedSeconds;
  if (timeRemaining > 0) {
    const timeBonus = Math.round(timeRemaining * DIFF_MULTIPLIER[difficulty]);
    events.push({
      type: "time",
      points: timeBonus,
      timestamp: now,
      details: `Time bonus!`,
    });
  }

  // No-mistake bonus
  if (mistakes === 0) {
    events.push({
      type: "no_mistake",
      points: 200,
      timestamp: now,
      details: "Perfect — no mistakes!",
    });
  }

  // Unused hints bonus
  const unusedHints = maxHints - hintsUsed;
  if (unusedHints > 0) {
    events.push({
      type: "no_hint",
      points: unusedHints * 50,
      timestamp: now,
      details: `${unusedHints} hints saved!`,
    });
  }

  const totalPoints = events.reduce((sum, e) => sum + e.points, 0);
  newState.totalScore += totalPoints;
  newState.scoreLog = [...newState.scoreLog, ...events];
  newState.pendingPopups = [...events];

  return newState;
}

export function clearPendingPopups(scoreState: ScoreState): ScoreState {
  return { ...scoreState, pendingPopups: [] };
}
