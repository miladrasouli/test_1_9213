import type { LucideIcon } from 'lucide-react';

export function Stat({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string | number }) {
  return <div className="stat"><Icon size={22} /><span>{label}</span><strong>{value}</strong></div>;
}
