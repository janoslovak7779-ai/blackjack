//import 'bootstrap/dist/css/bootstrap.min.css'
//import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <App/>
    </StrictMode>,
)

// Register Vite PWA service worker
if ("serviceWorker" in navigator) {
    window.addEventListener("load", async () => {
        try {
            const { registerSW } = await import("virtual:pwa-register");
            registerSW({ immediate: true });
        } catch {
            // ignore
        }
    });
}