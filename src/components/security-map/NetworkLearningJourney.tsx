import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

const modules = [
  ['How Networks Communicate', 'Frames move locally; packets move between networks; transport protocols connect applications.'],
  ['OSI & TCP/IP', 'Use layered models to locate responsibilities and troubleshoot systematically.'],
  ['Ethernet & Switching', 'Switches learn source MAC addresses and forward frames within a broadcast domain.'],
  ['IPv4 / IPv6', 'Addresses identify network location; prefixes define which portion describes the network.'],
  ['Subnetting', 'A /24 provides 256 addresses; dividing it into /26 networks creates four blocks of 64 addresses.'],
  ['ARP / ICMP / DHCP / DNS', 'Supporting protocols resolve neighbours, test reachability, assign configuration and resolve names.'],
  ['Routing', 'Routers compare destination IPs with a routing table and select the most specific route.'],
  ['VLANs & Segmentation', 'VLANs create logical broadcast domains; inter-VLAN traffic crosses a controlled Layer 3 boundary.'],
  ['NAT & Internet Connectivity', 'NAT translates private addressing while state tracks the returning conversation.'],
  ['Firewalls & Network Security', 'Policy evaluates identity, zone, address, protocol, port and connection state.'],
  ['VPN & Secure Connectivity', 'Encrypted tunnels protect remote and site-to-site traffic across untrusted networks.'],
  ['Enterprise Network Architecture', 'Layered edge, security, core, access and service zones make trust boundaries visible.'],
  ['High Availability & Redundancy', 'Diverse paths and stateful pairs reduce single points of failure—when regularly tested.'],
  ['Network Troubleshooting', 'Test physical, link, addressing, gateway, DNS, routing, firewall and application layers in order.'],
  ['End-to-End Packet Journey', 'Combine resolution, switching, routing, policy, translation and return-state concepts.'],
] as const;

const packet = [
  ['Client', 'DNS resolves the server name. The client selects a source port and sees the destination is remote.'],
  ['Switch', 'ARP discovers the default gateway MAC. The switch forwards the Ethernet frame using its MAC table.'],
  ['Default Gateway', 'The gateway removes the local frame, decrements TTL and routes by destination IP.'],
  ['Firewall', 'Stateful policy permits or denies the TCP/UDP conversation and records approved state.'],
  ['Edge Router / NAT', 'Source NAT replaces the private source IP; the router selects the Internet path.'],
  ['Internet', 'Multiple routers forward the packet using destination prefixes—not the original local MAC addresses.'],
  ['Remote Server', 'The service responds; state tables reverse NAT and allow the return traffic to the client.'],
] as const;

const troubleshooting = [
  ['Physical', 'Is power, cabling or radio connectivity present?'], ['Link', 'Is the interface up and in the intended VLAN?'],
  ['Addressing', 'Is the IP, prefix and DHCP lease correct and non-duplicated?'], ['Gateway', 'Can the host reach its local default gateway?'],
  ['DNS', 'Does name resolution return the expected address?'], ['Routing', 'Does each direction have a valid route?'],
  ['Firewall', 'Is policy, port and connection state allowing the flow?'], ['Application', 'Is the service listening, healthy and using the expected protocol?'],
] as const;

export function NetworkLearningJourney() {
  const [module, setModule] = useState(0); const [hop, setHop] = useState(0); const [diagnostic, setDiagnostic] = useState(0);
  return <div className="space-y-6">
    <header className="mindmap-hero rounded-3xl p-6 md:p-9"><p className="mindmap-chip">Insights &amp; Innovation · Guided learning</p><h1 className="mt-3 text-3xl font-semibold md:text-5xl">Security Map</h1><p className="mt-4 max-w-3xl text-muted">Learn how enterprise networks operate—from a local frame to a secured, resilient architecture—through progressive, connected explanations.</p></header>
    <section aria-labelledby="learning-path-title"><h2 id="learning-path-title" className="text-2xl font-semibold">Explore the network learning pathway</h2><div className="learning-path mt-4" role="tablist" aria-label="Network learning modules">{modules.map((item, index) => <button role="tab" aria-selected={module === index} className={module === index ? 'is-active' : ''} onClick={() => setModule(index)} key={item[0]}><span>{String(index + 1).padStart(2, '0')}</span>{item[0]}</button>)}</div><article className="glass mt-3 rounded-2xl p-5" role="tabpanel" aria-live="polite"><p className="academic-eyebrow">Module {module + 1} of {modules.length}</p><h3 className="mt-2 text-xl font-semibold">{modules[module][0]}</h3><p className="mt-2 text-muted">{modules[module][1]}</p></article></section>
    <section className="glass rounded-3xl p-5 md:p-7" aria-labelledby="packet-title"><p className="academic-eyebrow">End-to-end visualisation</p><h2 id="packet-title" className="mt-2 text-2xl font-semibold">Follow a packet to a remote service</h2><div className="packet-path mt-5">{packet.map((item, index) => <div key={item[0]} className="contents"><button aria-pressed={hop === index} onClick={() => setHop(index)} className={hop === index ? 'is-active' : ''}>{item[0]}</button>{index < packet.length - 1 && <ArrowRight aria-hidden="true" />}</div>)}</div><div className="mt-5 rounded-xl border border-white/10 p-4" aria-live="polite"><h3 className="font-semibold">{packet[hop][0]}</h3><p className="mt-2 text-sm leading-6 text-muted">{packet[hop][1]}</p></div></section>
    <section className="grid gap-5 lg:grid-cols-2"><article className="glass rounded-2xl p-5"><p className="academic-eyebrow">Target architecture</p><h2 className="mt-2 text-xl font-semibold">A defensible enterprise network</h2><div className="architecture-flow mt-4">{['Internet', 'Edge routers', 'Firewall HA pair', 'DMZ · WAF · VPN', 'Core network', 'Distribution & access', 'User · Server · Management · Security · Guest VLANs'].map((item) => <div key={item}><CheckCircle2 size={16} aria-hidden="true" />{item}</div>)}</div><p className="mt-4 text-sm text-muted">Progressive segmentation limits trust and blast radius. IDS/IPS and infrastructure telemetry feed the SOC/SIEM; redundant edge and firewall paths protect availability.</p></article><article className="glass rounded-2xl p-5"><p className="academic-eyebrow">Defensive troubleshooting</p><h2 className="mt-2 text-xl font-semibold">Diagnose from foundations upward</h2><div className="capability-tabs mt-4">{troubleshooting.map((item, index) => <button className={diagnostic === index ? 'is-active' : ''} onClick={() => setDiagnostic(index)} key={item[0]}>{item[0]}</button>)}</div><div className="mt-4 rounded-xl border border-white/10 p-4" aria-live="polite"><strong>{troubleshooting[diagnostic][0]}</strong><p className="mt-2 text-sm text-muted">{troubleshooting[diagnostic][1]}</p></div></article></section>
  </div>;
}
