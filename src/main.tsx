import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { registerPWA } from './pwa'
import { Capacitor } from '@capacitor/core'
import { SystemUiNative } from './native/SystemUiNative'

registerPWA();

if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
  SystemUiNative.setStatusBar({ backgroundColor: '#0f172a', style: 'light', visible: true, overlaysWebView: false }).catch(() => undefined);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
