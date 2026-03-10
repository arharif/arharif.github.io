import { useState } from 'react';
import { X1Mark } from '@/components/branding/X1Mark';
import { SiteAssistantPanel } from './SiteAssistantPanel';

export function SiteAssistantLauncher() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="assistant-launcher" onClick={() => setOpen((v) => !v)} aria-label="Open site assistant">
        <X1Mark size="md" />
      </button>
      <SiteAssistantPanel open={open} onClose={() => setOpen(false)} />
    </>
  );
}
