import { useState } from 'react';
import { Link } from 'react-router-dom';
import { querySiteAssistant } from '@/lib/siteAssistant';

interface Message {
  role: 'user' | 'assistant';
  text: string;
  sources?: Array<{ title: string; route: string }>;
}

export function SiteAssistantPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: 'Hi — I can summarize what is available on this site (Security Map, Professional, Personal, Games, and public content).' },
  ]);

  if (!open) return null;

  const ask = async () => {
    const q = input.trim();
    if (!q || loading) return;
    setMessages((m) => [...m, { role: 'user', text: q }]);
    setInput('');
    setLoading(true);
    const reply = await querySiteAssistant(q);
    setMessages((m) => [...m, { role: 'assistant', text: reply.text, sources: reply.sources?.map((s) => ({ title: s.title, route: s.route })) }]);
    setLoading(false);
  };

  return (
    <section className="assistant-panel" aria-label="Site assistant" role="dialog" aria-modal="false">
      <div className="assistant-head">
        <p className="text-sm font-semibold">Site Assistant</p>
        <button className="assistant-icon-btn" onClick={onClose} aria-label="Close assistant">✕</button>
      </div>
      <div className="assistant-body">
        {messages.map((m, i) => (
          <div key={i} className={`assistant-msg ${m.role === 'user' ? 'is-user' : 'is-bot'}`}>
            <p className="text-sm whitespace-pre-line">{m.text}</p>
            {m.sources && m.sources.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {m.sources.slice(0, 4).map((s, j) => (
                  <Link key={`${i}-${j}`} to={s.route} className="assistant-source" onClick={onClose}>{s.title}</Link>
                ))}
              </div>
            )}
          </div>
        ))}
        {loading && <p className="text-xs text-muted">Thinking…</p>}
      </div>
      <div className="assistant-foot">
        <input
          className="assistant-input"
          value={input}
          onChange={(e) => setInput(e.target.value.slice(0, 280))}
          placeholder="Ask about website content"
          onKeyDown={(e) => { if (e.key === 'Enter') ask(); }}
          aria-label="Ask the site assistant"
        />
        <button className="assistant-send" onClick={ask} disabled={loading || !input.trim()}>Send</button>
      </div>
      <p className="assistant-note">This assistant is constrained to website-available information only.</p>
    </section>
  );
}
