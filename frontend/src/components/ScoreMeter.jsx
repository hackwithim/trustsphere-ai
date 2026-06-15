const meterTone = (score) => {
  if (score >= 90) return { stroke: "#4ade80", text: "text-emerald-300", glow: "rgba(74, 222, 128, 0.15)" };
  if (score >= 70) return { stroke: "#60a5fa", text: "text-blue-200", glow: "rgba(96, 165, 250, 0.15)" };
  if (score >= 50) return { stroke: "#facc15", text: "text-amber-200", glow: "rgba(250, 204, 21, 0.15)" };
  if (score >= 30) return { stroke: "#fb923c", text: "text-orange-200", glow: "rgba(251, 146, 60, 0.15)" };
  return { stroke: "#f87171", text: "text-red-200", glow: "rgba(248, 113, 113, 0.15)" };
};

export default function ScoreMeter({ score, riskLevel }) {
  const radius = 72;
  const stroke = 12;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const tone = meterTone(score);

  return (
    <div className="flex flex-col items-center justify-center gap-5">
      <div className="relative h-48 w-48">
        {/* Soft Radial Glow behind the meter */}
        <div 
          className="absolute inset-4 rounded-full transition-all duration-700 ease-in-out blur-xl" 
          style={{
            background: `radial-gradient(circle, ${tone.glow} 0%, transparent 80%)`
          }}
        />

        <svg className="-rotate-90 relative z-10" viewBox="0 0 180 180">
          <defs>
            <filter id="glow-ring" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background Track Circle */}
          <circle
            cx="90"
            cy="90"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={stroke}
          />

          {/* Active Colored Progress Circle */}
          <circle
            cx="90"
            cy="90"
            r={radius}
            fill="none"
            stroke={tone.stroke}
            strokeLinecap="round"
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            filter="url(#glow-ring)"
            className="transition-all duration-500 ease-out"
          />
        </svg>

        {/* Center Text Container */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
          <span className={`text-5xl font-bold tracking-tight transition-colors duration-500 ${tone.text}`}>
            {score}
          </span>
          <span className="mt-1.5 text-xs font-semibold uppercase tracking-wider text-slate-300 opacity-90">
            Trust Score
          </span>
        </div>
      </div>
      
      <span className="relative z-10 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-semibold text-white backdrop-blur-md shadow-sm">
        {riskLevel}
      </span>
    </div>
  );
}
