import React, { useState, useMemo } from 'react';

export default function SudokuBoard({
                                        board, answer, initialBoard, errors,
                                        colors, rowDrafts, colDrafts,
                                        selectedCell, setSelectedCell, setCellValue,
                                        setCellColor, toggleDraft, clearDraft
                                    }) {
    const [activeNumber, setActiveNumber] = useState(null);

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
        return <div className="text-xl font-bold text-gray-500 animate-pulse">正在生成棋盘...</div>;
    }

    const isInitialCell = (row, col) => {
        if (row >= 9 || col >= 9) return false;
        if (!initialBoard || !initialBoard[row]) return false;
        return initialBoard[row][col] !== 0;
    };

    const handleCellClick = (row, col) => {
        setSelectedCell({ row, col });

        // 如果点击主棋盘上的数字，触发高亮联动
        if (row < 9 && col < 9 && board[row][col] !== 0) {
            setActiveNumber(board[row][col]);
        } else {
            // 【修改点】点击空白格或者边缘的草稿区时，取消上一次的数字高亮
            setActiveNumber(null);
        }
    };

    // 处理键盘点击（支持填标准数字 或 记草稿）
    const handleKeypadClick = (num) => {
        setActiveNumber(num);
        const { row, col } = selectedCell;
        if (row === null || col === null) return;

        if (row < 9 && col < 9) {
            // 主棋盘逻辑
            if (!isInitialCell(row, col)) {
                setCellValue(row, col, num);
            }
        } else if (row === 9 && col < 9) {
            // 列草稿（下方）逻辑
            toggleDraft('col', col, num);
        } else if (col === 9 && row < 9) {
            // 行草稿（右方）逻辑
            toggleDraft('row', row, num);
        }
    };

    // 清除按钮（支持清除主格子 或 草稿区）
    const handleEraseClick = () => {
        const { row, col } = selectedCell;
        if (row === null || col === null) return;

        if (row < 9 && col < 9) {
            if (!isInitialCell(row, col)) setCellValue(row, col, 0); // setCellValue会自动清空颜色
        } else if (row === 9 && col < 9) {
            clearDraft('col', col);
        } else if (col === 9 && row < 9) {
            clearDraft('row', row);
        }
    };

    // 颜色标记按钮点击
    const handleColorClick = (colorClass) => {
        const { row, col } = selectedCell;
        if (row !== null && col !== null && row < 9 && col < 9) {
            setCellColor(row, col, colorClass);
        }
    };

    const isCellSelected = (r, c) => selectedCell.row === r && selectedCell.col === c;
    const isSameLine = (row, col) => {
        if (!selectedCell.row && selectedCell.row !== 0) return false;
        if (row >= 9 || col >= 9) return false; // 草稿区不参与同行高亮
        return (
            selectedCell.row === row || selectedCell.col === col ||
            Math.floor(selectedCell.row / 3) === Math.floor(row / 3) && Math.floor(selectedCell.col / 3) === Math.floor(col / 3)
        );
    };

    return (
        <div className="flex flex-col items-center w-full max-w-xl mx-auto">

            {/* 棋盘容器 (升级为 10x10 网格) */}
            <div className="bg-white rounded-xl shadow-2xl p-4 sm:p-6 border border-gray-100 mb-6 w-full flex justify-center overflow-x-auto">
                <div className="grid grid-cols-[repeat(10,minmax(0,1fr))] gap-0 bg-white min-w-[320px] sm:min-w-[450px]">

                    {Array.from({ length: 10 }).map((_, rowIdx) =>
                        Array.from({ length: 10 }).map((_, colIdx) => {
                            const selected = isCellSelected(rowIdx, colIdx);

                            // 1. 右下角留空
                            if (rowIdx === 9 && colIdx === 9) {
                                return <div key="corner" className="border-none bg-transparent"></div>;
                            }

                            // 2. 右侧的行草稿区
                            if (colIdx === 9) {
                                return (
                                    <div
                                        key={`draft-row-${rowIdx}`}
                                        onClick={() => handleCellClick(rowIdx, colIdx)}
                                        className={`
                      flex items-center justify-center p-1 cursor-pointer transition-colors
                      text-xs sm:text-sm font-medium text-slate-500 break-all leading-none
                      border border-dashed border-slate-300 ml-1 rounded-sm
                      ${selected ? 'bg-amber-100 ring-2 ring-amber-400 z-10' : 'bg-slate-50 hover:bg-slate-100'}
                    `}
                                        style={{ aspectRatio: '1/1' }}
                                    >
                                        {rowDrafts[rowIdx]}
                                    </div>
                                );
                            }

                            // 3. 下方的列草稿区
                            if (rowIdx === 9) {
                                return (
                                    <div
                                        key={`draft-col-${colIdx}`}
                                        onClick={() => handleCellClick(rowIdx, colIdx)}
                                        className={`
                      flex items-center justify-center p-1 cursor-pointer transition-colors
                      text-xs sm:text-sm font-medium text-slate-500 break-all leading-none
                      border border-dashed border-slate-300 mt-1 rounded-sm
                      ${selected ? 'bg-amber-100 ring-2 ring-amber-400 z-10' : 'bg-slate-50 hover:bg-slate-100'}
                    `}
                                        style={{ aspectRatio: '1/1' }}
                                    >
                                        {colDrafts[colIdx]}
                                    </div>
                                );
                            }

                            // 4. 标准的 9x9 数独格子
                            const cellValue = board[rowIdx][colIdx];
                            const isInitial = isInitialCell(rowIdx, colIdx);
                            const hasError = errors[rowIdx] && errors[rowIdx][colIdx];
                            const sameLineHighlight = isSameLine(rowIdx, colIdx) && !selected;
                            const isNumberActive = cellValue !== 0 && cellValue === activeNumber && !selected;
                            const cellColor = colors[rowIdx][colIdx]; // 自定义颜色

                            // 绘制粗边框逻辑 (保持主棋盘的九宫格感觉)
                            const isRightThick = colIdx === 2 || colIdx === 5 || colIdx === 8;
                            const isBottomThick = rowIdx === 2 || rowIdx === 5 || rowIdx === 8;
                            const isTopThick = rowIdx === 0;
                            const isLeftThick = colIdx === 0;

                            return (
                                <div
                                    key={`${rowIdx}-${colIdx}`}
                                    onClick={() => handleCellClick(rowIdx, colIdx)}
                                    className={`
                    flex items-center justify-center text-xl sm:text-3xl transition-all duration-200 select-none cursor-pointer
                    ${isInitial ? 'text-slate-900 font-black' : 'text-indigo-600 font-medium'}
                    
                    ${/* 边框渲染：为了将 9x9 框起来 */ ''}
                    border border-slate-300
                    ${isRightThick ? 'border-r-4 border-r-slate-800' : ''}
                    ${isBottomThick ? 'border-b-4 border-b-slate-800' : ''}
                    ${isTopThick ? 'border-t-4 border-t-slate-800' : ''}
                    ${isLeftThick ? 'border-l-4 border-l-slate-800' : ''}
                    
                    ${/* 背景色叠加优先级：错误 > 选中 > 同数字 > 自定义色 > 同线段 */ ''}
                    ${hasError ? 'bg-red-200 text-red-600 font-bold' : ''}
                    ${selected && !hasError ? 'bg-indigo-200 ring-inset ring-4 ring-indigo-500 z-10' : ''}
                    ${!selected && !hasError && isNumberActive ? 'bg-indigo-300 text-indigo-900 font-bold z-10' : ''}
                    
                    ${/* 应用自定义颜色 */ ''}
                    ${!selected && !hasError && !isNumberActive && cellColor ? cellColor : ''}
                    ${!selected && !hasError && !isNumberActive && !cellColor && sameLineHighlight ? 'bg-indigo-50/60' : ''}
                    ${!selected && !hasError && !isNumberActive && !cellColor && !sameLineHighlight ? 'bg-white' : ''}
                  `}
                                    style={{ aspectRatio: '1/1' }}
                                >
                                    {cellValue === 0 ? '' : cellValue}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* 控制台与键盘 */}
            <div className="w-full max-w-md px-2">

                {/* 自定义颜色标记栏 */}
                <div className="flex items-center justify-between bg-white px-4 py-2 rounded-lg shadow-sm mb-4 border border-slate-100">
                    <span className="text-sm font-bold text-slate-600">标记颜色：</span>
                    <div className="flex gap-4">
                        <button onClick={() => handleColorClick('bg-fuchsia-200')} className="w-8 h-8 rounded-full bg-fuchsia-200 ring-2 ring-transparent hover:ring-fuchsia-400 shadow-sm transition-all"></button>
                        <button onClick={() => handleColorClick('bg-yellow-200')} className="w-8 h-8 rounded-full bg-yellow-200 ring-2 ring-transparent hover:ring-yellow-400 shadow-sm transition-all"></button>
                        <button onClick={() => handleColorClick('bg-rose-200')} className="w-8 h-8 rounded-full bg-rose-200 ring-2 ring-transparent hover:ring-rose-400 shadow-sm transition-all"></button>
                    </div>
                </div>

                {/* 虚拟键盘 */}
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
                <div className="grid grid-cols-5 gap-1.5 sm:gap-3 mb-2 sm:mb-3">
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
                    <button onClick={handleEraseClick} className="h-14 sm:h-16 rounded-lg bg-rose-100 text-rose-600 hover:bg-rose-200 text-xl font-bold shadow-md transition-all duration-150 active:scale-95 flex items-center justify-center">
                        清除
                    </button>
                </div>
            </div>
        </div>
    );
}