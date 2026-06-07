import React, { useState, useMemo } from 'react';

export default function SudokuBoard({
                                        board, answer, initialBoard, errors, // 接收从大脑传来的 errors 和 initialBoard
                                        selectedCell, setSelectedCell, setCellValue
                                    }) {
    const [activeNumber, setActiveNumber] = useState(null);

    const numberCounts = useMemo(() => {
        const counts = Array(10).fill(0);
        if (board && board.length === 9) {
            for (let r = 0; r < 9; r++) {
                for (let c = 0; c < 9; c++) {
                    if (board[r] && board[r][c] !== 0) {
                        counts[board[r][c]]++;
                    }
                }
            }
        }
        return counts;
    }, [board]);

    if (!board || board.length === 0 || !answer || answer.length === 0) {
        return <div className="text-xl font-bold text-gray-500 animate-pulse">正在生成棋盘...</div>;
    }

    // 判断是否是初始格子：使用 initialBoard 进行判断，更严谨
    const isInitialCell = (row, col) => {
        if (!initialBoard || !initialBoard[row]) return false;
        return initialBoard[row][col] !== 0;
    };

    const handleCellClick = (row, col) => {
        setSelectedCell({ row, col });
        const cellValue = board[row][col];
        if (cellValue !== 0) {
            setActiveNumber(cellValue);
        }
    };

    const handleKeypadClick = (num) => {
        setActiveNumber(num);
        if (selectedCell.row !== null && selectedCell.col !== null) {
            const { row, col } = selectedCell;
            if (!isInitialCell(row, col)) {
                setCellValue(row, col, num);
            }
        }
    };

    const handleEraseClick = () => {
        if (selectedCell.row !== null && selectedCell.col !== null) {
            const { row, col } = selectedCell;
            if (!isInitialCell(row, col)) {
                setCellValue(row, col, 0);
            }
        }
    };

    const isCellSelected = (r, c) => selectedCell.row === r && selectedCell.col === c;
    const isSameLine = (row, col) => {
        if (!selectedCell.row && selectedCell.row !== 0) return false;
        return (
            selectedCell.row === row || selectedCell.col === col ||
            Math.floor(selectedCell.row / 3) === Math.floor(row / 3) && Math.floor(selectedCell.col / 3) === Math.floor(col / 3)
        );
    };

    return (
        <div className="flex flex-col items-center w-full max-w-lg mx-auto">
            <div className="bg-white rounded-xl shadow-2xl p-4 sm:p-8 border border-gray-100 mb-8 w-full flex justify-center">
                <div className="grid grid-cols-9 gap-0 border-4 border-slate-800 bg-white" style={{ width: '100%', maxWidth: '450px', aspectRatio: '1/1' }}>
                    {board.map((rowArr, rowIdx) =>
                        rowArr.map((cell, colIdx) => {
                            const isInitial = isInitialCell(rowIdx, colIdx);
                            // 从外部 props 获取 error
                            const hasError = errors[rowIdx] && errors[rowIdx][colIdx];
                            const selected = isCellSelected(rowIdx, colIdx);
                            const sameLineHighlight = isSameLine(rowIdx, colIdx) && !selected;
                            const isNumberActive = cell !== 0 && cell === activeNumber && !selected;

                            return (
                                <div
                                    key={`${rowIdx}-${colIdx}`}
                                    onClick={() => handleCellClick(rowIdx, colIdx)}
                                    className={`
                    flex items-center justify-center text-xl sm:text-3xl transition-all duration-200 select-none cursor-pointer
                    ${/* 需求4：字号粗细区分 */ ''}
                    ${isInitial ? 'text-slate-800 font-black' : 'text-indigo-600 font-medium'}
                    ${selected ? 'bg-indigo-200 ring-inset ring-4 ring-indigo-500 z-10' : 'border border-slate-200'}
                    ${!selected && sameLineHighlight ? 'bg-indigo-50/60' : ''}
                    ${!selected && isNumberActive ? 'bg-indigo-300 ring-inset ring-2 ring-indigo-400 text-indigo-900 z-10' : ''}
                    ${hasError ? 'bg-red-200 text-red-600 ring-inset ring-2 ring-red-400 z-10 font-bold' : ''}
                    ${(colIdx + 1) % 3 === 0 && colIdx !== 8 ? 'border-r-2 border-r-slate-800' : ''}
                    ${(rowIdx + 1) % 3 === 0 && rowIdx !== 8 ? 'border-b-2 border-b-slate-800' : ''}
                    hover:bg-indigo-100
                  `}
                                >
                                    {cell === 0 ? '' : cell}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* 虚拟键盘 */}
            <div className="w-full max-w-md px-2">
                <div className="grid grid-cols-5 gap-2 sm:gap-3 mb-3">
                    {[1, 2, 3, 4, 5].map((num) => {
                        const isCompleted = numberCounts[num] >= 9;
                        return (
                            <button key={num} onClick={() => handleKeypadClick(num)}
                                    className={`h-14 sm:h-16 rounded-lg text-2xl font-bold shadow-md transition-all duration-150 active:scale-95
                  ${activeNumber === num ? 'bg-indigo-500 text-white ring-2 ring-offset-2 ring-indigo-500 scale-105' : 'bg-white text-slate-800 hover:bg-indigo-50'}
                  ${isCompleted ? 'opacity-40 grayscale pointer-events-none' : ''}`}
                            >
                                {num}
                            </button>
                        );
                    })}
                </div>
                <div className="grid grid-cols-5 gap-2 sm:gap-3">
                    {[6, 7, 8, 9].map((num) => {
                        const isCompleted = numberCounts[num] >= 9;
                        return (
                            <button key={num} onClick={() => handleKeypadClick(num)}
                                    className={`h-14 sm:h-16 rounded-lg text-2xl font-bold shadow-md transition-all duration-150 active:scale-95
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