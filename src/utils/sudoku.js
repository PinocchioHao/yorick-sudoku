// // 检查数字是否能放在指定位置
function isValid(board, row, col, num) {
  // 检查行
  for (let i = 0; i < 9; i++) {
    if (board[row][i] === num) return false;
  }

  // 检查列
  for (let i = 0; i < 9; i++) {
    if (board[i][col] === num) return false;
  }

  // 检查 3x3 宫格
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let i = boxRow; i < boxRow + 3; i++) {
    for (let j = boxCol; j < boxCol + 3; j++) {
      if (board[i][j] === num) return false;
    }
  }

  return true;
}

// 使用回溯算法生成完整的数独终盘
function generateSudoku() {
  const board = Array(9).fill(null).map(() => Array(9).fill(0));

  function backtrack() {
    // 找到下一个空格
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === 0) {
          // 随机尝试 1-9
          const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);

          for (const num of nums) {
            if (isValid(board, row, col, num)) {
              board[row][col] = num;

              if (backtrack()) return true;

              board[row][col] = 0;
            }
          }

          return false;
        }
      }
    }
    return true;
  }

  backtrack();
  return board;
}

// 深拷贝二维数组
function deepCopyBoard(board) {
  return board.map(row => [...row]);
}

// 根据难度挖空生成题目
function generatePuzzle(difficulty = 'medium') {
  const answer = generateSudoku();
  const puzzle = deepCopyBoard(answer);

  // 定义难度对应的挖空数量
  const difficultyMap = {
    easy: 35,      // 简单：挖 35 个空
    medium: 45,    // 中等：挖 45 个空
    hard: 55       // 困难：挖 55 个空
  };

  const cellsToRemove = difficultyMap[difficulty] || difficultyMap.medium;
  let removed = 0;

  while (removed < cellsToRemove) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);

    if (puzzle[row][col] !== 0) {
      puzzle[row][col] = 0;
      removed++;
    }
  }

  return {
    puzzle,
    answer
  };
}

// 导出函数
export { generateSudoku, generatePuzzle, isValid };

// 请帮我用 JavaScript 写一个数独核心算法。需要包含：1. 使用回溯算法（DFS）生成一个完整的、合法的 9x9 数独终盘数组；2. 编写一个根据难度（简单、中等、困难）随机挖空的函数，返回一个带有空格（用 0 表示）的题目数组和对应的答案数组。
