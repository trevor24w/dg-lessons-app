import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import 'modern-css-reset/dist/reset.min.css';
import './styles.css';

const root = createRoot(document.getElementById('root'));
root.render(<App />); 