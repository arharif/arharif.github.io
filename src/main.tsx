import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/index.css';

const root = document.getElementById('root');
if (!root) {
  document.body.innerHTML = '<div style="padding:24px;font-family:Inter,system-ui,sans-serif;color:#fff;background:#0a0b13">Application mount node <code>#root</code> was not found.</div>';
} else {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>,
  );
}
