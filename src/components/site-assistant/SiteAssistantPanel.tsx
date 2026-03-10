import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    { role: 'assistant', text: 'I can summarize the information available on this website.' },
  ]);

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
    <AnimatePresence>
      {open && (
        <motion.section
          className="assistant-panel"
          aria-label="X1 Assistance"
          role="dialog"
          aria-modal="false"
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.98 }}
          transition={{ duration: 0.16 }}
        >
          <div className="assistant-head">
            <p className="text-sm font-semibold">X1 Assistance</p>
            <button className="assistant-icon-btn" onClick={onClose} aria-label="Close assistant">✕</button>
          </div>
          <div className="assistant-body">
            {messages.length === 0 && <p className="text-xs text-muted">Ask about website pages, map categories, roles, and published posts.</p>}
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
            {!loading && messages[messages.length - 1]?.role === 'assistant' && messages[messages.length - 1]?.sources?.length === 0 && (
              <p className="text-xs text-amber-200/90">I could not find that on this website. Try broader terms like “Security Map”, “Professional”, or “Personal”.</p>
            )}
            {loading && <p className="text-xs text-muted">Summarizing website content…</p>}
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
          <p className="assistant-note">I can help you find and summarize information available on this website.</p>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
