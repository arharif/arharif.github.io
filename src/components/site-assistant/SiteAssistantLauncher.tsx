import { useState } from 'react';
import { SiteAssistantPanel } from './SiteAssistantPanel';

export function SiteAssistantLauncher() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="assistant-launcher"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close X1 assistant' : 'Open X1 assistant'}
        aria-expanded={open}
        aria-controls="x1-assistant-panel"
      >
        <span className="assistant-launcher-title">X1</span>
        <span className="assistant-launcher-text">Assistant</span>
      </button>
      <SiteAssistantPanel open={open} onClose={() => setOpen(false)} />
    </>
  );
}
