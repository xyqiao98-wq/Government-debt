import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
} else {
  console.error('Root element not found');
  document.body.innerHTML = '<div style="color: white; background: #111827; height: 100vh; display: flex; align-items: center; justify-content: center; font-family: sans-serif;">页面加载失败：缺少根元素</div>';
}
