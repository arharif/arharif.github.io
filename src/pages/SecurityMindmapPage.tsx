import { SecurityRolesMap } from '@/components/security-map/SecurityRolesMap';

export function SecurityMindmapPage() {
  return (
    <section className="space-y-4">
      <div className="mindmap-hero rounded-3xl p-5 md:p-6">
        <h1 className="text-3xl font-semibold md:text-4xl">Security Map</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-200/90 md:text-base">
          Explore cybersecurity categories first, then drill into focused subdomains and roles.
        </p>
      </div>
      <SecurityRolesMap />
    </section>
  );
}
