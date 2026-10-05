import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { StoreProvider } from './lib/store'
import '@fontsource-variable/bricolage-grotesque'
import '@fontsource-variable/manrope'
import './index.css'
import { registerServiceWorker } from './lib/push'

registerServiceWorker()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <StoreProvider>
      <App />
    </StoreProvider>
  </React.StrictMode>,
)
