import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { ArticleProvider } from './context/ArticleContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ArticleProvider>
          <App />
        </ArticleProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);