import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App';
import './index.css';
import './styles/library-feature.css';
import './styles/library-shell.css';
import './styles/workspace.css';
import './styles/login.css';
import './styles/legacy-adapters.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('React root element was not found.');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
