import { Fragment, ReactNode } from 'react';

const safeLinkUrl = (value?: string) => {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (/^https:\/\//i.test(trimmed) || /^mailto:/i.test(trimmed)) return trimmed;
  return undefined;
};

const safeImageUrl = (value?: string) => {
  if (!value) return undefined;
  const trimmed = value.trim();
  return /^https:\/\//i.test(trimmed) ? trimmed : undefined;
};

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const out: ReactNode[] = [];
  const pattern = /(\!\[[^\]]*\]\([^\)]+\)|\[[^\]]+\]\([^\)]+\)|\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let idx = 0;

  while ((match = pattern.exec(text)) !== null) {
    const raw = match[0];
    if (match.index > last) out.push(<Fragment key={`${keyPrefix}-t-${idx++}`}>{text.slice(last, match.index)}</Fragment>);

    if (raw.startsWith('![')) {
      const m = raw.match(/^!\[(.*?)\]\((.*?)\)$/);
      const src = safeImageUrl(m?.[2]);
      if (m && src) {
        out.push(<img key={`${keyPrefix}-img-${idx++}`} src={src} alt={m[1]} className="my-3 rounded-xl" loading="lazy" />);
      } else {
        out.push(<Fragment key={`${keyPrefix}-raw-${idx++}`}>{raw}</Fragment>);
      }
    } else if (raw.startsWith('[')) {
      const m = raw.match(/^\[(.*?)\]\((.*?)\)$/);
      const href = safeLinkUrl(m?.[2]);
      if (m && href) {
        out.push(
          <a key={`${keyPrefix}-a-${idx++}`} href={href} target="_blank" rel="noopener noreferrer" className="underline decoration-cyan-400/70 underline-offset-4 hover:text-cyan-200">
            {m[1]}
          </a>,
        );
      } else {
        out.push(<Fragment key={`${keyPrefix}-raw-${idx++}`}>{raw}</Fragment>);
      }
    } else if (raw.startsWith('**') && raw.endsWith('**')) {
      out.push(<strong key={`${keyPrefix}-b-${idx++}`}>{raw.slice(2, -2)}</strong>);
    } else if (raw.startsWith('*') && raw.endsWith('*')) {
      out.push(<em key={`${keyPrefix}-i-${idx++}`}>{raw.slice(1, -1)}</em>);
    } else if (raw.startsWith('`') && raw.endsWith('`')) {
      out.push(<code key={`${keyPrefix}-c-${idx++}`} className="rounded bg-white/10 px-1.5 py-0.5 text-xs">{raw.slice(1, -1)}</code>);
    } else {
      out.push(<Fragment key={`${keyPrefix}-u-${idx++}`}>{raw}</Fragment>);
    }

    last = match.index + raw.length;
  }

  if (last < text.length) out.push(<Fragment key={`${keyPrefix}-tail`}>{text.slice(last)}</Fragment>);
  return out;
}

export function renderMarkdown(body: string) {
  const lines = body.split('\n');
  const nodes: ReactNode[] = [];
  let inCode = false;
  let codeLines: string[] = [];
  let listType: 'ul' | 'ol' | null = null;
  let listItems: ReactNode[] = [];

  const flushList = (key: string) => {
    if (!listType || listItems.length === 0) return;
    if (listType === 'ul') nodes.push(<ul key={`ul-${key}`} className="my-3 ml-5 list-disc space-y-1 text-muted">{listItems}</ul>);
    else nodes.push(<ol key={`ol-${key}`} className="my-3 ml-5 list-decimal space-y-1 text-muted">{listItems}</ol>);
    listType = null;
    listItems = [];
  };

  lines.forEach((line, i) => {
    if (line.trim().startsWith('```')) {
      flushList(String(i));
      if (!inCode) {
        inCode = true;
        codeLines = [];
      } else {
        inCode = false;
        nodes.push(<pre key={`pre-${i}`} className="my-4 overflow-x-auto rounded-xl bg-slate-900/70 p-4 text-xs"><code>{codeLines.join('\n')}</code></pre>);
      }
      return;
    }

    if (inCode) {
      codeLines.push(line);
      return;
    }

    const ul = line.match(/^\s*[-*]\s+(.*)$/);
    const ol = line.match(/^\s*\d+\.\s+(.*)$/);

    if (ul) {
      if (listType !== 'ul') {
        flushList(String(i));
        listType = 'ul';
      }
      listItems.push(<li key={`li-${i}`}>{renderInline(ul[1], `uli-${i}`)}</li>);
      return;
    }

    if (ol) {
      if (listType !== 'ol') {
        flushList(String(i));
        listType = 'ol';
      }
      listItems.push(<li key={`oi-${i}`}>{renderInline(ol[1], `oli-${i}`)}</li>);
      return;
    }

    flushList(String(i));

    if (!line.trim()) {
      nodes.push(<div key={`sp-${i}`} className="h-2" />);
      return;
    }

    if (line.startsWith('### ')) {
      nodes.push(<h4 key={`h3-${i}`} className="mt-4 text-lg font-semibold">{renderInline(line.slice(4), `h3-${i}`)}</h4>);
      return;
    }
    if (line.startsWith('## ')) {
      nodes.push(<h3 key={`h2-${i}`} className="mt-4 text-xl font-semibold">{renderInline(line.slice(3), `h2-${i}`)}</h3>);
      return;
    }
    if (line.startsWith('# ')) {
      nodes.push(<h2 key={`h1-${i}`} className="mt-4 text-2xl font-semibold">{renderInline(line.slice(2), `h1-${i}`)}</h2>);
      return;
    }
    if (line.startsWith('> ')) {
      nodes.push(<blockquote key={`q-${i}`} className="glass my-4 rounded-xl p-3 text-sm text-muted">{renderInline(line.slice(2), `q-${i}`)}</blockquote>);
      return;
    }

    nodes.push(<p key={`p-${i}`} className="leading-7 text-muted">{renderInline(line, `p-${i}`)}</p>);
  });

  if (inCode) nodes.push(<pre key="pre-tail" className="my-4 overflow-x-auto rounded-xl bg-slate-900/70 p-4 text-xs"><code>{codeLines.join('\n')}</code></pre>);
  flushList('tail');

  return nodes;
}

export function isSafeExternalUrl(value: string) {
  return Boolean(safeLinkUrl(value));
}
