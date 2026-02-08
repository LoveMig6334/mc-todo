interface StatCardProps {
  label: string;
  value: number;
  subtitle?: string;
  icon: React.ReactNode;
  accentColor?: string;
}

export default function StatCard({
  label,
  value,
  subtitle,
  icon,
  accentColor,
}: StatCardProps) {
  return (
    <div className="rounded-xl border border-zinc-700 bg-zinc-800 p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-zinc-400">{label}</span>
        <span className={accentColor ?? "text-zinc-400"}>{icon}</span>
      </div>
      <p className="mt-2 text-3xl font-bold text-white">{value}</p>
      {subtitle && <p className="mt-1 text-xs text-zinc-500">{subtitle}</p>}
    </div>
  );
}
