export default function StatCard({ title, value, helper, icon: Icon, tone = "blue" }) {
  const tones = {
    blue: "from-blue-500/10 via-blue-500/5 to-cyan-500/5 text-blue-100 border-blue-500/10",
    green: "from-emerald-500/10 via-emerald-500/5 to-teal-500/5 text-emerald-100 border-emerald-500/10",
    amber: "from-amber-500/10 via-amber-500/5 to-orange-500/5 text-amber-100 border-amber-500/10",
    red: "from-red-500/10 via-red-500/5 to-rose-500/5 text-red-100 border-red-500/10",
  };

  return (
    <div className={`glass-card bg-gradient-to-br ${tones[tone]} p-5 hover:border-white/20`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-300 opacity-90">{title}</p>
          <p className="mt-3.5 text-2xl font-bold text-white tracking-tight">{value}</p>
          {helper ? <p className="mt-2 text-xs font-semibold text-slate-300 opacity-90">{helper}</p> : null}
        </div>
        {Icon ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-2.5 transition-all duration-300 hover:rotate-6 hover:bg-white/10 shadow-inner">
            <Icon className="h-5 w-5 opacity-90" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
