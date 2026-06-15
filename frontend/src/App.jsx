import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Building2,
  CheckCircle2,
  CreditCard,
  Fingerprint,
  LineChart,
  Lock,
  MapPin,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import ScoreMeter from "./components/ScoreMeter.jsx";
import StatCard from "./components/StatCard.jsx";
import { API_BASE_URL, evaluateTrust, login } from "./lib/api.js";

const demoCredentials = {
  email: "aisha.mehta@trustbank.com",
  password: "Trust@123",
};

const defaultDevice = {
  new_device: false,
  rooted_device: false,
  unknown_browser: false,
};

const defaultSession = {
  login_time: 10,
  session_duration_minutes: 18,
};

const defaultTransaction = {
  beneficiary_name: "Aarav Sharma",
  amount: 5000,
  new_beneficiary: false,
};

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const chartColors = ["#60a5fa", "#22c55e", "#facc15", "#fb923c", "#f87171"];

function toneForScore(score = 100) {
  if (score >= 90) return "green";
  if (score >= 70) return "blue";
  if (score >= 50) return "amber";
  return "red";
}

function transactionAlert(action) {
  if (action === "Allow" || action === "Monitor") {
    return {
      title: "Transaction Approved",
      body: action === "Monitor" ? "Approved with enhanced monitoring." : "Approved instantly.",
      tone: "border-emerald-500/20 bg-emerald-500/5 text-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.1)]",
    };
  }
  if (action === "OTP Verification") {
    return {
      title: "OTP Verification Required",
      body: "Trust score moved into the medium-risk band.",
      tone: "border-amber-500/20 bg-amber-500/5 text-amber-100 shadow-[0_0_15px_rgba(245,158,11,0.1)]",
    };
  }
  if (action === "Biometric Verification") {
    return {
      title: "Biometric Verification Required",
      body: "Additional identity proof is required before releasing funds.",
      tone: "border-orange-500/20 bg-orange-500/5 text-orange-100 shadow-[0_0_15px_rgba(249,115,22,0.1)]",
    };
  }
  return {
    title: "Transaction Blocked",
    body: "Critical trust failure. The bank should stop the transaction.",
    tone: "border-red-500/20 bg-red-500/5 text-red-100 shadow-[0_0_15px_rgba(239,68,68,0.1)]",
  };
}

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState(demoCredentials.email);
  const [password, setPassword] = useState(demoCredentials.password);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await login(email, password);
      onLogin(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8">
      <section className="grid w-full max-w-5xl gap-8 md:grid-cols-[1.1fr_0.9fr]">
        <div className="flex flex-col justify-center rounded-2xl border border-white/10 bg-white/[0.02] p-8 md:p-12 shadow-2xl backdrop-blur-md">
          <div className="mb-8 inline-flex w-fit items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/5 px-4 py-2 text-xs font-semibold text-blue-300 tracking-wider uppercase">
            <ShieldCheck className="h-4 w-4" />
            Enterprise Security Guard (ESG)
          </div>
          <h1 className="max-w-xl text-4xl font-bold leading-tight text-white md:text-5xl tracking-tight">
            TrustSphere Security Guard
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-300 font-medium">
            Continuous identity verification and fraud mitigation. This platform scores device, location,
            session, transaction, and behavioral signals before a payment is released.
          </p>
          <div className="mt-10 grid gap-3 text-xs font-bold text-slate-300 sm:grid-cols-3">
            <span className="rounded-xl border border-white/5 bg-white/[0.03] p-4 text-center">Dynamic trust score</span>
            <span className="rounded-xl border border-white/5 bg-white/[0.03] p-4 text-center">Isolation Forest AI</span>
            <span className="rounded-xl border border-white/5 bg-white/[0.03] p-4 text-center">Adaptive auth actions</span>
          </div>
        </div>

        <form className="glass-card p-6 md:p-8 flex flex-col justify-center" onSubmit={handleSubmit}>
          <div className="mb-8 flex items-center gap-3.5">
            <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400 border border-blue-500/15 shadow-inner">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Banking Login</h2>
              <p className="text-xs font-semibold text-slate-300 mt-0.5">Demo customer access</p>
            </div>
          </div>

          <label className="mb-5 block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-300">Email</span>
            <input className="field" type="email" placeholder="aisha.mehta@trustbank.com" required value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>

          <label className="mb-6 block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-300">Password</span>
            <input
              className="field"
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          {error ? (
            <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm font-semibold text-red-200">
              {error}
            </div>
          ) : null}

          <button
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3.5 font-bold text-white transition-all hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98] hover:shadow-[0_0_20px_rgba(31,111,235,0.3)] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading}
            type="submit"
          >
            <Lock className="h-4 w-4" />
            {loading ? "Authenticating..." : "Login"}
          </button>

          <div className="mt-8 rounded-xl border border-white/5 bg-white/[0.02] p-4 text-xs font-semibold text-slate-300">
            <p className="font-bold text-white text-sm">Demo credentials</p>
            <p className="mt-2.5">Email: <code className="text-blue-300">{demoCredentials.email}</code></p>
            <p className="mt-1">Password: <code className="text-blue-300">{demoCredentials.password}</code></p>
            <div className="mt-3.5 border-t border-white/5 pt-3.5 flex justify-between text-slate-400">
              <span>API Endpoint:</span>
              <code>{API_BASE_URL}</code>
            </div>
          </div>
        </form>
      </section>
    </main>
  );
}

function Dashboard() {
  const [auth, setAuth] = useState(null);
  const [device, setDevice] = useState(defaultDevice);
  const [location, setLocation] = useState("Pune");
  const [session, setSession] = useState(defaultSession);
  const [transaction, setTransaction] = useState(defaultTransaction);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [lastAlert, setLastAlert] = useState(null);
  const [loading, setLoading] = useState(false);

  const payload = useMemo(
    () => ({
      user_id: auth?.user?.id || 1,
      device,
      location: { location },
      session,
      transaction: {
        ...transaction,
        amount: Number(transaction.amount) || 0,
      },
    }),
    [auth?.user?.id, device, location, session, transaction]
  );

  async function evaluate(nextPayload = payload, options = {}) {
    if (!auth) return null;
    setError("");
    if (options.interactive) setLoading(true);
    try {
      const response = await evaluateTrust(nextPayload);
      setResult(response);
      if (options.alert) setLastAlert(transactionAlert(response.action));
      return response;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      if (options.interactive) setLoading(false);
    }
  }

  useEffect(() => {
    if (!auth) return;
    const timer = window.setTimeout(() => {
      evaluate(payload);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [auth, payload]);

  function applyScenario(name) {
    const scenarios = {
      normal: {
        device: defaultDevice,
        location: "Pune",
        session: defaultSession,
        transaction: defaultTransaction,
      },
      suspicious: {
        device: defaultDevice,
        location: "Pune",
        session: { login_time: 19, session_duration_minutes: 95 },
        transaction: {
          beneficiary_name: "New Vendor Treasury",
          amount: 500000,
          new_beneficiary: true,
        },
      },
      critical: {
        device: { new_device: true, rooted_device: false, unknown_browser: true },
        location: "Singapore",
        session: { login_time: 2, session_duration_minutes: 130 },
        transaction: {
          beneficiary_name: "Offshore Settlement Account",
          amount: 1000000,
          new_beneficiary: true,
        },
      },
    };

    const scenario = scenarios[name];
    setDevice(scenario.device);
    setLocation(scenario.location);
    setSession(scenario.session);
    setTransaction(scenario.transaction);
    evaluate(
      {
        user_id: auth.user.id,
        device: scenario.device,
        location: { location: scenario.location },
        session: scenario.session,
        transaction: scenario.transaction,
      },
      { interactive: true, alert: true }
    );
  }

  if (!auth) return <LoginPage onLogin={setAuth} />;

  const score = result?.trust_score ?? 100;
  const riskLevel = result?.risk_level ?? "Trusted";
  const reasonList = result?.reasons ?? ["Known device, known location, and normal banking behavior"];
  const transactionRisk =
    result?.deductions?.filter((item) => item.category === "transaction").reduce((sum, item) => sum + item.points, 0) || 0;
  const alert = lastAlert;

  const initials = auth.user.full_name
    .split(" ")
    .map((name) => name[0])
    .join("");

  return (
    <main className="min-h-screen px-4 py-8 text-white lg:px-8 max-w-7xl mx-auto">
      <header className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-300">
            <ShieldCheck className="h-4 w-4" />
            TrustSphere ESG
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Real-Time Transaction Risk Engine</h1>
          <p className="mt-1.5 text-sm font-semibold text-slate-300">Continuous Identity Verification & Fraud Mitigation.</p>
        </div>
        <div className="flex items-center gap-3.5 rounded-2xl border border-white/10 bg-white/[0.03] p-3.5 pr-5 backdrop-blur-md">
          <div className="rounded-full bg-blue-500/20 border border-blue-500/25 p-2.5 text-blue-300 font-bold w-11 h-11 flex items-center justify-center shadow-inner">
            {initials}
          </div>
          <div>
            <p className="font-bold text-white leading-tight">{auth.user.full_name}</p>
            <p className="text-xs font-semibold text-slate-300 mt-1">{auth.user.role}</p>
          </div>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        {/* Left Column: Simulation Console */}
        <section className="space-y-6">
          <div className="glass-card p-6 space-y-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-300 opacity-90">Simulate Risk Signals</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight">Simulation Console</h2>
            </div>

            {/* Section 1: Transaction Simulation */}
            <div className="border-t border-white/5 pt-5 space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-blue-300">
                <CreditCard className="h-4 w-4" />
                <span>Transaction Details</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-300">Beneficiary Name</span>
                  <input
                    className="field"
                    value={transaction.beneficiary_name}
                    onChange={(event) =>
                      setTransaction((current) => ({ ...current, beneficiary_name: event.target.value }))
                    }
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-300">Amount (INR)</span>
                  <input
                    className="field"
                    min="1"
                    type="number"
                    value={transaction.amount}
                    onChange={(event) =>
                      setTransaction((current) => ({ ...current, amount: Number(event.target.value) }))
                    }
                  />
                </label>
              </div>
              <label className="control-label">
                <span className="text-sm font-semibold text-slate-300">New Beneficiary Account</span>
                <input
                  checked={transaction.new_beneficiary}
                  type="checkbox"
                  onChange={(event) =>
                    setTransaction((current) => ({ ...current, new_beneficiary: event.target.checked }))
                  }
                />
              </label>
            </div>

            {/* Section 2: Device Intelligence */}
            <div className="border-t border-white/5 pt-5 space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-blue-300">
                <Smartphone className="h-4 w-4" />
                <span>Device Intelligence</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  ["new_device", "New Device"],
                  ["rooted_device", "Rooted Device"],
                  ["unknown_browser", "Unknown Browser"],
                ].map(([key, label]) => (
                  <label className="control-label flex-col items-start p-3 gap-2" key={key}>
                    <span className="text-xs font-bold text-slate-300">{label}</span>
                    <input
                      checked={device[key]}
                      type="checkbox"
                      onChange={(event) => setDevice((current) => ({ ...current, [key]: event.target.checked }))}
                    />
                  </label>
                ))}
              </div>
            </div>

            {/* Section 3: Location Intelligence */}
            <div className="border-t border-white/5 pt-5 space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-blue-300">
                <MapPin className="h-4 w-4" />
                <span>Location Intelligence</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 items-center">
                <select className="field cursor-pointer" value={location} onChange={(event) => setLocation(event.target.value)}>
                  <option>Pune</option>
                  <option>Mumbai</option>
                  <option>Delhi</option>
                  <option>Singapore</option>
                </select>
                <div className="rounded-xl border border-white/5 bg-white/[0.015] p-3.5 text-xs font-bold text-slate-300 flex justify-between">
                  <span>Location Risk:</span>
                  <span className="text-white font-extrabold uppercase tracking-wider">{result?.location_risk_indicator ?? "Low"}</span>
                </div>
              </div>
            </div>

            {/* Section 4: Session & Behavioral Intelligence */}
            <div className="border-t border-white/5 pt-5 space-y-5">
              <div className="flex items-center justify-between text-sm font-bold text-blue-300">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  <span>Session & Behavioral Settings</span>
                </div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Risk Points: {transactionRisk ? `${transactionRisk} pts` : "Normal"}
                </span>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="flex flex-col gap-2 p-3 rounded-xl border border-white/5 bg-white/[0.01]">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-300">
                    <span className="whitespace-nowrap">Login Time</span>
                    <code className="text-blue-300 font-bold">{session.login_time}:00</code>
                  </div>
                  <input
                    max="23"
                    min="0"
                    type="range"
                    value={session.login_time}
                    onChange={(event) => setSession((current) => ({ ...current, login_time: Number(event.target.value) }))}
                  />
                </label>
                <label className="flex flex-col gap-2 p-3 rounded-xl border border-white/5 bg-white/[0.01]">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-300">
                    <span className="whitespace-nowrap">Session Duration</span>
                    <code className="text-blue-300 font-bold">{session.session_duration_minutes} min</code>
                  </div>
                  <input
                    max="180"
                    min="1"
                    type="range"
                    value={session.session_duration_minutes}
                    onChange={(event) =>
                      setSession((current) => ({ ...current, session_duration_minutes: Number(event.target.value) }))
                    }
                  />
                </label>
              </div>
            </div>

            {/* Scenario Quick-Select & Trigger Buttons */}
            <div className="border-t border-white/5 pt-5 space-y-4">
              <button
                className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-4 font-bold text-white transition-all duration-300 hover:from-blue-500 hover:to-indigo-500 hover:shadow-[0_0_20px_rgba(31,111,235,0.4)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2"
                disabled={loading}
                onClick={() => evaluate(payload, { interactive: true, alert: true })}
                type="button"
              >
                <Lock className="h-4 w-4" />
                {loading ? "Evaluating Trust Score..." : "Evaluate Secure Transfer"}
              </button>

              <div className="grid gap-3 sm:grid-cols-3">
                <button
                  className="flex flex-col items-center justify-center p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] transition-all hover:border-emerald-500/25 text-center cursor-pointer"
                  onClick={() => applyScenario("normal")}
                >
                  <span className="text-xs font-bold text-emerald-400">Normal</span>
                  <span className="text-[10px] font-semibold text-slate-300 mt-1">INR 5k (Allow)</span>
                </button>
                <button
                  className="flex flex-col items-center justify-center p-3 rounded-xl border border-amber-500/15 bg-amber-500/5 hover:bg-amber-500/10 transition-all hover:border-amber-500/30 text-center cursor-pointer"
                  onClick={() => applyScenario("suspicious")}
                >
                  <span className="text-xs font-bold text-amber-400">Suspicious</span>
                  <span className="text-[10px] font-semibold text-slate-300 mt-1">INR 500k (OTP)</span>
                </button>
                <button
                  className="flex flex-col items-center justify-center p-3 rounded-xl border border-red-500/15 bg-red-500/5 hover:bg-red-500/10 transition-all hover:border-red-500/30 text-center cursor-pointer"
                  onClick={() => applyScenario("critical")}
                >
                  <span className="text-xs font-bold text-red-400">Critical</span>
                  <span className="text-[10px] font-semibold text-slate-300 mt-1">INR 1M (Block)</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Right Column: Decision & Live Analytics */}
        <section className="space-y-6">
          {/* Action Alert Banner */}
          {alert ? (
            <div className={`rounded-xl border p-4 shadow-sm transition-all duration-500 ${alert.tone}`}>
              <div className="flex items-start gap-3">
                {alert.title === "Transaction Approved" ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0" />
                )}
                <div>
                  <p className="font-bold text-sm">{alert.title}</p>
                  <p className="mt-1 text-xs font-medium opacity-90 leading-relaxed">{alert.body}</p>
                </div>
              </div>
            </div>
          ) : null}

          {/* Stat Cards Grid */}
          <div className="grid gap-4 grid-cols-2">
            <StatCard
              helper={riskLevel}
              icon={ShieldCheck}
              title="Trust Score"
              tone={toneForScore(score)}
              value={score}
            />
            <StatCard
              helper={result?.device_status ?? "Trusted"}
              icon={Smartphone}
              title="Device Risk"
              tone={result?.device_status === "Compromised" ? "red" : result?.device_status === "Suspicious" ? "amber" : "green"}
              value={result?.device_status ?? "Trusted"}
            />
            <StatCard
              helper={result?.location_status ?? "Known Location"}
              icon={MapPin}
              title="Location Risk"
              tone={result?.location_risk_indicator === "High" ? "red" : result?.location_risk_indicator === "Medium" ? "amber" : "green"}
              value={result?.location_risk_indicator ?? "Low"}
            />
            <StatCard
              helper={`Drift score: ${result?.anomaly_score ?? 0}`}
              icon={Activity}
              title="Behavioral Heuristics"
              tone={result?.anomaly_detected ? "red" : "blue"}
              value={result?.anomaly_detected ? "Drift" : "Baseline"}
            />
          </div>

          {/* Main live evaluation card (ScoreMeter + Explainable AI) */}
          <div className="glass-card p-6 grid gap-6 md:grid-cols-[0.85fr_1.15fr] items-center">
            <div>
              <div className="mb-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-300 opacity-90">Live Evaluation</p>
                <h3 className="text-xl font-bold tracking-tight mt-1">Security Score</h3>
              </div>
              <ScoreMeter score={score} riskLevel={riskLevel} />
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-blue-300">
                <Fingerprint className="h-4 w-4" />
                <span>Rule Evaluation Engine</span>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 flex justify-between items-center text-xs">
                <div>
                  <span className="text-slate-400 font-semibold">Recommended Action:</span>
                  <p className="mt-1 font-bold text-sm text-blue-300">{result?.recommended_action ?? "Allow"}</p>
                </div>
                {result?.anomaly_detected ? (
                  <div className="text-right text-red-400 font-bold border border-red-500/20 bg-red-500/5 px-2.5 py-1.5 rounded-lg">
                    Heuristic Drift
                  </div>
                ) : null}
              </div>
              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-300 opacity-90">Active Security Alerts</p>
                <ul className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {reasonList.map((reason) => (
                    <li className="rounded-xl border border-white/5 bg-white/[0.015] p-2.5 text-xs font-semibold text-slate-300 leading-normal flex items-start gap-2" key={reason}>
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
                  {result?.anomaly_detected ? (
                <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-xs font-bold text-red-200 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                  Warning: Session heuristic parameters exceed normal user baseline profiles.
                </div>
              ) : null}
              </div>
            </div>
          </div>

          {/* Fraud Risk Analytics Charts */}
          <div className="glass-card p-6 space-y-5">
            <div className="flex items-center gap-2">
              <LineChart className="h-5 w-5 text-blue-400" />
              <div>
                <h2 className="text-xl font-bold tracking-tight">Historical Risk Vectors</h2>
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
              <div>
                <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-300 opacity-90">Trust Score Trend</p>
                <div className="chart-surface">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={result?.analytics?.trust_score_trend || []}>
                      <defs>
                        <linearGradient id="scoreGradient" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                      <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 9, fontWeight: 600 }} />
                      <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 9, fontWeight: 600 }} />
                      <Tooltip contentStyle={{ background: "#0b274a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", boxShadow: "0 10px 25px rgba(0,0,0,0.5)" }} />
                      <Area dataKey="score" fill="url(#scoreGradient)" stroke="#60a5fa" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div>
                <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-300 opacity-90">Risk Distribution</p>
                <div className="chart-surface">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={result?.analytics?.risk_distribution || []}
                        dataKey="value"
                        innerRadius={40}
                        nameKey="name"
                        outerRadius={70}
                        paddingAngle={4}
                      >
                        {(result?.analytics?.risk_distribution || []).map((entry, index) => (
                          <Cell fill={chartColors[index % chartColors.length]} key={entry.name} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: "#0b274a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", boxShadow: "0 10px 25px rgba(0,0,0,0.5)" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div>
                <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-300 opacity-90">Transaction Activity</p>
                <div className="chart-surface">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={result?.analytics?.transaction_activity || []}>
                      <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                      <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 9, fontWeight: 600 }} />
                      <YAxis stroke="#64748b" tick={{ fontSize: 9, fontWeight: 600 }} tickFormatter={(value) => `${Math.round(value / 1000)}k`} />
                      <Tooltip
                        contentStyle={{ background: "#0b274a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", boxShadow: "0 10px 25px rgba(0,0,0,0.5)" }}
                        formatter={(value) => currency.format(value)}
                      />
                      <Bar dataKey="amount" fill="#60a5fa" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Dashboard;
