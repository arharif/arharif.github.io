import { useEffect, useMemo, useRef, useState } from 'react';

import { Link, useLocation } from 'react-router-dom';
import { originals } from '../arcade/catalog';
import { AssistantPortrait, assistantIdentity } from './AssistantPortrait';
import { getAssistantWelcome } from './assistantContext';

interface QuickAction { label: string; route?: string; prompt?: string }

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  unavailable?: boolean;
  sources?: Array<{ title: string; route: string }>;
  quickActions?: QuickAction[];
}

const mkId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export function SiteAssistantPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const location = useLocation();
  const welcome = useMemo(() => getAssistantWelcome(location.pathname), [location.pathname]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const selectedGame = welcome.section === 'games' ? originals.find(game => game.key === new URLSearchParams(location.search).get('game')) : undefined;
  const guide = assistantIdentity(welcome.section);
  const lastMessage = messages[messages.length - 1];
  const settledExpression = lastMessage?.unavailable ? "reassuring" : "pleased";
  const expression = loading ? "thinking" : lastMessage ? settledExpression : "welcome";
  const panelRef = useRef<HTMLElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); onClose(); }
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
      const reply = await querySiteAssistant(q, location.pathname, selectedGame?.key);
      const replyMessage: Message = {
        id: mkId(),
        role: 'assistant',
        text: reply.text,
        unavailable: reply.unavailable,
        sources: reply.sources?.map((s) => ({ title: s.title, route: s.route })),
        quickActions: reply.quickActions,
      };
      setMessages((m) => [...m, replyMessage].slice(-18));
    } catch {
      const fallback: Message = {
        id: mkId(),
        role: 'assistant',
        unavailable: true,
        text: 'I had trouble checking the website content just now. Please retry with shorter keywords.',
      };
      setMessages((m) => [...m, fallback].slice(-18));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {open && (
        <section
          ref={panelRef}
          id="x1-assistant-panel"
          className="assistant-panel"
          data-expression={expression}
          aria-label="X1 assistant"
          role="dialog"
          aria-modal="true"
        >
          <div className="assistant-head">
            <p className="text-sm font-semibold">{guide === 'phantom' ? 'Phantom · Arcade guide' : guide === 'astronaut' ? 'Grok · Insights guide' : 'X1 Assistant'}</p>
            <button className="assistant-icon-btn" onClick={onClose} aria-label="Close X1 assistant">✕</button>
          </div>

          <div className="assistant-welcome-card" aria-live="polite">
            <div className="assistant-welcome-visual" aria-hidden="true"><AssistantPortrait section={welcome.section}/></div>
            <div>
              <p className="assistant-welcome-title">{selectedGame?.title ?? welcome.title}</p>
              <p className="assistant-welcome-body">{selectedGame?.instructions ?? welcome.body}</p>
              <p className="assistant-welcome-hint">{welcome.hint}</p>
            </div>
          </div>

          <div className="assistant-body">
            {welcome.section === 'landing' && !messages.length && <nav aria-label="Explore X1" className="flex flex-wrap gap-2 p-2">
              <Link className="assistant-source" to="/games" onClick={onClose}>Games</Link>
              <Link className="assistant-source" to="/insights-innovation" onClick={onClose}>Insights</Link>
              <Link className="assistant-source" to="/x1-academic" onClick={onClose}>Academic</Link>
            </nav>}
            {messages.map((m) => (
              <div key={m.id} className={`assistant-msg ${m.role === 'user' ? 'is-user' : 'is-bot'}`}>
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
              placeholder={{ face: 'Ask about X1', orb: 'Ask about X1', astronaut: 'Find an article or topic', phantom: 'Ask about games or controls' }[guide]}
              aria-label="Ask X1 about this website"
              autoComplete="off"
            />
            <button type="submit" className="assistant-send" disabled={loading || !input.trim()}>{loading ? '…' : 'Send'}</button>
          </form>
          <p className="assistant-note">Guidance from the public X1 catalogue.</p>
        </section>
      )}
    </>
  );
}
