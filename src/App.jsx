import React, { useEffect } from 'react';
import { useSudoku } from './hooks/useSudoku';
import { useTimer } from './hooks/useTimer';
import SudokuBoard from './components/SudokuBoard';

export default function App() {
  const {
    isLoaded, board, initialBoard, answer, errors,
    colors, rowDrafts, colDrafts, // 获取新状态
    selectedCell, setSelectedCell, difficulty, initGame, setCellValue,
    setCellColor, toggleDraft, clearDraft, // 获取新方法
    isGameComplete, undo, history, getHint,
    restartCurrentGame, checkBoard
  } = useSudoku();

  const { formatTime, resetTimer } = useTimer(!isGameComplete() && isLoaded);

  const handleDifficultyChange = (newDifficulty) => {
    initGame(newDifficulty, true);
    resetTimer();
  };

  const handleRestartNew = () => {
    initGame(difficulty, true);
    resetTimer();
  };

  const handleRestartCurrent = () => {
    if(window.confirm("确定要清空已填写的进度，重玩这一局吗？")) {
      restartCurrentGame();
      resetTimer();
    }
  };

  const handleHintClick = () => {
    if (selectedCell.row === null) {
      alert("请先点击选中一个需要提示的空白格子哦！");
      return;
    }
    getHint(selectedCell.row, selectedCell.col);
  };

  const handleCheckClick = () => {
    const hasError = checkBoard();
    if (!hasError) {
      // 可选：给个没出错的提示反馈，情绪拉满
      alert("太棒了！目前填入的数字全部正确！继续保持！✨");
    }
  };

  if (!isLoaded) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
          <div className="text-xl text-gray-600 animate-pulse">加载记忆档案中...</div>
        </div>
    );
  }

  return (
      // 适配手机，干掉下拉刷新
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pb-10 overscroll-none touch-pan-y">
        <div className="bg-white shadow-md sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h1 className="text-2xl sm:text-4xl font-bold text-gray-800">
                FanNike宝数独
              </h1>
              <div
                  className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-4 py-2 rounded-lg font-mono text-xl sm:text-2xl font-bold shadow-inner">
                ⏱ {formatTime()}
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {/* 左侧：难度选择 */}
              <div className="flex gap-2 sm:gap-3 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                {['easy', 'medium', 'hard'].map((diff) => (
                    <button
                        key={diff}
                        onClick={() => handleDifficultyChange(diff)}
                        className={`px-4 py-2 rounded-md font-semibold transition-all flex-shrink-0 ${
                            difficulty === diff
                                ? 'bg-blue-500 text-white shadow-md scale-105'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                      {diff === 'easy' ? '简单' : diff === 'medium' ? '中等' : '困难'}
                    </button>
                ))}
              </div>

              {/* 右侧：功能控制按钮组 */}
              {/* 手机上变成 3列+2列 的整齐网格，Pad/电脑上恢复成横向单排 */}
              <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-2 w-full sm:w-auto justify-center sm:justify-end">                <button onClick={undo} disabled={history.length === 0}
                        className={`px-3 py-2 rounded-md font-semibold transition-all shadow-sm flex items-center gap-1 ${history.length === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-amber-100 text-amber-700 hover:bg-amber-200 active:scale-95'}`}>
                  ↩️ 撤销
                </button>

                <button onClick={handleHintClick}
                        className="px-3 py-2 bg-purple-100 text-purple-700 rounded-md font-semibold hover:bg-purple-200 transition-all shadow-sm active:scale-95 flex items-center gap-1">
                  💡 提示
                </button>

                <button onClick={handleCheckClick}
                        className="px-3 py-2 bg-sky-100 text-sky-700 rounded-md font-semibold hover:bg-sky-200 transition-all shadow-sm active:scale-95 flex items-center gap-1">
                  🔍 校验
                </button>

                <button onClick={handleRestartCurrent}
                        className="px-3 py-2 bg-orange-100 text-orange-700 rounded-md font-semibold hover:bg-orange-200 transition-all shadow-sm active:scale-95 flex items-center gap-1">
                  🔁 重玩
                </button>

                <button onClick={handleRestartNew}
                        className="px-3 py-2 bg-emerald-500 text-white rounded-md font-semibold hover:bg-emerald-600 transition-all shadow-sm active:scale-95 flex items-center gap-1">
                  🆕 新局
                </button>
              </div>
            </div>

            {isGameComplete() && (
                <div className="mt-4 text-center">
                  <div
                      className="inline-block bg-green-100 border-2 border-green-500 text-green-700 px-6 py-3 rounded-xl font-bold text-xl animate-bounce shadow-lg">
                    🎉 太棒了，挑战成功！用时：{formatTime()}
                  </div>
                </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-center py-6 sm:py-8 px-2 sm:px-4">
          <SudokuBoard
              board={board}
              initialBoard={initialBoard}
              answer={answer}
              errors={errors}
              colors={colors}
              rowDrafts={rowDrafts}
              colDrafts={colDrafts}
              selectedCell={selectedCell}
              setSelectedCell={setSelectedCell}
              initGame={initGame}
              setCellValue={setCellValue}
              setCellColor={setCellColor}
              toggleDraft={toggleDraft}
              clearDraft={clearDraft}
          />
        </div>
      </div>
  );
}