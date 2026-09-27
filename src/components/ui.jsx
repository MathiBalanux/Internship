export function getSkillLabel(level) {
  if (level >= 5) return "Expert";
  if (level >= 4) return "Advanced";
  if (level >= 3) return "Intermediate";
  if (level >= 2) return "Basic";
  return "Beginner";
}

export function SkillBars({ skills = [] }) {
  if (!skills.length) return <p className="text-sm text-slate-500">No skills listed</p>;
  return (
    <div className="space-y-2">
      {skills.map((s) => (
        <div key={s.name}>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="font-medium">{s.name}</span>
            <span className="text-slate-500">{getSkillLabel(s.level)} • {s.level}/5</span>
          </div>
          <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800">
            <div className="h-2 rounded-full bg-brand-500" style={{ width: `${(s.level / 5) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function Stat({ label, value }) {
  return (
    <div className="card">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}

export function StatusPill({ value }) {
  const map = {
    active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    inactive: "bg-slate-200 text-slate-600 dark:bg-slate-800",
    pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/40",
    assigned: "bg-sky-100 text-sky-800 dark:bg-sky-900/40",
    rejected: "bg-rose-100 text-rose-800 dark:bg-rose-900/40",
    todo: "bg-slate-200 text-slate-700 dark:bg-slate-800",
    in_progress: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40",
    submitted: "bg-teal-100 text-teal-800 dark:bg-teal-900/40",
    reviewed: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40",
    sent: "bg-emerald-100 text-emerald-800",
    pending_approval: "bg-amber-100 text-amber-800",
    high: "bg-rose-100 text-rose-700",
    medium: "bg-amber-100 text-amber-700",
    low: "bg-emerald-100 text-emerald-700",
  };
  return <span className={`badge ${map[value] || "bg-slate-200"}`}>{value}</span>;
}
