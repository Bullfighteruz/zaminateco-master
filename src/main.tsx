import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/performance.css'
import 'leaflet/dist/leaflet.css'
import '@splinetool/viewer'
import App from './App.tsx'
import './i18n.ts' // Initialize i18n

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)