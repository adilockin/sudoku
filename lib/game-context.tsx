"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useRef,
} from "react";
import {
  type Board,
  type Difficulty,
  generatePuzzle,
  copyBoard,
  isInSameBox,
  getConflicts,
} from "./sudoku-engine";
import {
  type ScoreState,
  type ScoreEvent,
  createInitialScoreState,
  calculatePlacementScore,
  calculateHintPenalty,
  calculateCompletionBonus,
  clearPendingPopups,
  getStreakMultiplier,
} from "./score-engine";
import { useSettings } from "./settings-context";
import { useSound } from "./sound-context";
import { useProfile } from "./profile-context";

// --- Types ---

export type CellPos = { row: number; col: number };

interface NotesMap {
  [key: string]: number[]; // "row-col" -> [1,3,5]
}

interface HistoryEntry {
  type: "value" | "note" | "erase";
  row: number;
  col: number;
  prevValue: number;
  newValue: number;
  prevNotes: number[];
  newNotes: number[];
}

export interface GameState {
  puzzle: Board;
  solution: Board;
  initialPuzzle: Board;
  notes: NotesMap;
  selectedCell: CellPos | null;
  difficulty: Difficulty;
  mistakes: number;
  maxMistakes: number;
  timer: number;
  isRunning: boolean;
  isPaused: boolean;
  isComplete: boolean;
  isGameOver: boolean;
  notesMode: boolean;
  history: HistoryEntry[];
  hintsUsed: number;
  maxHints: number;
  score: ScoreState;
}

// --- Actions ---

type GameAction =
  | { type: "SELECT_CELL"; row: number; col: number }
  | { type: "PLACE_NUMBER"; num: number; lockCorrect: boolean; autoRemoveNotes: boolean }
  | { type: "TOGGLE_NOTES_MODE" }
  | { type: "ERASE"; lockCorrect: boolean }
  | { type: "UNDO" }
  | { type: "HINT"; autoRemoveNotes: boolean }
  | { type: "NEW_GAME"; difficulty: Difficulty }
  | { type: "TICK" }
  | { type: "PAUSE" }
  | { type: "RESUME" }
  | { type: "MOVE_SELECTION"; direction: "up" | "down" | "left" | "right" }
  | { type: "CLEAR_POPUPS" };

// --- Helpers ---

function cellKey(row: number, col: number): string {
  return `${row}-${col}`;
}

function removeNoteFromPeers(
  notes: NotesMap,
  row: number,
  col: number,
  num: number
): NotesMap {
  const updated = { ...notes };
  for (let i = 0; i < 9; i++) {
    const rk = cellKey(row, i);
    if (updated[rk]) {
      updated[rk] = updated[rk].filter((n) => n !== num);
      if (updated[rk].length === 0) delete updated[rk];
    }
    const ck = cellKey(i, col);
    if (updated[ck]) {
      updated[ck] = updated[ck].filter((n) => n !== num);
      if (updated[ck].length === 0) delete updated[ck];
    }
  }
  const br = Math.floor(row / 3) * 3;
  const bc = Math.floor(col / 3) * 3;
  for (let r = br; r < br + 3; r++) {
    for (let c = bc; c < bc + 3; c++) {
      const bk = cellKey(r, c);
      if (updated[bk]) {
        updated[bk] = updated[bk].filter((n) => n !== num);
        if (updated[bk].length === 0) delete updated[bk];
      }
    }
  }
  return updated;
}

function createInitialState(difficulty: Difficulty): GameState {
  const { puzzle, solution } = generatePuzzle(difficulty);
  return {
    puzzle: copyBoard(puzzle),
    solution,
    initialPuzzle: copyBoard(puzzle),
    notes: {},
    selectedCell: null,
    difficulty,
    mistakes: 0,
    maxMistakes: 3,
    timer: 0,
    isRunning: true,
    isPaused: false,
    isComplete: false,
    isGameOver: false,
    notesMode: false,
    history: [],
    hintsUsed: 0,
    maxHints: 3,
    score: createInitialScoreState(),
  };
}

// --- Reducer ---

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "SELECT_CELL":
      return { ...state, selectedCell: { row: action.row, col: action.col } };

    case "PLACE_NUMBER": {
      if (!state.selectedCell || state.isComplete || state.isGameOver)
        return state;
      const { row, col } = state.selectedCell;

      const isLocked =
        state.initialPuzzle[row][col] !== 0 ||
        (action.lockCorrect &&
          state.puzzle[row][col] === state.solution[row][col]);
      if (isLocked) return state;

      const num = action.num;

      // Notes mode
      if (state.notesMode) {
        const key = cellKey(row, col);
        if (state.puzzle[row][col] !== 0) return state;
        const currentNotes = state.notes[key] || [];
        const prevNotes = [...currentNotes];
        const newNotes = currentNotes.includes(num)
          ? currentNotes.filter((n) => n !== num)
          : [...currentNotes, num].sort();
        const entry: HistoryEntry = {
          type: "note",
          row,
          col,
          prevValue: 0,
          newValue: 0,
          prevNotes,
          newNotes,
        };
        return {
          ...state,
          notes: {
            ...state.notes,
            [key]: newNotes.length > 0 ? newNotes : [],
          },
          history: [...state.history, entry],
        };
      }

      // Normal mode — place number
      const prevValue = state.puzzle[row][col];
      const isCorrect = num === state.solution[row][col];
      const newPuzzle = copyBoard(state.puzzle);
      newPuzzle[row][col] = num;

      // Remove notes from this cell and peers
      const key = cellKey(row, col);
      let newNotes = { ...state.notes };
      delete newNotes[key];
      if (isCorrect && action.autoRemoveNotes) {
        newNotes = removeNoteFromPeers(newNotes, row, col, num);
      }

      const newMistakes = isCorrect ? state.mistakes : state.mistakes + 1;
      const isGameOver = newMistakes >= state.maxMistakes;

      // Check completion
      let isComplete = false;
      if (isCorrect) {
        isComplete = true;
        for (let r = 0; r < 9 && isComplete; r++) {
          for (let c = 0; c < 9 && isComplete; c++) {
            if (newPuzzle[r][c] !== state.solution[r][c]) isComplete = false;
          }
        }
      }

      // Calculate score
      const { newScoreState } = calculatePlacementScore(
        state.score,
        newPuzzle,
        state.solution,
        row,
        col,
        isCorrect
      );

      // Add completion bonus if done
      let finalScore = newScoreState;
      if (isComplete) {
        finalScore = calculateCompletionBonus(
          newScoreState,
          state.difficulty,
          state.timer,
          newMistakes,
          state.hintsUsed,
          state.maxHints
        );
      }

      const entry: HistoryEntry = {
        type: "value",
        row,
        col,
        prevValue,
        newValue: num,
        prevNotes: state.notes[key] || [],
        newNotes: [],
      };

      return {
        ...state,
        puzzle: newPuzzle,
        notes: newNotes,
        mistakes: newMistakes,
        isGameOver,
        isComplete,
        isRunning: !isComplete && !isGameOver,
        history: [...state.history, entry],
        score: finalScore,
      };
    }

    case "ERASE": {
      if (!state.selectedCell || state.isComplete || state.isGameOver)
        return state;
      const { row, col } = state.selectedCell;
      const isLocked =
        state.initialPuzzle[row][col] !== 0 ||
        (action.lockCorrect &&
          state.puzzle[row][col] === state.solution[row][col]);
      if (isLocked) return state;

      const prevValue = state.puzzle[row][col];
      const key = cellKey(row, col);
      const prevNotes = state.notes[key] || [];

      if (prevValue === 0 && prevNotes.length === 0) return state;

      const newPuzzle = copyBoard(state.puzzle);
      newPuzzle[row][col] = 0;
      const newNotes = { ...state.notes };
      delete newNotes[key];

      const entry: HistoryEntry = {
        type: "erase",
        row,
        col,
        prevValue,
        newValue: 0,
        prevNotes,
        newNotes: [],
      };

      return {
        ...state,
        puzzle: newPuzzle,
        notes: newNotes,
        history: [...state.history, entry],
      };
    }

    case "UNDO": {
      if (state.history.length === 0 || state.isComplete || state.isGameOver)
        return state;
      const entry = state.history[state.history.length - 1];
      const newHistory = state.history.slice(0, -1);
      const newPuzzle = copyBoard(state.puzzle);
      const newNotes = { ...state.notes };
      const key = cellKey(entry.row, entry.col);

      if (entry.type === "value" || entry.type === "erase") {
        newPuzzle[entry.row][entry.col] = entry.prevValue;
        if (entry.prevNotes.length > 0) {
          newNotes[key] = entry.prevNotes;
        } else {
          delete newNotes[key];
        }
        let newMistakes = state.mistakes;
        if (
          entry.type === "value" &&
          entry.newValue !== state.solution[entry.row][entry.col]
        ) {
          newMistakes = Math.max(0, state.mistakes - 1);
        }
        return {
          ...state,
          puzzle: newPuzzle,
          notes: newNotes,
          history: newHistory,
          mistakes: newMistakes,
          isGameOver: false,
          isRunning: true,
        };
      }

      if (entry.type === "note") {
        if (entry.prevNotes.length > 0) {
          newNotes[key] = entry.prevNotes;
        } else {
          delete newNotes[key];
        }
        return { ...state, notes: newNotes, history: newHistory };
      }

      return state;
    }

    case "HINT": {
      if (!state.selectedCell || state.isComplete || state.isGameOver)
        return state;
      if (state.hintsUsed >= state.maxHints) return state;

      const { row, col } = state.selectedCell;
      if (state.initialPuzzle[row][col] !== 0) return state;
      if (state.puzzle[row][col] === state.solution[row][col]) return state;

      const correctNum = state.solution[row][col];
      const newPuzzle = copyBoard(state.puzzle);
      const prevValue = newPuzzle[row][col];
      newPuzzle[row][col] = correctNum;

      const key = cellKey(row, col);
      let newNotes = { ...state.notes };
      delete newNotes[key];
      if (action.autoRemoveNotes) {
        newNotes = removeNoteFromPeers(newNotes, row, col, correctNum);
      }

      let isComplete = true;
      for (let r = 0; r < 9 && isComplete; r++) {
        for (let c = 0; c < 9 && isComplete; c++) {
          if (newPuzzle[r][c] !== state.solution[r][c]) isComplete = false;
        }
      }

      const entry: HistoryEntry = {
        type: "value",
        row,
        col,
        prevValue,
        newValue: correctNum,
        prevNotes: state.notes[key] || [],
        newNotes: [],
      };

      // Score penalty for hint
      let newScore = calculateHintPenalty(state.score);
      if (isComplete) {
        newScore = calculateCompletionBonus(
          newScore,
          state.difficulty,
          state.timer,
          state.mistakes,
          state.hintsUsed + 1,
          state.maxHints
        );
      }

      return {
        ...state,
        puzzle: newPuzzle,
        notes: newNotes,
        hintsUsed: state.hintsUsed + 1,
        isComplete,
        isRunning: !isComplete,
        history: [...state.history, entry],
        score: newScore,
      };
    }

    case "NEW_GAME":
      return createInitialState(action.difficulty);

    case "TOGGLE_NOTES_MODE":
      return { ...state, notesMode: !state.notesMode };

    case "TICK":
      if (!state.isRunning || state.isPaused) return state;
      return { ...state, timer: state.timer + 1 };

    case "PAUSE":
      return { ...state, isPaused: true, isRunning: false };

    case "RESUME":
      if (state.isComplete || state.isGameOver) return state;
      return { ...state, isPaused: false, isRunning: true };

    case "MOVE_SELECTION": {
      if (!state.selectedCell)
        return { ...state, selectedCell: { row: 0, col: 0 } };
      const { row, col } = state.selectedCell;
      let newRow = row,
        newCol = col;
      switch (action.direction) {
        case "up":
          newRow = Math.max(0, row - 1);
          break;
        case "down":
          newRow = Math.min(8, row + 1);
          break;
        case "left":
          newCol = Math.max(0, col - 1);
          break;
        case "right":
          newCol = Math.min(8, col + 1);
          break;
      }
      return { ...state, selectedCell: { row: newRow, col: newCol } };
    }

    case "CLEAR_POPUPS":
      return { ...state, score: clearPendingPopups(state.score) };

    case "LOAD_STATE":
      return { 
        ...action.state, 
        isRunning: action.state.isRunning && !action.state.isComplete && !action.state.isGameOver 
      };

    default:
      return state;
  }
}

// --- Context ---

interface GameContextValue {
  state: GameState;
  selectCell: (row: number, col: number) => void;
  placeNumber: (num: number) => void;
  erase: () => void;
  undo: () => void;
  hint: () => void;
  toggleNotesMode: () => void;
  newGame: (difficulty: Difficulty) => void;
  pause: () => void;
  resume: () => void;
  moveSelection: (direction: "up" | "down" | "left" | "right") => void;
  clearPopups: () => void;
  // Derived helpers
  isCellPrefilled: (row: number, col: number) => boolean;
  isCellMistake: (row: number, col: number) => boolean;
  isCellSelected: (row: number, col: number) => boolean;
  isCellHighlighted: (row: number, col: number) => boolean;
  isCellSameNumber: (row: number, col: number) => boolean;
  isCellConflict: (row: number, col: number) => boolean;
  getCellNotes: (row: number, col: number) => number[];
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const { settings } = useSettings();
  const { playSfx, playMistakeBeep, playCorrectBeep, fadeAndRestart } = useSound();
  const { recordGameStart, recordGameWin, recordTimePlayed, recordMistake } = useProfile();
  const [state, dispatch] = useReducer(
    gameReducer,
    "medium" as Difficulty,
    createInitialState
  );

  // Load state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("adoku-save");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.puzzle) {
          dispatch({ type: "LOAD_STATE", state: parsed });
        }
      } catch (e) {}
    } else {
      recordGameStart("medium"); // Record initial game
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("adoku-save", JSON.stringify(state));
  }, [state]);

  // Track completion and record win
  const prevIsCompleteRef = useRef(false);
  useEffect(() => {
    if (state.isComplete && !prevIsCompleteRef.current) {
      recordGameWin(state.difficulty, state.timer, state.score.totalScore);
    }
    prevIsCompleteRef.current = state.isComplete;
  }, [state.isComplete, state.difficulty, state.timer, state.score.totalScore, recordGameWin]);

  // Track mistakes
  const prevMistakesRef = useRef(state.mistakes);
  useEffect(() => {
    if (state.mistakes > prevMistakesRef.current) {
      const diff = state.mistakes - prevMistakesRef.current;
      for (let i = 0; i < diff; i++) {
        recordMistake();
      }
    }
    prevMistakesRef.current = state.mistakes;
  }, [state.mistakes, recordMistake]);

  // Sound triggers — react to score events
  const prevPopupsRef = useRef(state.score.pendingPopups);
  useEffect(() => {
    const popups = state.score.pendingPopups;
    if (popups.length === 0 || popups === prevPopupsRef.current) return;
    prevPopupsRef.current = popups;

    const types = popups.map((p) => p.type);

    if (state.isComplete) {
      playSfx("complete");
    } else if (types.includes("mistake")) {
      playMistakeBeep();
    } else if (types.includes("row") || types.includes("col") || types.includes("box")) {
      playSfx("reward");
    } else if (types.includes("streak")) {
      playSfx("streak");
    } else if (types.includes("correct")) {
      playCorrectBeep();
    }
  }, [state.score.pendingPopups, state.isComplete, playSfx, playMistakeBeep, playCorrectBeep]);

  // Timer
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.isRunning && !state.isPaused) {
      timerRef.current = setInterval(() => dispatch({ type: "TICK" }), 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.isRunning, state.isPaused]);

  // Keyboard input
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ignore if typing in an input
      const target = e.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }

      if (state.isComplete || state.isGameOver) return;

      if (e.key >= "1" && e.key <= "9") {
        e.preventDefault();
        dispatch({
          type: "PLACE_NUMBER",
          num: parseInt(e.key),
          lockCorrect: settings.lockCorrectAnswers,
          autoRemoveNotes: settings.autoRemoveNotes,
        });
      } else if (e.key === "Backspace" || e.key === "Delete") {
        e.preventDefault();
        dispatch({ type: "ERASE", lockCorrect: settings.lockCorrectAnswers });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        dispatch({ type: "MOVE_SELECTION", direction: "up" });
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        dispatch({ type: "MOVE_SELECTION", direction: "down" });
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        dispatch({ type: "MOVE_SELECTION", direction: "left" });
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        dispatch({ type: "MOVE_SELECTION", direction: "right" });
      } else if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        dispatch({ type: "TOGGLE_NOTES_MODE" });
      } else if (e.key === "z" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        dispatch({ type: "UNDO" });
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [state.isComplete, state.isGameOver, settings.lockCorrectAnswers, settings.autoRemoveNotes]);

  // Derived helpers — respect settings
  const isCellPrefilled = useCallback(
    (row: number, col: number) => {
      if (state.initialPuzzle[row][col] !== 0) return true;
      if (
        settings.lockCorrectAnswers &&
        state.puzzle[row][col] === state.solution[row][col] &&
        state.puzzle[row][col] !== 0
      )
        return true;
      return false;
    },
    [state.initialPuzzle, state.puzzle, state.solution, settings.lockCorrectAnswers]
  );

  const isCellMistake = useCallback(
    (row: number, col: number) => {
      if (!settings.autoCheck) return false;
      const val = state.puzzle[row][col];
      if (val === 0 || state.initialPuzzle[row][col] !== 0) return false;
      return val !== state.solution[row][col];
    },
    [state.puzzle, state.initialPuzzle, state.solution, settings.autoCheck]
  );

  const isCellSelected = useCallback(
    (row: number, col: number) =>
      state.selectedCell?.row === row && state.selectedCell?.col === col,
    [state.selectedCell]
  );

  const isCellHighlighted = useCallback(
    (row: number, col: number) => {
      if (!settings.highlightRowColBox) return false;
      if (!state.selectedCell) return false;
      const { row: sr, col: sc } = state.selectedCell;
      return sr === row || sc === col || isInSameBox(sr, sc, row, col);
    },
    [state.selectedCell, settings.highlightRowColBox]
  );

  const isCellSameNumber = useCallback(
    (row: number, col: number) => {
      if (!settings.highlightSameNumbers) return false;
      if (!state.selectedCell) return false;
      const selectedVal =
        state.puzzle[state.selectedCell.row][state.selectedCell.col];
      if (selectedVal === 0) return false;
      return state.puzzle[row][col] === selectedVal;
    },
    [state.selectedCell, state.puzzle, settings.highlightSameNumbers]
  );

  const isCellConflict = useCallback(
    (row: number, col: number) => {
      if (!settings.highlightConflicts) return false;
      const val = state.puzzle[row][col];
      if (val === 0) return false;
      const conflicts = getConflicts(state.puzzle, row, col, val);
      return conflicts.length > 0;
    },
    [state.puzzle, settings.highlightConflicts]
  );

  const getCellNotes = useCallback(
    (row: number, col: number) => state.notes[cellKey(row, col)] || [],
    [state.notes]
  );

  const value: GameContextValue = {
    state,
    selectCell: (row, col) => dispatch({ type: "SELECT_CELL", row, col }),
    placeNumber: (num) =>
      dispatch({
        type: "PLACE_NUMBER",
        num,
        lockCorrect: settings.lockCorrectAnswers,
        autoRemoveNotes: settings.autoRemoveNotes,
      }),
    erase: () =>
      dispatch({ type: "ERASE", lockCorrect: settings.lockCorrectAnswers }),
    undo: () => dispatch({ type: "UNDO" }),
    hint: () =>
      dispatch({ type: "HINT", autoRemoveNotes: settings.autoRemoveNotes }),
    toggleNotesMode: () => dispatch({ type: "TOGGLE_NOTES_MODE" }),
    newGame: (difficulty) => {
      dispatch({ type: "NEW_GAME", difficulty });
      playSfx("gameStart");
      fadeAndRestart();
      recordGameStart(difficulty);
    },
    pause: () => dispatch({ type: "PAUSE" }),
    resume: () => dispatch({ type: "RESUME" }),
    moveSelection: (direction) =>
      dispatch({ type: "MOVE_SELECTION", direction }),
    clearPopups: () => dispatch({ type: "CLEAR_POPUPS" }),
    isCellPrefilled,
    isCellMistake,
    isCellSelected,
    isCellHighlighted,
    isCellSameNumber,
    isCellConflict,
    getCellNotes,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export { getStreakMultiplier };
