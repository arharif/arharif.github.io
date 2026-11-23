import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { getAssistantWelcome } from './assistantContext';

interface QuickAction { label: string; route?: string; prompt?: string }

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  sources?: Array<{ title: string; route: string }>;
  kind?: 'welcome' | 'default';
  section?: string;
  quickActions?: QuickAction[];
}

const mkId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export function SiteAssistantPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const location = useLocation();
  const welcome = useMemo(() => getAssistantWelcome(location.pathname), [location.pathname]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const seenSections = useRef<Set<string>>(new Set());
  const panelRef = useRef<HTMLElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const shouldShowWelcome = !seenSections.current.has(welcome.section);
    if (!shouldShowWelcome) return;

    seenSections.current.add(welcome.section);
    setMessages((prev) => {
      if (prev[0]?.kind === 'welcome' && prev[0].section === welcome.section) return prev;
      const welcomeMessage: Message = {
        id: mkId(),
        role: 'assistant',
        kind: 'welcome',
        section: welcome.section,
        text: welcome.body,
      };
      return [welcomeMessage, ...prev].slice(0, 18);
    });
  }, [open, welcome]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key !== 'Tab' || !panelRef.current) return;
      const focusable = [...panelRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled])')];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose, open]);

  const ask = async () => {
    const q = input.trim();
    if (!q || loading) return;
    const userMessage: Message = { id: mkId(), role: 'user', text: q };
    setMessages((m) => [...m, userMessage].slice(-18));
    setInput('');
    setLoading(true);
    try {
      const { querySiteAssistant } = await import('@/lib/siteAssistant');
      const reply = await querySiteAssistant(q, location.pathname);
      const replyMessage: Message = {
        id: mkId(),
        role: 'assistant',
        text: reply.text,
        sources: reply.sources?.map((s) => ({ title: s.title, route: s.route })),
        kind: 'default',
        quickActions: reply.quickActions,
      };
      setMessages((m) => [...m, replyMessage].slice(-18));
    } catch {
      const fallback: Message = {
        id: mkId(),
        role: 'assistant',
        kind: 'default',
        text: 'I had trouble checking the website content just now. Please retry with shorter keywords.',
      };
      setMessages((m) => [...m, fallback].slice(-18));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.section
          ref={panelRef}
          id="x1-assistant-panel"
          className="assistant-panel"
          aria-label="X1 assistant"
          role="dialog"
          aria-modal="true"
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.98 }}
          transition={{ duration: 0.16 }}
        >
          <div className="assistant-head">
            <p className="text-sm font-semibold">X1 Assistant</p>
            <button className="assistant-icon-btn" onClick={onClose} aria-label="Close X1 assistant">✕</button>
          </div>

          <div className="assistant-welcome-card" aria-live="polite">
            <div className="assistant-welcome-visual" aria-hidden="true">{welcome.visual}</div>
            <div>
              <p className="assistant-welcome-title">{welcome.title}</p>
              <p className="assistant-welcome-body">{welcome.body}</p>
              <p className="assistant-welcome-hint">{welcome.hint}</p>
            </div>
          </div>

          <div className="assistant-body">
            {messages.map((m) => (
              <div key={m.id} className={`assistant-msg ${m.role === 'user' ? 'is-user' : 'is-bot'} ${m.kind === 'welcome' ? 'is-welcome' : ''}`}>
                <p className="text-sm whitespace-pre-line">{m.text}</p>
                {m.sources && m.sources.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {m.sources.slice(0, 4).map((s) => (
                      <Link key={`${m.id}-${s.title}-${s.route}`} to={s.route} className="assistant-source" onClick={onClose}>{s.title}</Link>
                    ))}
                  </div>
                )}
                {m.quickActions && m.quickActions.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {m.quickActions.slice(0, 4).map((a) => a.route ? (
                      <Link key={`${m.id}-${a.label}`} to={a.route} className="assistant-source" onClick={onClose}>{a.label}</Link>
                    ) : (
                      <button key={`${m.id}-${a.label}`} type="button" className="assistant-source" onClick={() => setInput(a.prompt || a.label)}>{a.label}</button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && <p className="text-xs text-muted" role="status">X1 is checking published website content…</p>}
          </div>
          <form
            className="assistant-foot"
            onSubmit={(event) => {
              event.preventDefault();
              void ask();
            }}
          >
            <input
              ref={inputRef}
              className="assistant-input"
              value={input}
              onChange={(e) => setInput(e.target.value.slice(0, 280))}
              placeholder="Ask about X1 topics, frameworks, certifications, games..."
              aria-label="Ask X1 about this website"
              autoComplete="off"
            />
            <button type="submit" className="assistant-send" disabled={loading || !input.trim()}>{loading ? '…' : 'Send'}</button>
          </form>
          <p className="assistant-note">How can I help you today? I can help you navigate the website.</p>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
