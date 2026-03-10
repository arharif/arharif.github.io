import { useState } from 'react';
import { X1Mark } from '@/components/branding/X1Mark';
import { SiteAssistantPanel } from './SiteAssistantPanel';

export function SiteAssistantLauncher() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="assistant-launcher" onClick={() => setOpen((v) => !v)} aria-label={open ? 'Close X1 Assistance' : 'Open X1 Assistance'} aria-expanded={open}>
        <span className="assistant-logo-wrap"><X1Mark size="sm" /></span>
      </button>
      <SiteAssistantPanel open={open} onClose={() => setOpen(false)} />
    </>
  );
}
