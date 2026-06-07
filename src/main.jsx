import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
// 引入 Vercel 的数据统计组件
import { Analytics } from '@vercel/analytics/react'

ReactDOM.createRoot(document.getElementById('app')).render(
    <React.StrictMode>
        <App />
        {/* 把统计组件挂载在 App 旁边，它会自动静默收集页面访问数据 */}
        <Analytics />
    </React.StrictMode>,
)