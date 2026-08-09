import { BookOpen, ExternalLink, Filter, Search } from 'lucide-react';
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createAcademicResource, isSafeHttpUrl, listAcademicResources, normalizeResource } from '@/lib/academicResources';
import { AcademicResource, AcademicResourceInput, AcademicResourceType } from '@/types/academic';

const types: Array<'all' | AcademicResourceType> = ['all', 'course', 'pdf', 'guide', 'framework', 'research', 'other'];
const emptyForm: AcademicResourceInput = { name: '', url: '', description: '', type: 'pdf' };

function ResourceAdminForm({ resources, onCreated }: { resources: AcademicResource[]; onCreated: (resource: AcademicResource) => void }) {
  const { session } = useAuth();
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage(null);
    if (!form.name.trim() || !form.description.trim() || !isSafeHttpUrl(form.url)) {
      setMessage({ type: 'error', text: 'Complete every field and use a valid HTTPS link.' }); return;
    }
    const normalized = normalizeResource(form);
    if (resources.some((item) => item.url.toLowerCase() === normalized.url.toLowerCase() || item.name.toLowerCase() === normalized.name.toLowerCase())) {
      setMessage({ type: 'error', text: 'A resource with this name or link already exists.' }); return;
    }
    if (!session?.access_token) { setMessage({ type: 'error', text: 'Your admin session has expired. Sign in again.' }); return; }
    setSaving(true);
    try {
      const created = await createAcademicResource(normalized, session.access_token);
      onCreated(created); setForm(emptyForm); setMessage({ type: 'success', text: 'Resource published successfully.' });
    } catch (error) { setMessage({ type: 'error', text: error instanceof Error ? error.message : 'The resource could not be saved.' }); }
    finally { setSaving(false); }
  };
  return <section className="glass academic-admin rounded-2xl p-5" aria-labelledby="resource-admin-title">
    <h2 id="resource-admin-title" className="text-xl font-semibold">Resource management</h2>
    <p className="mt-1 text-sm text-muted">Publish a verified course, PDF or professional learning resource.</p>
    <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={submit} noValidate>
      <label className="academic-field">Resource name<input required maxLength={120} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
      <label className="academic-field">Link / URL<input required inputMode="url" placeholder="https://" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} /></label>
      <label className="academic-field">Resource type<select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as AcademicResourceType })}>{types.slice(1).map((type) => <option key={type} value={type}>{type}</option>)}</select></label>
      <label className="academic-field md:col-span-2">Description<textarea required maxLength={500} rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
      <div className="flex items-center gap-3 md:col-span-2"><button className="academic-primary" disabled={saving}>{saving ? 'Publishing…' : 'Publish resource'}</button>{message && <p role="status" className={message.type === 'error' ? 'status-error text-sm' : 'status-success text-sm'}>{message.text}</p>}</div>
    </form>
  </section>;
}

export function AcademicLibraryPage() {
  const { isAdmin } = useAuth();
  const [resources, setResources] = useState<AcademicResource[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [query, setQuery] = useState('');
  const [type, setType] = useState<(typeof types)[number]>('all');
  const requestRef = useRef<AbortController | null>(null);
  const load = useCallback(() => {
    requestRef.current?.abort();
    const controller = new AbortController(); requestRef.current = controller; setStatus('loading');
    listAcademicResources(controller.signal).then((data) => { if (!controller.signal.aborted) { setResources(data); setStatus('ready'); } }).catch((error) => { if (controller.signal.aborted || (error instanceof DOMException && error.name === 'AbortError')) return; setStatus('error'); }).finally(() => { if (requestRef.current === controller) requestRef.current = null; });
  }, []);
  useEffect(() => { load(); return () => requestRef.current?.abort(); }, [load]);
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return resources.filter((item) => (type === 'all' || item.type === type) && (!needle || `${item.name} ${item.description} ${item.type}`.toLowerCase().includes(needle)));
  }, [query, resources, type]);
  return <section className="space-y-6">
    <header className="academic-hero glass rounded-3xl p-6 md:p-9"><p className="academic-eyebrow">X1 Academic</p><h1 className="mt-2 text-3xl font-semibold md:text-5xl">Course &amp; PDF Library</h1><p className="mt-4 max-w-3xl text-muted">Curated cybersecurity courses, framework guidance, research and practitioner resources—selected to turn complex requirements into usable knowledge.</p></header>
    {isAdmin && <ResourceAdminForm resources={resources} onCreated={(resource) => setResources((current) => [resource, ...current])} />}
    <div className="glass grid gap-3 rounded-2xl p-4 md:grid-cols-[1fr_auto]">
      <label className="academic-search"><Search size={18} aria-hidden="true" /><span className="sr-only">Search resources</span><input value={query} maxLength={120} onChange={(e) => setQuery(e.target.value)} placeholder="Search courses, PDFs, frameworks…" /></label>
      <label className="academic-filter"><Filter size={17} aria-hidden="true" /><span className="sr-only">Filter by resource type</span><select value={type} onChange={(e) => setType(e.target.value as typeof type)}>{types.map((item) => <option key={item} value={item}>{item === 'all' ? 'All resource types' : item}</option>)}</select></label>
    </div>
    {status === 'loading' && <div className="academic-state glass rounded-2xl" role="status">Loading the library…</div>}
    {status === 'error' && <div className="academic-state glass rounded-2xl" role="alert"><p>We could not load the library right now.</p><button className="academic-primary mt-3" onClick={load}>Try again</button></div>}
    {status === 'ready' && resources.length === 0 && <div className="academic-state glass rounded-2xl"><BookOpen aria-hidden="true" /><p>No resources have been published yet.</p></div>}
    {status === 'ready' && resources.length > 0 && filtered.length === 0 && <div className="academic-state glass rounded-2xl"><p>No resources match your search. Try a broader term or another type.</p></div>}
    {status === 'ready' && filtered.length > 0 && <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{filtered.map((item) => <article key={item.id} className="academic-card glass rounded-2xl p-5"><span className="academic-badge">{item.type}</span><h2 className="mt-4 text-xl font-semibold">{item.name}</h2><p className="mt-3 flex-1 text-sm leading-6 text-muted">{item.description}</p>{isSafeHttpUrl(item.url) ? <a className="academic-open mt-5" href={item.url} target="_blank" rel="noopener noreferrer">Open resource <ExternalLink size={16} aria-hidden="true" /></a> : <p className="status-error mt-5 text-sm">This resource is currently unavailable.</p>}</article>)}</div>}
  </section>;
}
