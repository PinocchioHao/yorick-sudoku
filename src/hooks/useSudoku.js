import { useState, useCallback, useEffect } from 'react';
import { generatePuzzle, isValid } from '../utils/sudoku';

const STORAGE_KEY = 'sudoku_game_state';

const generateEmptyMatrix = (val) => Array(9).fill(null).map(() => Array(9).fill(val));
const generateEmptyArray = (val) => Array(9).fill(val);

export function useSudoku() {
  const [board, setBoard] = useState(generateEmptyMatrix(0));
  const [initialBoard, setInitialBoard] = useState(generateEmptyMatrix(0));
  const [answer, setAnswer] = useState(generateEmptyMatrix(0));
  const [difficulty, setDifficulty] = useState('medium');

  // 【新增】自定义颜色与行列草稿状态
  const [colors, setColors] = useState(generateEmptyMatrix(null));
  const [rowDrafts, setRowDrafts] = useState(generateEmptyArray(''));
  const [colDrafts, setColDrafts] = useState(generateEmptyArray(''));

  const [selectedCell, setSelectedCell] = useState({ row: null, col: null });
  const [history, setHistory] = useState([]);
  const [errors, setErrors] = useState(generateEmptyMatrix(false));
  const [isLoaded, setIsLoaded] = useState(false);

  // 【核心】将当前所有状态打包存入历史（用于完美的撤销功能）
  const saveHistory = useCallback(() => {
    setHistory(prev => [...prev, {
      board: board.map(r => [...r]),
      colors: colors.map(r => [...r]),
      rowDrafts: [...rowDrafts],
      colDrafts: [...colDrafts]
    }]);
  }, [board, colors, rowDrafts, colDrafts]);

  const initGame = useCallback((newDifficulty = 'medium', isNewGame = true) => {
    setDifficulty(newDifficulty);

    if (isNewGame) {
      const { puzzle, answer: correctAnswer } = generatePuzzle(newDifficulty);
      setBoard(puzzle.map(row => [...row]));
      setInitialBoard(puzzle.map(row => [...row]));
      setAnswer(correctAnswer.map(row => [...row]));
      setColors(generateEmptyMatrix(null));
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
          setRowDrafts(parsed.rowDrafts || generateEmptyArray(''));
          setColDrafts(parsed.colDrafts || generateEmptyArray(''));

          // 兼容旧版本的 history 格式（如果是纯数组，则清空避免崩溃）
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
        colors, rowDrafts, colDrafts, // 存档也要存入颜色和草稿
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
    }
  }, [board, initialBoard, answer, difficulty, history, errors, colors, rowDrafts, colDrafts, isLoaded]);

  // --- 操作功能 ---

  const setCellValue = useCallback((row, col, value) => {
    if (!board || !board[row]) return { success: false };
    if (answer[row][col] !== 0 && initialBoard[row][col] !== 0) return { success: false };

    saveHistory();

    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = value;
    setBoard(newBoard);

    // 如果是清除操作(0)，同时清除颜色
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
  }, [board, answer, initialBoard, errors, colors, saveHistory]);

  // 【新增】设置格子颜色
  const setCellColor = useCallback((row, col, color) => {
    if (row >= 9 || col >= 9) return; // 草稿区不染色
    saveHistory();
    const newColors = colors.map(r => [...r]);
    // 如果点相同的颜色，则取消染色
    newColors[row][col] = newColors[row][col] === color ? null : color;
    setColors(newColors);
  }, [colors, saveHistory]);

  // 【新增】切换草稿区的数字
  const toggleDraft = useCallback((type, index, value) => {
    saveHistory();
    const strVal = value.toString();
    if (type === 'row') {
      setRowDrafts(prev => {
        const newDrafts = [...prev];
        let current = newDrafts[index];
        current = current.includes(strVal) ? current.replace(strVal, '') : current + strVal;
        newDrafts[index] = current.split('').sort().join(''); // 自动排序，例如 "312" -> "123"
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

  // 【新增】一键清空草稿格子
  const clearDraft = useCallback((type, index) => {
    saveHistory();
    if (type === 'row') {
      setRowDrafts(prev => { const n = [...prev]; n[index] = ''; return n; });
    } else {
      setColDrafts(prev => { const n = [...prev]; n[index] = ''; return n; });
    }
  }, [saveHistory]);

  // --- 控制功能 ---

  const restartCurrentGame = useCallback(() => {
    if (!initialBoard || !initialBoard[0]) return;
    setBoard(initialBoard.map(row => [...row]));
    setColors(generateEmptyMatrix(null));
    setRowDrafts(generateEmptyArray(''));
    setColDrafts(generateEmptyArray(''));
    setHistory([]);
    setErrors(generateEmptyMatrix(false));
    setSelectedCell({ row: null, col: null });
  }, [initialBoard]);

  const checkBoard = useCallback(() => {
    if (!board || !answer) return;
    const newErrors = generateEmptyMatrix(false);
    let hasError = false;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
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
    setRowDrafts(previousState.rowDrafts);
    setColDrafts(previousState.colDrafts);

    setHistory(prev => prev.slice(0, -1));
    setErrors(generateEmptyMatrix(false)); // 撤销时清空红框
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
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (board[i][j] !== answer[i][j]) return false;
      }
    }
    return true;
  }, [board, answer]);

  return {
    isLoaded, board, initialBoard, answer, difficulty, history, errors,
    colors, rowDrafts, colDrafts, // 抛出新状态
    selectedCell, setSelectedCell, initGame, setCellValue, isGameComplete,
    setCellColor, toggleDraft, clearDraft, // 抛出新方法
    undo, getHint, restartCurrentGame, checkBoard
  };
}