import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Keep the launch screen up for about a second after launch, then fade it out.
const splash = document.getElementById('splash')
if (splash) {
  setTimeout(() => {
    splash.classList.add('is-done')
    setTimeout(() => splash.remove(), 400)
  }, Math.max(0, 1100 - performance.now()))
}

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {})
  })
}
