import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { GraduationCap, Shield, Users } from "lucide-react";

const META = {
  admin: {
    title: "Admin login",
    hint: "Oversee students, mentors, tasks, and memos.",
    icon: Shield,
    demo: "admin@ims.local / Admin@123",
  },
  mentor: {
    title: "Mentor login",
    hint: "Guide your assigned intern cohort.",
    icon: Users,
    demo: "ravi.mentor@ims.local / Mentor@123",
  },
  student: {
    title: "Student login",
    hint: "Track internships, tasks, and deadlines.",
    icon: GraduationCap,
    demo: "priya.student@ims.local / Student@123",
  },
};

const DEMO_ACCOUNTS = [
  { role: "student", label: "Student", email: "priya.student@ims.local", password: "Student@123" },
  { role: "mentor", label: "Mentor", email: "ravi.mentor@ims.local", password: "Mentor@123" },
  { role: "admin", label: "Admin", email: "admin@ims.local", password: "Admin@123" },
];

export default function Login() {
  const { role } = useParams();
  const meta = META[role] || META.student;
  const Icon = meta.icon;
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function useDemo(account) {
    setEmail(account.email);
    setPassword(account.password);
    setError("");
    navigate(`/login/${account.role}`);
  }

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const user = await login(email, password, role);
      navigate(`/${user.role}`);
    } catch (err) {
      const detail = err.response?.data?.detail || "Login failed";
      if (String(detail).includes("deactivated") || String(detail).includes("deactivated")) {
        setError("Your account has been deactivated. Please contact the administrator.");
      } else {
        setError(detail);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="hidden flex-col justify-between bg-slate-900 p-10 text-white md:flex">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-sky-300">IMS</p>
          <h1 className="mt-4 text-4xl font-semibold">Internship Management System</h1>
          <p className="mt-4 max-w-md text-slate-300">{meta.hint}</p>
        </div>
        <div className="rounded-2xl border border-slate-700 bg-slate-800/70 p-4">
          <p className="mb-3 text-sm font-medium text-slate-200">Demo Accounts</p>
          <div className="space-y-2">
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.role}
                type="button"
                onClick={() => useDemo(account)}
                className="flex w-full items-center justify-between rounded-xl border border-slate-700 bg-slate-900/40 px-3 py-2 text-left text-sm text-slate-200 hover:border-sky-400"
              >
                <span>{account.label}</span>
                <span className="text-sky-300">{account.email}</span>
              </button>
            ))}
          </div>
        </div>
        <p className="text-sm text-slate-500">Accounts are created by an administrator.</p>
      </div>
      <div className="flex items-center justify-center p-8">
        <form onSubmit={onSubmit} className="card w-full max-w-md space-y-4">
          <div className="flex items-center gap-3">
            <Icon className="text-brand-600" />
            <h2 className="text-xl font-semibold">{meta.title}</h2>
          </div>
          <label className="block text-sm">
            Email
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required className="mt-1" />
          </label>
          <label className="block text-sm">
            Password
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required className="mt-1" />
          </label>
          <div className="flex items-center justify-between text-xs">
            <button type="button" className="text-brand-600 hover:underline">Forgot password?</button>
            <span className="text-slate-500">Contact administrator to reset your password.</span>
          </div>
          {error && <p className="text-sm text-rose-500">{String(error)}</p>}
          <button className="btn w-full" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
          <p className="text-xs text-slate-500">Demo: {meta.demo}</p>
          <div className="flex justify-between text-xs text-brand-600">
            <Link to="/login/admin">Admin</Link>
            <Link to="/login/mentor">Mentor</Link>
            <Link to="/login/student">Student</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
