import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { querySiteAssistant } from '@/lib/siteAssistant';

interface Message {
  role: 'user' | 'assistant';
  text: string;
  sources?: Array<{ title: string; route: string }>;
}

const initialMessage: Message = {
  role: 'assistant',
  text: 'I can summarize public content on this website and guide you to the right page.',
};

export function SiteAssistantPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([initialMessage]);

  const ask = async () => {
    const q = input.trim();
    if (!q || loading) return;
    setMessages((m) => [...m, { role: 'user', text: q }]);
    setInput('');
    setLoading(true);
    try {
      const reply = await querySiteAssistant(q);
      setMessages((m) => [...m, { role: 'assistant', text: reply.text, sources: reply.sources?.map((s) => ({ title: s.title, route: s.route })) }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.section
          id="x1-assistant-panel"
          className="assistant-panel"
          aria-label="X1 assistant"
          role="dialog"
          aria-modal="false"
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.98 }}
          transition={{ duration: 0.16 }}
        >
          <div className="assistant-head">
            <p className="text-sm font-semibold">X1</p>
            <button className="assistant-icon-btn" onClick={onClose} aria-label="Close X1 assistant">✕</button>
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
            {loading && <p className="text-xs text-muted">X1 is checking website content…</p>}
          </div>
          <div className="assistant-foot">
            <input
              className="assistant-input"
              value={input}
              onChange={(e) => setInput(e.target.value.slice(0, 280))}
              placeholder="Ask about website content"
              onKeyDown={(e) => { if (e.key === 'Enter') ask(); }}
              aria-label="Ask X1 about this website"
              autoComplete="off"
            />
            <button className="assistant-send" onClick={ask} disabled={loading || !input.trim()}>{loading ? '…' : 'Send'}</button>
          </div>
          <p className="assistant-note">X1 only uses available public website information.</p>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
