import React, { useState, useMemo } from 'react';
import { useI18n } from '../hooks/useI18n';

export default function SudokuBoard({
                                        board, answer, initialBoard, errors,
                                        colors, notes, rowDrafts, colDrafts,
                                        selectedCell, setSelectedCell, setCellValue,
                                        setCellColor, toggleNote, toggleDraft, clearDraft
                                    }) {
    const [activeNumber, setActiveNumber] = useState(null);
    const [isNotesMode, setIsNotesMode] = useState(false);
    const { t } = useI18n();
    const numberCounts = useMemo(() => {
        const counts = Array(10).fill(0);
        if (board && board.length === 9) {
            for (let r = 0; r < 9; r++) {
                for (let c = 0; c < 9; c++) {
                    if (board[r] && board[r][c] !== 0) { counts[board[r][c]]++; }
                }
            }
        }
        return counts;
    }, [board]);

    if (!board || board.length === 0 || !answer || answer.length === 0) {
        return <div className="text-xl font-bold text-gray-500 animate-pulse">{t('generating')}</div>;
    }

    const isInitialCell = (row, col) => {
        if (row >= 9 || col >= 9) return false;
        if (!initialBoard || !initialBoard[row]) return false;
        return initialBoard[row][col] !== 0;
    };

    const handleCellClick = (row, col) => {
        setSelectedCell({ row, col });
        if (row < 9 && col < 9 && board[row][col] !== 0) {
            setActiveNumber(board[row][col]);
        } else {
            setActiveNumber(null);
        }
    };

    const handleKeypadClick = (num) => {
        setActiveNumber(num);
        const { row, col } = selectedCell;
        if (row === null || col === null) return;

        if (row < 9 && col < 9) {
            if (!isInitialCell(row, col)) {
                if (isNotesMode) {
                    toggleNote(row, col, num);
                } else {
                    setCellValue(row, col, num);
                }
            }
        } else if (row === 9 && col < 9) {
            toggleDraft('col', col, num);
        } else if (col === 9 && row < 9) {
            toggleDraft('row', row, num);
        }
    };

    const handleEraseClick = () => {
        const { row, col } = selectedCell;
        if (row === null || col === null) return;

        if (row < 9 && col < 9) {
            if (!isInitialCell(row, col)) setCellValue(row, col, 0);
        } else if (row === 9 && col < 9) {
            clearDraft('col', col);
        } else if (col === 9 && row < 9) {
            clearDraft('row', row);
        }
    };

    const handleColorClick = (colorClass) => {
        const { row, col } = selectedCell;
        if (row !== null && col !== null && row < 9 && col < 9) {
            setCellColor(row, col, colorClass);
        }
    };

    const isCellSelected = (r, c) => selectedCell.row === r && selectedCell.col === c;
    const isSameLine = (row, col) => {
        if (!selectedCell.row && selectedCell.row !== 0) return false;
        if (row >= 9 || col >= 9) return false;
        return (
            selectedCell.row === row || selectedCell.col === col ||
            Math.floor(selectedCell.row / 3) === Math.floor(row / 3) && Math.floor(selectedCell.col / 3) === Math.floor(col / 3)
        );
    };

    return (
        <div className="flex flex-col items-center w-full max-w-xl mx-auto">
            <div className="bg-white rounded-xl shadow-2xl p-4 sm:p-6 border border-gray-100 mb-6 w-full flex justify-center overflow-x-auto">
                <div className="grid grid-cols-[repeat(10,minmax(0,1fr))] gap-0 bg-white min-w-[320px] sm:min-w-[450px]">
                    {Array.from({ length: 10 }).map((_, rowIdx) =>
                        Array.from({ length: 10 }).map((_, colIdx) => {
                            const selected = isCellSelected(rowIdx, colIdx);

                            // 1. 右下角留空
                            if (rowIdx === 9 && colIdx === 9) {
                                return <div key="corner" className="border-none bg-transparent"></div>;
                            }

                            // 2. 右侧的行草稿区 (已升级为 3x3 内部网格显示)
                            if (colIdx === 9) {
                                const currentDraft = rowDrafts[rowIdx] || '';
                                return (
                                    <div key={`draft-row-${rowIdx}`} onClick={() => handleCellClick(rowIdx, colIdx)}
                                         className={`relative flex items-center justify-center cursor-pointer transition-colors border border-dashed border-slate-300 ml-1 rounded-sm ${selected ? 'bg-amber-100 ring-2 ring-amber-400 z-10' : 'bg-slate-50 hover:bg-slate-100'}`}
                                         style={{ aspectRatio: '1/1' }}
                                    >
                                        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 p-0.5 pointer-events-none">
                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                                                <div key={n} className={`flex items-center justify-center text-[10px] sm:text-[12px] leading-none ${currentDraft.includes(n.toString()) ? 'text-slate-500 font-semibold' : 'text-transparent'}`}>
                                                    {currentDraft.includes(n.toString()) ? n : ''}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            }

                            // 3. 下方的列草稿区 (已升级为 3x3 内部网格显示)
                            if (rowIdx === 9) {
                                const currentDraft = colDrafts[colIdx] || '';
                                return (
                                    <div key={`draft-col-${colIdx}`} onClick={() => handleCellClick(rowIdx, colIdx)}
                                         className={`relative flex items-center justify-center cursor-pointer transition-colors border border-dashed border-slate-300 mt-1 rounded-sm ${selected ? 'bg-amber-100 ring-2 ring-amber-400 z-10' : 'bg-slate-50 hover:bg-slate-100'}`}
                                         style={{ aspectRatio: '1/1' }}
                                    >
                                        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 p-0.5 pointer-events-none">
                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                                                <div key={n} className={`flex items-center justify-center text-[10px] sm:text-[12px] leading-none ${currentDraft.includes(n.toString()) ? 'text-slate-500 font-semibold' : 'text-transparent'}`}>
                                                    {currentDraft.includes(n.toString()) ? n : ''}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            }

                            // 4. 标准的 9x9 数独格子
                            const cellValue = board[rowIdx][colIdx];
                            const isInitial = isInitialCell(rowIdx, colIdx);
                            const hasError = errors[rowIdx] && errors[rowIdx][colIdx];
                            const sameLineHighlight = isSameLine(rowIdx, colIdx) && !selected;
                            const isNumberActive = cellValue !== 0 && cellValue === activeNumber && !selected;
                            const cellColor = colors[rowIdx][colIdx];
                            const cellNotes = notes[rowIdx][colIdx];

                            const isRightThick = colIdx === 2 || colIdx === 5 || colIdx === 8;
                            const isBottomThick = rowIdx === 2 || rowIdx === 5 || rowIdx === 8;
                            const isTopThick = rowIdx === 0;
                            const isLeftThick = colIdx === 0;

                            return (
                                <div
                                    key={`${rowIdx}-${colIdx}`}
                                    onClick={() => handleCellClick(rowIdx, colIdx)}
                                    className={`
                    relative flex items-center justify-center text-xl sm:text-3xl transition-all duration-200 select-none cursor-pointer
                    ${isInitial ? 'text-slate-900 font-black' : 'text-indigo-600 font-medium'}
                    border border-slate-300
                    ${isRightThick ? 'border-r-4 border-r-slate-800' : ''}
                    ${isBottomThick ? 'border-b-4 border-b-slate-800' : ''}
                    ${isTopThick ? 'border-t-4 border-t-slate-800' : ''}
                    ${isLeftThick ? 'border-l-4 border-l-slate-800' : ''}
                    
                    ${hasError ? 'bg-red-200 text-red-600 font-bold' : ''}
                    ${selected && !hasError ? 'bg-indigo-200 ring-inset ring-4 ring-indigo-500 z-10' : ''}
                    ${!selected && !hasError && isNumberActive ? 'bg-indigo-300 text-indigo-900 font-bold z-10' : ''}
                    
                    ${!selected && !hasError && !isNumberActive && cellColor ? cellColor : ''}
                    ${!selected && !hasError && !isNumberActive && !cellColor && sameLineHighlight ? 'bg-indigo-50/60' : ''}
                    ${!selected && !hasError && !isNumberActive && !cellColor && !sameLineHighlight ? 'bg-white' : ''}
                  `}
                                    style={{ aspectRatio: '1/1' }}
                                >
                                    {cellValue !== 0 ? (
                                        cellValue
                                    ) : (
                                        cellNotes.length > 0 && (
                                            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 p-0.5 pointer-events-none">
                                                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                                                    <div key={n} className={`flex items-center justify-center text-[10px] sm:text-[12px] leading-none ${cellNotes.includes(n) ? 'text-slate-500 font-semibold' : 'text-transparent'}`}>
                                                        {cellNotes.includes(n) ? n : ''}
                                                    </div>
                                                ))}
                                            </div>
                                        )
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            <div className="w-full max-w-md px-2">
                <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl shadow-sm mb-4 border border-slate-100">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-600">{t('boardInfo.marks')}</span>
                        <div className="flex gap-2 sm:gap-3">
                            <button onClick={() => handleColorClick('bg-fuchsia-200')} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-fuchsia-200 ring-2 ring-transparent hover:ring-fuchsia-400 transition-all"></button>
                            <button onClick={() => handleColorClick('bg-yellow-200')} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-yellow-200 ring-2 ring-transparent hover:ring-yellow-400 transition-all"></button>
                            <button onClick={() => handleColorClick('bg-rose-200')} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-rose-200 ring-2 ring-transparent hover:ring-rose-400 transition-all"></button>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsNotesMode(!isNotesMode)}
                        className={`flex items-center gap-1 px-4 py-1.5 rounded-full font-bold text-sm sm:text-base transition-all duration-200
              ${isNotesMode ? 'bg-slate-800 text-white shadow-md scale-105' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                        {t('boardInfo.notes')} {isNotesMode ? t('boardInfo.on') : t('boardInfo.off')}
                    </button>
                </div>

                <div className="grid grid-cols-5 gap-1.5 sm:gap-3 mb-2 sm:mb-3">
                    {[1, 2, 3, 4, 5].map((num) => {
                        const isCompleted = numberCounts[num] >= 9;
                        return (
                            <button key={num} onClick={() => handleKeypadClick(num)}
                                    className={`h-12 sm:h-16 rounded-lg text-xl sm:text-2xl font-bold shadow-md transition-all duration-150 active:scale-95
                  ${activeNumber === num ? 'bg-indigo-500 text-white ring-2 ring-offset-2 ring-indigo-500 scale-105' : 'bg-white text-slate-800 hover:bg-indigo-50'}
                  ${isCompleted ? 'opacity-40 grayscale pointer-events-none' : ''}`}
                            >
                                {num}
                            </button>
                        );
                    })}
                </div>
                <div className="grid grid-cols-5 gap-1.5 sm:gap-3">
                    {[6, 7, 8, 9].map((num) => {
                        const isCompleted = numberCounts[num] >= 9;
                        return (
                            <button key={num} onClick={() => handleKeypadClick(num)}
                                    className={`h-12 sm:h-16 rounded-lg text-xl sm:text-2xl font-bold shadow-md transition-all duration-150 active:scale-95
                  ${activeNumber === num ? 'bg-indigo-500 text-white ring-2 ring-offset-2 ring-indigo-500 scale-105' : 'bg-white text-slate-800 hover:bg-indigo-50'}
                  ${isCompleted ? 'opacity-40 grayscale pointer-events-none' : ''}`}
                            >
                                {num}
                            </button>
                        );
                    })}
                    <button onClick={handleEraseClick} className="h-12 sm:h-16 rounded-lg bg-rose-100 text-rose-600 hover:bg-rose-200 text-xl font-bold shadow-md transition-all duration-150 active:scale-95 flex items-center justify-center">
                        {t('actions.clear')}
                    </button>
                </div>
            </div>
        </div>
    );
}