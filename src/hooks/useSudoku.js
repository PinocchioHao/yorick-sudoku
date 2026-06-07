import { useState, useCallback, useEffect } from 'react';
import { generatePuzzle, isValid } from '../utils/sudoku';

const STORAGE_KEY = 'sudoku_game_state';

// 辅助函数：生成全 false 的 9x9 矩阵
const generateEmptyErrors = () => Array(9).fill(null).map(() => Array(9).fill(false));

export function useSudoku() {
  const [board, setBoard] = useState(Array(9).fill(null).map(() => Array(9).fill(0)));
  // 【新增】保存这一局初始挖空的盘面，用于“重玩本局”
  const [initialBoard, setInitialBoard] = useState(Array(9).fill(null).map(() => Array(9).fill(0)));
  const [answer, setAnswer] = useState(Array(9).fill(null).map(() => Array(9).fill(0)));
  const [difficulty, setDifficulty] = useState('medium');
  const [selectedCell, setSelectedCell] = useState({ row: null, col: null });
  const [history, setHistory] = useState([]);
  // 【新增】将错误状态提升到这里管理，解决残留 Bug
  const [errors, setErrors] = useState(generateEmptyErrors());
  const [isLoaded, setIsLoaded] = useState(false);

  const initGame = useCallback((newDifficulty = 'medium', isNewGame = true) => {
    setDifficulty(newDifficulty);

    if (isNewGame) {
      const { puzzle, answer: correctAnswer } = generatePuzzle(newDifficulty);
      const newInitialBoard = puzzle.map(row => [...row]);

      setBoard(puzzle.map(row => [...row]));
      setInitialBoard(newInitialBoard); // 记录底盘
      setAnswer(correctAnswer.map(row => [...row]));
      setHistory([]);
      setErrors(generateEmptyErrors()); // 新局清空错误
      setSelectedCell({ row: null, col: null });
    } else {
      const savedState = localStorage.getItem(STORAGE_KEY);
      if (savedState) {
        try {
          const parsed = JSON.parse(savedState);
          setBoard(parsed.board);
          setInitialBoard(parsed.initialBoard || parsed.board); // 兼容旧存档
          setAnswer(parsed.answer);
          setDifficulty(parsed.difficulty);
          setHistory(parsed.history || []);
          setErrors(parsed.errors || generateEmptyErrors());
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
        board,
        initialBoard,
        answer,
        difficulty,
        history,
        errors,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
    }
  }, [board, initialBoard, answer, difficulty, history, errors, isLoaded]);

  const setCellValue = useCallback((row, col, value) => {
    if (!board || !board[row]) return { success: false };
    if (answer[row][col] !== 0 && initialBoard[row][col] !== 0) return { success: false };

    setHistory(prev => [...prev, board.map(r => [...r])]);

    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = value;
    setBoard(newBoard);

    // 【新增】当用户修改格子时，清除该格子的报错状态
    if (errors[row][col]) {
      const newErrors = errors.map(r => [...r]);
      newErrors[row][col] = false;
      setErrors(newErrors);
    }

    return { success: true };
  }, [board, answer, initialBoard, errors]);

  // 【新增功能 1】重玩本局
  const restartCurrentGame = useCallback(() => {
    if (!initialBoard || !initialBoard[0]) return;
    setBoard(initialBoard.map(row => [...row]));
    setHistory([]);
    setErrors(generateEmptyErrors());
    setSelectedCell({ row: null, col: null });
  }, [initialBoard]);

  // 【新增功能 2】手动校验盘面：对比当前输入和正确答案
  const checkBoard = useCallback(() => {
    if (!board || !answer) return;
    const newErrors = generateEmptyErrors();
    let hasError = false;

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        // 如果填了数字，且和答案不一致，则标红
        if (board[r][c] !== 0 && board[r][c] !== answer[r][c]) {
          newErrors[r][c] = true;
          hasError = true;
        }
      }
    }
    setErrors(newErrors);
    return hasError; // 可以返回是否出错，供 UI 弹窗使用
  }, [board, answer]);

  const undo = useCallback(() => {
    if (history.length === 0) return;
    const previousBoard = history[history.length - 1];
    setBoard(previousBoard);
    setHistory(prev => prev.slice(0, -1));
    // 撤销时最好也清理一下错误高亮
    setErrors(generateEmptyErrors());
  }, [history]);

  const getHint = useCallback((row, col) => {
    if (row === null || col === null) return { success: false, message: '请先选择一个格子' };
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
    selectedCell, setSelectedCell, initGame, setCellValue, isGameComplete,
    undo, getHint, restartCurrentGame, checkBoard
  };
}