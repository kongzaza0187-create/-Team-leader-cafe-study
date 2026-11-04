import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initSecurityGuard } from './services/securityGuard';

// Initialize Viewport Lock (Disable Zoom In / Out) and DevTools Protection
initSecurityGuard();

createRoot(document.getElementById('root')!).render(<App />);
