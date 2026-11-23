import { Github, Linkedin, Mail, Search, ShoppingBag } from 'lucide-react';
import { Component, lazy, ReactNode, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, Route, Routes, useLocation, useNavigate, useNavigationType, useParams } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { AuthProvider } from '@/hooks/useAuth';
import { hasSupabaseCoreConfig } from '@/lib/config';
import { Gateway } from '@/pages/Gateway';
import { UniverseTransition } from '@/components/UniverseTransition';

const MotionConfig = lazy(() => import('framer-motion').then(m => ({default: m.MotionConfig})));
const AdminPage = lazy(() => import("@/pages/PublishingStudio"));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const ProfessionalHome = lazy(() => import('@/pages/ArticleCollections').then(m => ({default:m.ProfessionalHome})));
const TechnologyBook = lazy(() => import('@/pages/ArticleCollections').then(m => ({default:m.TechnologyBook})));
const CuriositiesHub = lazy(() => import('@/pages/ArticleCollections').then(m => ({default:m.CuriositiesHub})));
const CuriosityPost = lazy(() => import('@/pages/ArticleCollections').then(m => ({default:m.CuriosityPost})));
const SearchPage = lazy(() => import('@/pages/SearchPage'));
const Insights = lazy(() => import('@/pages/Insights'));
const AcademicApp = lazy(() => import('@/academic/app/AcademicApp'));
const ComplianceFrameworksPage = lazy(() => import('@/pages/ComplianceFrameworksPage').then((m) => ({ default: m.ComplianceFrameworksPage })));
const AboutX1Page = lazy(() => import('@/pages/AboutX1Page').then((m) => ({ default: m.AboutX1Page })));
const AcademicLibraryPage = lazy(() => import('@/pages/AcademicLibraryPage').then((m) => ({ default: m.AcademicLibraryPage })));
const GamesHub = lazy(() => import('@/components/GamesHub').then((m) => ({ default: m.GamesHub })));
const SecurityMindmapPage = lazy(() => import('@/pages/SecurityMindmapPage').then((m) => ({ default: m.SecurityMindmapPage })));
const SiteAssistantLauncher = lazy(() => import('@/components/site-assistant/SiteAssistantLauncher').then((m) => ({ default: m.SiteAssistantLauncher })));

const RouteLoading = ({ label }: { label: string }) => (
  <div className="glass rounded-2xl p-6" role="status" aria-live="polite">Loading {label}…</div>
);

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; message?: string }> {
  state = { hasError: false, message: undefined as string | undefined };
  static getDerivedStateFromError(error: Error) { return { hasError: true, message: error.message }; }
  render() {
    if (this.state.hasError) return <div className="mx-auto max-w-3xl p-10"><div className="glass rounded-2xl p-6"><h1 className="text-2xl font-semibold">Unable to load page</h1><p className="mt-3 text-muted">A temporary issue interrupted rendering. Please refresh and try again.</p></div></div>;
    return this.props.children;
  }
}

function SubmittingPage() {
  return (
    <section className="mx-auto max-w-3xl space-y-4 py-8">
      <div className="glass rounded-3xl p-6 md:p-7">
        <p className="text-xs uppercase tracking-[0.18em] text-muted">Contribute</p>
        <h1 className="mt-2 text-3xl font-semibold">Submit an Article</h1>
        <p className="mt-3 text-sm text-muted leading-7">
          Want to share an idea, insight, or experience? You are welcome to submit a blog post or article for review and possible publication on this platform.
        </p>
        <p className="mt-2 text-sm text-muted">At the moment, submissions are handled by email only.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="glass rounded-2xl p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Where to send</p>
          <a
            className="mt-2 inline-block rounded-xl bg-white/10 px-3 py-2 font-medium underline decoration-[color:var(--accent)] underline-offset-4"
            href="mailto:rharifanass@gmail.com?subject=X1%20Article%20Submission%3A%20%5BTopic%20Title%5D"
          >
            rharifanass@gmail.com
          </a>
          <p className="mt-3 text-xs text-muted">Please use a clear subject line to help review routing.</p>
        </div>

        <div className="glass rounded-2xl p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Submission guidelines</p>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-muted">
            <li>Write your submission directly in the email body.</li>
            <li>Use text only.</li>
            <li>Avoid attachments.</li>
            <li>Avoid external links or files.</li>
            <li>Send a complete version ready for review.</li>
          </ul>
        </div>
      </div>

      <div className="glass rounded-2xl p-5">
        <p className="mb-2 text-xs uppercase tracking-[0.16em] text-muted">Use this format</p>
        <pre className="overflow-x-auto rounded-xl bg-black/30 p-4 text-xs leading-6 text-slate-100">{`Full Name: [full name]
Email: [email address]
Topic Title: [topic title]
Category: [category]

Blog/Article Content:
[body content]`}</pre>
      </div>

      <div className="glass rounded-2xl p-5 text-sm text-muted leading-7">
        <p className="text-white font-medium">Note</p>
        <p className="mt-2">All submissions are reviewed before publication.</p>
        <p>Some articles may be edited slightly for clarity, grammar, formatting, and consistency.</p>
        <p className="mt-3 text-white">Thank you for contributing.</p>
      </div>
    </section>
  );
}

function NotFound() { return <section className="mx-auto max-w-xl py-24 text-center"><h1 className="text-4xl font-semibold">404</h1><Link to="/" className="mt-4 inline-block rounded-xl bg-white/10 px-4 py-2">Home</Link></section>; }

function Shell() {
  const location = useLocation();
  const navigation = useNavigationType();
  const mainRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const pages: Record<string, { title: string; description: string }> = {
      '/': { title: 'X1 Digital Universe', description: 'Explore cybersecurity, technology and business risk alongside research, curiosity and new ideas.' },
      '/x1-academic': { title: 'X1 Academic', description: 'Structured cybersecurity knowledge, frameworks and professional learning resources.' },
      '/insights-innovation': { title: 'Insights & Innovation', description: 'Ideas on technology, innovation, philosophy, human behaviour and continuous learning.' },
      '/about-x1': { title: 'Cybersecurity Capabilities', description: 'An integrated view of cybersecurity strategy, risk, governance, assurance and business resilience.' },
      '/academic-library': { title: 'Course & PDF Library', description: 'Curated cybersecurity courses, framework guidance, research and practitioner resources.' },
      '/compliance-frameworks': { title: 'Compliance Frameworks', description: 'Explore security, privacy, resilience and governance frameworks.' },
      '/professional': { title: 'Technology & Innovation', description: 'Cybersecurity, emerging technology and strategic digital perspectives.' },
      '/personal': { title: 'Curiosities & Philosophy', description: 'Ideas, culture and perspectives spanning philosophy, science and human behaviour.' },
      '/security-mindmap': { title: 'Security Map', description: 'Explore cybersecurity roles, capabilities and learning pathways.' },
      '/Security_Mindmap': { title: 'Security Map', description: 'Explore cybersecurity roles, capabilities and learning pathways.' },
      '/search': { title: 'Search', description: 'Search X1 topics, articles, resources and collections.' },
      '/games': { title: 'X1 Arcade', description: 'A collection of lightweight interactive games and challenges.' },
      '/submitting': { title: 'Connect / Contribute', description: 'Connect with X1 or submit an article for editorial review.' },
      '/admin': { title: 'Admin', description: 'X1 content administration.' },
      '/login': { title: 'Login', description: 'Sign in to X1 administration.' },
    };
    const page = location.pathname.startsWith('/professional/topic/') ? { title: 'Technology Topic', description: pages['/professional'].description }
      : location.pathname.startsWith('/personal/post/') ? { title: 'Curiosity Post', description: pages['/personal'].description }
      : pages[location.pathname] || { title: 'Page not found', description: 'The requested X1 page could not be found.' };
    const url = new URL(location.pathname, 'https://arharif.github.io');
    document.title = `${page.title} · arharif`;
    document.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute('content', page.description);
    document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.setAttribute('content', document.title);
    document.querySelector<HTMLMetaElement>('meta[property="og:description"]')?.setAttribute('content', page.description);
    document.querySelector<HTMLMetaElement>('meta[property="og:url"]')?.setAttribute('content', url.href);
    document.querySelector<HTMLMetaElement>('meta[property="twitter:title"]')?.setAttribute('content', document.title);
    document.querySelector<HTMLMetaElement>('meta[property="twitter:description"]')?.setAttribute('content', page.description);
    document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute('href', url.href);
    const privatePage = location.pathname === '/admin' || location.pathname === '/login' || !pages[location.pathname] && !location.pathname.startsWith('/professional/topic/') && !location.pathname.startsWith('/personal/post/');
    document.querySelector<HTMLMetaElement>('meta[name="robots"]')?.setAttribute('content', privatePage ? 'noindex,nofollow' : 'index,follow,max-image-preview:large');
  }, [location.pathname]);

  useEffect(() => {
    if (!location.hash && navigation !== 'POP') window.scrollTo({ top: 0, behavior: 'auto' });
    mainRef.current?.focus({ preventScroll: true });
  }, [location.pathname]);

  useEffect(() => {
    const hash = location.hash.slice(1);
    if (!hash) return;
    let id = hash;
    try { id = decodeURIComponent(hash); } catch { /* Keep literal fragments. */ }
    let highlight: HTMLElement | null = null;
    let timer = 0;
    const reveal = () => {
      const target = document.getElementById(id);
      if (!target) return;
      observer.disconnect();
      target.scrollIntoView({ behavior: 'instant', block: 'start' });
      highlight = target;
      target.classList.add('search-target-highlight');
      timer = window.setTimeout(() => target.classList.remove('search-target-highlight'), 1000);
    };
    const observer = new MutationObserver(reveal);
    if (mainRef.current) observer.observe(mainRef.current, { childList:true, subtree:true });
    reveal();
    return () => { observer.disconnect(); clearTimeout(timer); highlight?.classList.remove('search-target-highlight'); };
  }, [location.hash, location.pathname]);


  return (
    <div className="universe-shell" data-page={location.pathname.replace(/\/$/, "") || "/"}>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      {location.pathname.replace(/\/$/, "") !== "/games" && <Navbar />}
      <main id="main-content" ref={mainRef} tabIndex={-1} className="mx-auto max-w-6xl p-4 md:p-8">
        {!hasSupabaseCoreConfig && ["/login", "/admin"].includes(location.pathname) && <div className="glass mb-4 rounded-xl p-3 text-xs text-amber-300">Configuration is incomplete. Some authenticated features may be unavailable.</div>}
        <div key={location.pathname} data-route={location.pathname}>
            <Suspense fallback={<RouteLoading label="page"/>}><Routes>
              <Route path="/" element={<Gateway />} />
              <Route path="/insights-innovation" element={<Suspense fallback={<RouteLoading label="insights" />}><Insights /></Suspense>} />
              <Route path="/search" element={<Suspense fallback={<RouteLoading label="search" />}><SearchPage /></Suspense>} />
              <Route path="/professional" element={<ProfessionalHome />} />
              <Route path="/professional/topic/:slug" element={<TechnologyBook />} />
              <Route path="/personal" element={<CuriositiesHub />} />
              <Route path="/personal/post/:slug" element={<CuriosityPost />} />
              <Route path="/compliance-frameworks" element={<Suspense fallback={<div className="glass rounded-2xl p-6">Loading compliance frameworks…</div>}><ComplianceFrameworksPage /></Suspense>} />
              <Route path="/about-x1" element={<Suspense fallback={<div className="glass rounded-2xl p-6">Loading capability portfolio…</div>}><AboutX1Page /></Suspense>} />
              <Route path="/academic-library" element={<Suspense fallback={<div className="glass rounded-2xl p-6">Loading academic library…</div>}><AcademicLibraryPage /></Suspense>} />
              <Route path="/submitting" element={<SubmittingPage />} />
              <Route path="/games" element={<Suspense fallback={<RouteLoading label="games" />}><GamesHub /></Suspense>} />
              <Route path="/Security_Mindmap" element={<Suspense fallback={<RouteLoading label="security map" />}><SecurityMindmapPage /></Suspense>} />
              <Route path="/security-mindmap" element={<Suspense fallback={<RouteLoading label="security map" />}><SecurityMindmapPage /></Suspense>} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/admin" element={<ProtectedRoute><Suspense fallback={<RouteLoading label="publishing studio"/>}><AdminPage /></Suspense></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes></Suspense>
        </div>
      </main>
      <footer className="footer-enter mx-auto mt-8 flex max-w-6xl items-center border-t border-white/10 p-6 text-sm text-muted">
        <div className="footer-inline">
          <span className="footer-brand">arharif © 2027</span>
          <span className="footer-separator" aria-hidden="true">|</span>
          <div className="footer-icons" aria-label="Social links">
            <a href="https://www.linkedin.com/in/rharif-anass-/" target="_blank" rel="noopener noreferrer" aria-label="Open LinkedIn profile" title="LinkedIn" className="social-icon-link">
              <Linkedin size={12} strokeWidth={2.15} />
            </a>
            <a href="https://github.com/arharif" target="_blank" rel="noopener noreferrer" aria-label="Open GitHub profile" title="GitHub" className="social-icon-link">
              <Github size={12} strokeWidth={2.15} />
            </a>
            <a href="https://payhip.com/CyberSecAIStore" target="_blank" rel="noopener noreferrer" aria-label="Visit CyberSecAI Store" title="Store" className="social-icon-link">
              <ShoppingBag size={12} strokeWidth={2.15} />
            </a>
            <a href="mailto:rharifanass@gmail.com" aria-label="Send email to rharifanass@gmail.com" title="Email" className="social-icon-link">
              <Mail size={12} strokeWidth={2.15} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  const location = useLocation();
  const academic = location.pathname === '/x1-academic' || location.pathname.startsWith('/x1-academic/');
  const shell = <Shell/>;
  const usesMotion = /^\/(professional|personal|compliance-frameworks|Security_Mindmap|security-mindmap)(\/|$)/.test(location.pathname);
  return <ErrorBoundary><UniverseTransition/>
    <Suspense fallback={<RouteLoading label={academic ? "X1 Academic" : "page"}/>}>
      {academic ? <Routes><Route path="/x1-academic/*" element={<AcademicApp/>}/></Routes>
        : <AuthProvider>{usesMotion ? <MotionConfig reducedMotion="user">{shell}</MotionConfig> : shell}</AuthProvider>}
    </Suspense>
    <Suspense fallback={null}><SiteAssistantLauncher/></Suspense>
  </ErrorBoundary>;
}
