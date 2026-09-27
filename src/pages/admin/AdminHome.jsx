import { useEffect, useState } from "react";
import { api } from "../../api";
import { SkillBars, Stat, StatusPill } from "../../components/ui";

export default function AdminHome() {
  const [summary, setSummary] = useState({});
  const [tasks, setTasks] = useState([]);
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    Promise.all([api.get("/dashboard"), api.get("/activities")]).then(([dash, act]) => {
      setSummary(dash.data?.summary || {});
      setTasks(dash.data?.tasks || []);
      setActivity(act.data || []);
    });
  }, []);

  const overdue = tasks.filter((t) => t.deadline && new Date(t.deadline) < new Date() && !["reviewed"].includes(t.status));

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Students" value={summary.studentsTotal ?? 0} />
        <Stat label="Mentors" value={summary.mentorsTotal ?? 0} />
        <Stat label="Open tasks" value={summary.tasksOpen ?? 0} />
        <Stat label="Pending internships" value={summary.pendingInternships ?? 0} />
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <div className="card">
          <h3 className="mb-3 font-semibold">Overdue / at-risk tasks</h3>
          {overdue.length === 0 && <p className="text-sm text-slate-500">No overdue items.</p>}
          {overdue.map((t) => (
            <div key={t.id} className="mb-2 flex items-center justify-between text-sm">
              <span>{t.title}</span>
              <StatusPill value={t.status} />
            </div>
          ))}
        </div>
        <div className="card">
          <h3 className="mb-3 font-semibold">Recent activity</h3>
          <div className="space-y-2 text-sm">
            {activity.slice(0, 5).map((item) => (
              <div key={item.id} className="rounded-lg border border-slate-200 p-2 dark:border-slate-700">
                <p>{item.message}</p>
                <p className="mt-1 text-xs text-slate-500">{item.action}</p>
              </div>
            ))}
            {!activity.length && <p className="text-sm text-slate-500">No activity yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminPeople({ role }) {
  const [people, setPeople] = useState([]);
  const [selected, setSelected] = useState(null);
  const [verificationQueue, setVerificationQueue] = useState([]);

  useEffect(() => {
    api.get("/users", { params: { role } }).then((r) => setPeople(r.data));
    if (role === "mentor") {
      api.get("/users/verification").then((r) => setVerificationQueue(r.data));
    }
  }, [role]);

  async function verifySkill(mentorId, skillName, verified) {
    await api.patch(`/users/${mentorId}/skills/${encodeURIComponent(skillName)}/verify`, {
      verified,
      reviewNote: verified ? "Verified by admin" : "Needs additional evidence",
    });
    const next = await api.get("/users", { params: { role } });
    const queue = await api.get("/users/verification");
    setPeople(next.data);
    setVerificationQueue(queue.data);
    setSelected((current) => next.data.find((person) => person.id === current?.id) || null);
  }

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <div className="card lg:col-span-1">
        <h3 className="mb-3 font-semibold capitalize">{role}s</h3>
        <div className="space-y-2">
          {people.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelected(p)}
              className={`w-full rounded-xl border p-3 text-left text-sm dark:border-slate-700 ${selected?.id === p.id ? "border-brand-500" : "border-slate-200"}`}
            >
              <div className="flex justify-between">
                <span className="font-medium">{p.fullName}</span>
                <StatusPill value={p.status} />
              </div>
              <p className="text-slate-500">{p.email}</p>
            </button>
          ))}
        </div>
      </div>
      <div className="card lg:col-span-2">
        {!selected && <p className="text-slate-500">Select a profile to inspect skills and assignment fit.</p>}
        {selected && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold">{selected.fullName}</h2>
              <p className="text-sm text-slate-500">{selected.bio}</p>
              <p className="mt-2 text-sm">Languages: {(selected.languages || []).join(", ") || "—"}</p>
              {role === "student" && <p className="text-sm">Internship: {selected.internshipStatus}</p>}
            </div>
            <SkillBars skills={selected.skills} />
            {role === "mentor" && (
              <div className="space-y-3 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                <h3 className="font-medium">Skill verification</h3>
                {(selected.skills || []).map((skill) => (
                  <div key={`${selected.id}-${skill.name}`} className="rounded-lg border border-slate-200 p-2 text-sm dark:border-slate-700">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">{skill.name}</span>
                      <StatusPill value={skill.verificationStatus || "pending"} />
                    </div>
                    <p className="mt-1 text-slate-500">Evidence: {skill.evidence || "—"}</p>
                    <div className="mt-2 flex gap-2">
                      <button type="button" className="btn-ghost" onClick={() => verifySkill(selected.id, skill.name, true)}>Verify</button>
                      <button type="button" className="btn-ghost" onClick={() => verifySkill(selected.id, skill.name, false)}>Reject</button>
                    </div>
                  </div>
                ))}
                {!selected.skills?.length && <p className="text-sm text-slate-500">No skills recorded for this mentor.</p>}
              </div>
            )}
            {role === "mentor" && verificationQueue.length > 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-500/40 dark:bg-amber-900/20 dark:text-amber-200">
                <p className="font-medium">Verification queue</p>
                <ul className="mt-2 space-y-1">
                  {verificationQueue.slice(0, 5).map((item, index) => (
                    <li key={`${item.mentorId}-${item.skillName}-${index}`}>{item.mentorName} — {item.skillName} ({item.verificationStatus})</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function AdminUsers() {
  const [mentors, setMentors] = useState([]);
  const [form, setForm] = useState({
    role: "student",
    fullName: "",
    email: "",
    password: "",
    bio: "",
    languages: "Python",
    skills: "Python:3",
    mentorId: "",
  });
  const [msg, setMsg] = useState("");

  useEffect(() => {
    api.get("/users", { params: { role: "mentor" } }).then((r) => setMentors(r.data));
  }, []);

  async function submit(e) {
    e.preventDefault();
    const skills = form.skills
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean)
      .map((x) => {
        const [name, level] = x.split(":");
        return { name: name.trim(), level: Number(level || 3) };
      });
    await api.post("/users", {
      role: form.role,
      fullName: form.fullName,
      email: form.email,
      password: form.password,
      bio: form.bio,
      languages: form.languages.split(",").map((s) => s.trim()).filter(Boolean),
      skills,
      mentorId: form.mentorId || null,
    });
    setMsg("User created");
  }

  return (
    <form onSubmit={submit} className="card max-w-xl space-y-3">
      <h2 className="text-lg font-semibold">Create account</h2>
      <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
        <option value="student">Student</option>
        <option value="mentor">Mentor</option>
      </select>
      <input placeholder="Full name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
      <input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
      <input placeholder="Temporary password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
      <input placeholder="Languages (comma)" value={form.languages} onChange={(e) => setForm({ ...form, languages: e.target.value })} />
      <input placeholder="Skills name:level, e.g. React:4,Python:3" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} />
      <textarea placeholder="Bio" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
      {form.role === "student" && (
        <select value={form.mentorId} onChange={(e) => setForm({ ...form, mentorId: e.target.value })}>
          <option value="">No mentor yet</option>
          {mentors.map((m) => (
            <option key={m.id} value={m.id}>
              {m.fullName}
            </option>
          ))}
        </select>
      )}
      <button className="btn">Create</button>
      {msg && <p className="text-sm text-emerald-600">{msg}</p>}
    </form>
  );
}
