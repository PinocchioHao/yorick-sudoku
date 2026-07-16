// src/locales.js
export const locales = {
    zh: {
        appTitle: 'Fanfan战数独！',
        generating: '正在生成棋盘...',
        loading: '加载记忆档案中...',
        difficulty: {
            easy: '简单',
            medium: '中等',
            hard: '困难'
        },
        actions: {
            undo: '↩️ 撤销',
            hint: '💡 提示',
            check: '🔍 校验',
            restart: '🔁 重玩',
            newGame: '🆕 新局',
            clear: '清除'
        },
        alerts: {
            confirmRestart: '确定要清空已填写的进度，重玩这一局吗？',
            needSelectHint: '请先点击选中一个需要提示的空白格子哦！',
            checkSuccess: '太棒了！目前填入的数字全部正确！继续保持！✨'
        },
        successMessage: '🎉 太棒了，挑战成功！用时：',
        boardInfo: {
            marks: '标记：',
            notes: '✏️ 笔记',
            on: 'ON',
            off: 'OFF'
        },
        footer: {
            adSpace: '广告位招租',
            contact: '有意者请联系@小鱼'
        }
    },
    en: {
        appTitle: "Fanfan VS Sudoku",
        generating: 'Generating board...',
        loading: 'Loading saved game...',
        difficulty: {
            easy: 'Easy',
            medium: 'Medium',
            hard: 'Hard'
        },
        actions: {
            undo: '↩️ Undo',
            hint: '💡 Hint',
            check: '🔍 Check',
            restart: '🔁 Restart',
            newGame: '🆕 New',
            clear: 'Clear'
        },
        alerts: {
            confirmRestart: 'Are you sure you want to clear your progress and restart this game?',
            needSelectHint: 'Please select an empty cell first to get a hint!',
            checkSuccess: 'Awesome! All numbers filled so far are correct! Keep it up! ✨'
        },
        successMessage: '🎉 Congratulations, challenge completed! Time: ',
        boardInfo: {
            marks: 'Marks:',
            notes: '✏️ Notes',
            on: 'ON',
            off: 'OFF'
        },
        footer: {
            adSpace: 'Advertising Space Available',
            contact: 'Interested parties please contact @Yorick'
        }
    }
};