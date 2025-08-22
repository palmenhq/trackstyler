import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './app.tsx'
import { plausible } from './util/tracker'

plausible.enableAutoPageviews()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App path={window.location.pathname} />
  </StrictMode>,
)
