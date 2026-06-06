import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

export const evaluationApi = {
  getMetrics: async () => {
    const { data } = await api.get('/api/evaluation');
    return data;
  },
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
