import { SecurityRolesMap } from '@/components/security-map/SecurityRolesMap';

export function SecurityMindmapPage() {
  return (
    <section className="space-y-3">
      <div className="mindmap-hero rounded-3xl p-4 md:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold md:text-3xl">Security Map</h1>
            <p className="mt-1 max-w-3xl text-sm text-slate-200/90">
              Explore categories first, then drill into focused subdomains and roles.
            </p>
          </div>
          <p className="mindmap-chip">Interactive overview</p>
        </div>
      </div>
      <SecurityRolesMap />
    </section>
  );
}
