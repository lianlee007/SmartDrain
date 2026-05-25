/**
 * Punto de entrada de la aplicación React (SmartDrain).
 * Monta el árbol de componentes en el DOM, aplica el tema oscuro global
 * y renderiza la raíz App dentro de StrictMode.
 */
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Tema oscuro por defecto en toda la interfaz
document.documentElement.classList.add('dark');
document.documentElement.style.colorScheme = 'dark';

// Montaje de la aplicación en el contenedor #root del index.html
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
