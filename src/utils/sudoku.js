// src/utils/sudoku.js

// 基础规则校验：检查当前数字在行列宫是否合法
export const isValid = (board, row, col, num) => {
  for (let i = 0; i < 9; i++) {
    // 检查行和列
    if (board[row][i] === num && i !== col) return false;
    if (board[i][col] === num && i !== row) return false;

    // 检查九宫格
    const boxRow = Math.floor(row / 3) * 3 + Math.floor(i / 3);
    const boxCol = Math.floor(col / 3) * 3 + (i % 3);
    if (board[boxRow][boxCol] === num && (boxRow !== row || boxCol !== col)) return false;
  }
  return true;
};

// 工具：打乱数组（用于生成随机终盘）
const shuffle = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

// 核心算法 1：DFS 生成一个完美的随机完整棋盘 (终盘)
const fillBoard = (board) => {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) {
        const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        for (let num of nums) {
          if (isValid(board, row, col, num)) {
            board[row][col] = num;
            if (fillBoard(board)) return true;
            board[row][col] = 0; // 回溯
          }
        }
        return false; // 走不通
      }
    }
  }
  return true; // 填满了
};

// 核心算法 2：求解器，用于计算当前残局有多少个解
const countSolutions = (board, countObj) => {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) {
        for (let num = 1; num <= 9; num++) {
          if (isValid(board, row, col, num)) {
            board[row][col] = num;
            countSolutions(board, countObj);
            // 优化：只要发现解的数量大于 1，立刻停止搜索（我们不需要知道具体有几个解，只要知道不是唯一解就行）
            if (countObj.count > 1) {
              board[row][col] = 0;
              return;
            }
            board[row][col] = 0;
          }
        }
        return;
      }
    }
  }
  countObj.count++;
};

// 终极生成器：带唯一解校验的挖洞算法
export const generatePuzzle = (difficulty) => {
  // 1. 生成空盘并填满
  const answer = Array(9).fill(null).map(() => Array(9).fill(0));
  fillBoard(answer);

  // 2. 复制一份用来挖洞
  const puzzle = answer.map(row => [...row]);

  // 根据难度设定需要挖掉的孔洞数量
  let holesToDig = 0;
  if (difficulty === 'easy') holesToDig = 30; // 简单留 51 个数字
  else if (difficulty === 'medium') holesToDig = 45; // 中等留 36 个数字
  else holesToDig = 55; // 困难留 26 个数字

  // 记录所有可以挖的坐标，打乱顺序尝试
  const positions = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      positions.push({ r, c });
    }
  }
  shuffle(positions);

  // 3. 开始极其严谨的挖洞过程
  for (let pos of positions) {
    if (holesToDig <= 0) break;

    const { r, c } = pos;
    const backup = puzzle[r][c];

    // 抠掉这个洞
    puzzle[r][c] = 0;

    // 严厉校验：抠掉之后，这个残局还是不是唯一解？
    let solutionCount = { count: 0 };
    // 拷贝一份当前残局丢进求解器
    const tempBoardForSolving = puzzle.map(row => [...row]);
    countSolutions(tempBoardForSolving, solutionCount);

    if (solutionCount.count === 1) {
      // 成功！这个洞挖得好，确实只有一个解
      holesToDig--;
    } else {
      // 失败！挖掉这个洞会导致多解，赶紧把它填回去
      puzzle[r][c] = backup;
    }
  }

  // 返回生成的残局和它对应的唯一正确答案
  return { puzzle, answer };
};