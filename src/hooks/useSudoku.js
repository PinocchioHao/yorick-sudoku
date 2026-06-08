import { useState, useCallback, useEffect } from 'react';
import { generatePuzzle, isValid } from '../utils/sudoku';

const STORAGE_KEY = 'sudoku_game_state';

const generateEmptyMatrix = (val) => Array(9).fill(null).map(() => Array(9).fill(val));
const generateEmptyArray = (val) => Array(9).fill(val);
// 【新增】生成空的草稿矩阵（每个格子存放一个数组）
const generateEmptyNotes = () => Array(9).fill(null).map(() => Array(9).fill([]));

export function useSudoku() {
  const [board, setBoard] = useState(generateEmptyMatrix(0));
  const [initialBoard, setInitialBoard] = useState(generateEmptyMatrix(0));
  const [answer, setAnswer] = useState(generateEmptyMatrix(0));
  const [difficulty, setDifficulty] = useState('medium');

  const [colors, setColors] = useState(generateEmptyMatrix(null));
  const [rowDrafts, setRowDrafts] = useState(generateEmptyArray(''));
  const [colDrafts, setColDrafts] = useState(generateEmptyArray(''));
  // 【新增】内嵌笔记状态
  const [notes, setNotes] = useState(generateEmptyNotes());

  const [selectedCell, setSelectedCell] = useState({ row: null, col: null });
  const [history, setHistory] = useState([]);
  const [errors, setErrors] = useState(generateEmptyMatrix(false));
  const [isLoaded, setIsLoaded] = useState(false);

  const saveHistory = useCallback(() => {
    setHistory(prev => [...prev, {
      board: board.map(r => [...r]),
      colors: colors.map(r => [...r]),
      notes: notes.map(r => r.map(c => [...c])), // 存入笔记
      rowDrafts: [...rowDrafts],
      colDrafts: [...colDrafts]
    }]);
  }, [board, colors, notes, rowDrafts, colDrafts]);

  const initGame = useCallback((newDifficulty = 'medium', isNewGame = true) => {
    setDifficulty(newDifficulty);

    if (isNewGame) {
      const { puzzle, answer: correctAnswer } = generatePuzzle(newDifficulty);
      setBoard(puzzle.map(row => [...row]));
      setInitialBoard(puzzle.map(row => [...row]));
      setAnswer(correctAnswer.map(row => [...row]));
      setColors(generateEmptyMatrix(null));
      setNotes(generateEmptyNotes());
      setRowDrafts(generateEmptyArray(''));
      setColDrafts(generateEmptyArray(''));
      setHistory([]);
      setErrors(generateEmptyMatrix(false));
      setSelectedCell({ row: null, col: null });
    } else {
      const savedState = localStorage.getItem(STORAGE_KEY);
      if (savedState) {
        try {
          const parsed = JSON.parse(savedState);
          setBoard(parsed.board);
          setInitialBoard(parsed.initialBoard || parsed.board);
          setAnswer(parsed.answer);
          setDifficulty(parsed.difficulty);
          setColors(parsed.colors || generateEmptyMatrix(null));
          setNotes(parsed.notes || generateEmptyNotes()); // 读取笔记
          setRowDrafts(parsed.rowDrafts || generateEmptyArray(''));
          setColDrafts(parsed.colDrafts || generateEmptyArray(''));

          if (parsed.history && parsed.history.length > 0 && Array.isArray(parsed.history[0])) {
            setHistory([]);
          } else {
            setHistory(parsed.history || []);
          }
          setErrors(parsed.errors || generateEmptyMatrix(false));
        } catch (error) {
          console.error('Failed to restore game:', error);
          initGame(newDifficulty, true);
        }
      }
    }
  }, []);

  useEffect(() => {
    initGame('medium', false);
    setIsLoaded(true);
  }, [initGame]);

  useEffect(() => {
    if (isLoaded && board && board[0] && board[0].length === 9) {
      const gameState = {
        board, initialBoard, answer, difficulty, history, errors,
        colors, notes, rowDrafts, colDrafts,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
    }
  }, [board, initialBoard, answer, difficulty, history, errors, colors, notes, rowDrafts, colDrafts, isLoaded]);

  // --- 操作功能 ---

  const setCellValue = useCallback((row, col, value) => {
    if (!board || !board[row]) return { success: false };
    if (answer[row][col] !== 0 && initialBoard[row][col] !== 0) return { success: false };

    saveHistory();

    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = value;
    setBoard(newBoard);

    // 【新增】无论填入数字还是擦除(0)，都把该格子的笔记清空
    const newNotes = notes.map(r => r.map(c => [...c]));
    newNotes[row][col] = [];
    setNotes(newNotes);

    if (value === 0) {
      const newColors = colors.map(r => [...r]);
      newColors[row][col] = null;
      setColors(newColors);
    }

    if (errors[row][col]) {
      const newErrors = errors.map(r => [...r]);
      newErrors[row][col] = false;
      setErrors(newErrors);
    }
    return { success: true };
  }, [board, answer, initialBoard, errors, colors, notes, saveHistory]);

  const setCellColor = useCallback((row, col, color) => {
    if (row >= 9 || col >= 9) return;
    saveHistory();
    const newColors = colors.map(r => [...r]);
    newColors[row][col] = newColors[row][col] === color ? null : color;
    setColors(newColors);
  }, [colors, saveHistory]);

  // 【新增】内嵌笔记逻辑
  const toggleNote = useCallback((row, col, value) => {
    if (row >= 9 || col >= 9) return;
    if (board[row][col] !== 0) return; // 只有空格子才能记笔记

    saveHistory();
    const newNotes = notes.map(r => r.map(c => [...c]));
    const cellNotes = newNotes[row][col];

    if (cellNotes.includes(value)) {
      newNotes[row][col] = cellNotes.filter(n => n !== value); // 有则删
    } else {
      newNotes[row][col] = [...cellNotes, value].sort(); // 无则加并排序
    }
    setNotes(newNotes);
  }, [board, notes, saveHistory]);

  const toggleDraft = useCallback((type, index, value) => {
    saveHistory();
    const strVal = value.toString();
    if (type === 'row') {
      setRowDrafts(prev => {
        const newDrafts = [...prev];
        let current = newDrafts[index];
        current = current.includes(strVal) ? current.replace(strVal, '') : current + strVal;
        newDrafts[index] = current.split('').sort().join('');
        return newDrafts;
      });
    } else {
      setColDrafts(prev => {
        const newDrafts = [...prev];
        let current = newDrafts[index];
        current = current.includes(strVal) ? current.replace(strVal, '') : current + strVal;
        newDrafts[index] = current.split('').sort().join('');
        return newDrafts;
      });
    }
  }, [saveHistory]);

  const clearDraft = useCallback((type, index) => {
    saveHistory();
    if (type === 'row') {
      setRowDrafts(prev => { const n = [...prev]; n[index] = ''; return n; });
    } else {
      setColDrafts(prev => { const n = [...prev]; n[index] = ''; return n; });
    }
  }, [saveHistory]);

  const restartCurrentGame = useCallback(() => {
    if (!initialBoard || !initialBoard[0]) return;
    setBoard(initialBoard.map(row => [...row]));
    setColors(generateEmptyMatrix(null));
    setNotes(generateEmptyNotes()); // 清空笔记
    setRowDrafts(generateEmptyArray(''));
    setColDrafts(generateEmptyArray(''));
    setHistory([]);
    setErrors(generateEmptyMatrix(false));
    setSelectedCell({ row: null, col: null });
  }, [initialBoard]);


// 恢复绝对的真理校验：直接对比 answer
  const checkBoard = useCallback(() => {
    if (!board || !answer) return;
    const newErrors = generateEmptyMatrix(false);
    let hasError = false;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        // 只要填了，且跟最终唯一答案不一样，就是错的（防止玩家走入死胡同）
        if (board[r][c] !== 0 && board[r][c] !== answer[r][c]) {
          newErrors[r][c] = true;
          hasError = true;
        }
      }
    }
    setErrors(newErrors);
    return hasError;
  }, [board, answer]);

  const undo = useCallback(() => {
    if (history.length === 0) return;
    const previousState = history[history.length - 1];
    setBoard(previousState.board);
    setColors(previousState.colors);
    setNotes(previousState.notes); // 恢复笔记
    setRowDrafts(previousState.rowDrafts);
    setColDrafts(previousState.colDrafts);

    setHistory(prev => prev.slice(0, -1));
    setErrors(generateEmptyMatrix(false));
  }, [history]);

  const getHint = useCallback((row, col) => {
    if (row === null || col === null || row >= 9 || col >= 9) return { success: false, message: '请选择有效的主棋盘格子' };
    if (!answer || !answer[row]) return { success: false };
    const correctValue = answer[row][col];
    if (board[row][col] === correctValue) return { success: false };
    return setCellValue(row, col, correctValue);
  }, [answer, board, setCellValue]);

  const isGameComplete = useCallback(() => {
    if (!board || !answer || board[0][0] === undefined) return false;
    if (answer[0][0] === 0) return false;

    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (board[i][j] !== answer[i][j]) return false;
      }
    }
    return true;
  }, [board, answer]);

  return {
    isLoaded, board, initialBoard, answer, difficulty, history, errors,
    colors, notes, rowDrafts, colDrafts,
    selectedCell, setSelectedCell, initGame, setCellValue, isGameComplete,
    setCellColor, toggleNote, toggleDraft, clearDraft,
    undo, getHint, restartCurrentGame, checkBoard
  };
}