import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {HelmetProvider} from 'react-helmet-async';
import { registerSW } from 'virtual:pwa-register';
import AppWrapper from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

// Register service worker with automatic updates
registerSW({ immediate: true });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <HelmetProvider>
        <AppWrapper />
      </HelmetProvider>
    </ErrorBoundary>
  </StrictMode>,
);
