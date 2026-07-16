// src/App.jsx
import React, { useEffect } from 'react';
import { useSudoku } from './hooks/useSudoku';
import { useTimer } from './hooks/useTimer';
import { useI18n } from './hooks/useI18n';
import SudokuBoard from './components/SudokuBoard';

export default function App() {
  const {
    isLoaded, board, initialBoard, answer, errors,
    colors, notes, rowDrafts, colDrafts,
    selectedCell, setSelectedCell, difficulty, initGame, setCellValue,
    setCellColor, toggleNote, toggleDraft, clearDraft,
    isGameComplete, undo, history, getHint,
    restartCurrentGame, checkBoard
  } = useSudoku();

  const { formatTime, resetTimer } = useTimer(!isGameComplete() && isLoaded);
  // 👈 提取 t (翻译函数), language 和 toggleLanguage
  const { t, language, toggleLanguage } = useI18n();

  const handleDifficultyChange = (newDifficulty) => {
    initGame(newDifficulty, true);
    resetTimer();
  };

  const handleRestartNew = () => {
    initGame(difficulty, true);
    resetTimer();
  };

  const handleRestartCurrent = () => {
    // 👈 替换 alert 里的硬编码
    if(window.confirm(t('alerts.confirmRestart'))) {
      restartCurrentGame();
      resetTimer();
    }
  };

  const handleHintClick = () => {
    if (selectedCell.row === null) {
      alert(t('alerts.needSelectHint')); // 👈 替换
      return;
    }
    getHint(selectedCell.row, selectedCell.col);
  };

  const handleCheckClick = () => {
    const hasError = checkBoard();
    if (!hasError) {
      alert(t('alerts.checkSuccess')); // 👈 替换
    }
  };

  if (!isLoaded) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
          <div className="text-xl text-gray-600 animate-pulse">{t('loading')}</div>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-between overscroll-none touch-pan-y">
        <div>
          <div className="bg-white shadow-md sticky top-0 z-10">
            <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h1 className="text-2xl sm:text-4xl font-bold text-gray-800">
                  {t('appTitle')}
                </h1>

                <div className="flex items-center gap-3">
                  {/* 👈 新增：中英文切换开关 */}
                  <button
                      onClick={toggleLanguage}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-sm sm:text-base transition-colors border border-slate-200 shadow-sm"
                  >
                    {language === 'zh' ? '中' : 'EN'}
                  </button>
                  <div className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-4 py-2 rounded-lg font-mono text-xl sm:text-2xl font-bold shadow-inner">
                    ⏱ {formatTime()}
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <img
                      src="/meme.png"
                      alt="Fan"
                      className="w-12 h-12 rounded-full shadow-sm object-cover bg-indigo-50 border-2 border-indigo-200"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                  />
                  <div className="hidden w-12 h-12 rounded-full shadow-sm bg-indigo-100 items-center justify-center text-2xl border-2 border-indigo-200">
                    🥰
                  </div>

                  <div className="flex flex-wrap gap-2 sm:gap-3 w-full md:w-auto">
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
                          {/* 👈 替换难度按钮 */}
                          {t(`difficulty.${diff}`)}
                        </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-2 w-full md:w-auto justify-center sm:justify-end">
                  {/* 👈 替换所有控制按钮 */}
                  <button onClick={undo} disabled={history.length === 0} className={`px-3 py-2 rounded-md font-semibold transition-all shadow-sm flex items-center justify-center gap-1 ${history.length === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-amber-100 text-amber-700 hover:bg-amber-200 active:scale-95'}`}>
                    {t('actions.undo')}
                  </button>
                  <button onClick={handleHintClick} className="px-3 py-2 bg-purple-100 text-purple-700 rounded-md font-semibold hover:bg-purple-200 transition-all shadow-sm active:scale-95 flex items-center justify-center gap-1">
                    {t('actions.hint')}
                  </button>
                  <button onClick={handleCheckClick} className="px-3 py-2 bg-sky-100 text-sky-700 rounded-md font-semibold hover:bg-sky-200 transition-all shadow-sm active:scale-95 flex items-center justify-center gap-1">
                    {t('actions.check')}
                  </button>
                  <button onClick={handleRestartCurrent} className="px-3 py-2 bg-orange-100 text-orange-700 rounded-md font-semibold hover:bg-orange-200 transition-all shadow-sm active:scale-95 flex items-center justify-center gap-1">
                    {t('actions.restart')}
                  </button>
                  <button onClick={handleRestartNew} className="px-3 py-2 bg-emerald-500 text-white rounded-md font-semibold hover:bg-emerald-600 transition-all shadow-sm active:scale-95 flex items-center justify-center gap-1">
                    {t('actions.newGame')}
                  </button>
                </div>
              </div>

              {isGameComplete() && (
                  <div className="mt-4 text-center">
                    <div className="inline-block bg-green-100 border-2 border-green-500 text-green-700 px-6 py-3 rounded-xl font-bold text-xl animate-bounce shadow-lg">
                      {t('successMessage')}{formatTime()} {/* 👈 替换 */}
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
                notes={notes}
                rowDrafts={rowDrafts}
                colDrafts={colDrafts}
                selectedCell={selectedCell}
                setSelectedCell={setSelectedCell}
                initGame={initGame}
                setCellValue={setCellValue}
                setCellColor={setCellColor}
                toggleNote={toggleNote}
                toggleDraft={toggleDraft}
                clearDraft={clearDraft}
            />
          </div>
        </div>

        {/* 👈 替换底部广告位 */}
        <div className="py-8 text-center text-slate-400 font-medium tracking-wider">
          <p>{t('footer.adSpace')}</p>
          <p className="mt-1">{t('footer.contact')}</p>
        </div>

      </div>
  );
}