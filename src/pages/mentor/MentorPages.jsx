import { useEffect, useState } from "react";
import { api } from "../../api";
import { SkillBars, Stat, StatusPill } from "../../components/ui";

export default function MentorHome() {
  const [summary, setSummary] = useState({});
  const [students, setStudents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    Promise.all([api.get("/dashboard"), api.get("/activities")]).then(([dash, act]) => {
      setSummary(dash.data?.summary || {});
      setStudents(dash.data?.students || []);
      setTasks(dash.data?.tasks || []);
      setActivity(act.data || []);
    });
  }, []);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Assigned students" value={summary.studentsAssigned ?? students.length} />
        <Stat label="Active tasks" value={summary.tasksAssigned ?? tasks.filter((t) => t.status !== "reviewed").length} />
        <Stat label="Submitted" value={summary.pendingReviews ?? tasks.filter((t) => t.status === "submitted").length} />
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="card">
          <h3 className="mb-3 font-semibold">Cohort</h3>
          {students.map((s) => (
            <div key={s.id} className="mb-3 border-b border-slate-100 pb-3 last:border-0 dark:border-slate-800">
              <div className="flex justify-between">
                <p className="font-medium">{s.fullName}</p>
                <StatusPill value={s.status} />
              </div>
              <SkillBars skills={s.skills} />
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
            {!activity.length && <p className="text-sm text-slate-500">No activity available.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export function MentorStudents() {
  const [students, setStudents] = useState([]);
  useEffect(() => {
    api.get("/users").then((r) => setStudents(r.data));
  }, []);
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {students.map((s) => (
        <div key={s.id} className="card">
          <div className="flex justify-between">
            <h3 className="font-semibold">{s.fullName}</h3>
            <StatusPill value={s.status} />
          </div>
          <p className="text-sm text-slate-500">{s.bio}</p>
          <p className="my-2 text-xs">Languages: {(s.languages || []).join(", ")}</p>
          <SkillBars skills={s.skills} />
        </div>
      ))}
    </div>
  );
}

export function MentorTasks() {
  const [tasks, setTasks] = useState([]);
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", deadline: "", assignedTo: [], requiredSkills: "" });

  async function load() {
    const [t, s] = await Promise.all([api.get("/tasks"), api.get("/users")]);
    setTasks(t.data);
    setStudents(s.data);
  }
  useEffect(() => {
    load();
  }, []);

  async function create(e) {
    e.preventDefault();
    await api.post("/tasks", {
      ...form,
      requiredSkills: form.requiredSkills.split(",").map((x) => x.trim()).filter(Boolean),
      deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
    });
    setForm({ title: "", description: "", deadline: "", assignedTo: [], requiredSkills: "" });
    load();
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <form className="card space-y-3" onSubmit={create}>
        <h2 className="font-semibold">Assign work from admin orders</h2>
        <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <textarea placeholder="Description / admin order notes" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <input placeholder="Skills" value={form.requiredSkills} onChange={(e) => setForm({ ...form, requiredSkills: e.target.value })} />
        <input type="datetime-local" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
        <div className="space-y-1 text-sm">
          {students.map((s) => (
            <label key={s.id} className="flex gap-2">
              <input
                type="checkbox"
                checked={form.assignedTo.includes(s.id)}
                onChange={() =>
                  setForm((f) => ({
                    ...f,
                    assignedTo: f.assignedTo.includes(s.id) ? f.assignedTo.filter((x) => x !== s.id) : [...f.assignedTo, s.id],
                  }))
                }
              />
              {s.fullName}
            </label>
          ))}
        </div>
        <button className="btn">Assign to cohort</button>
      </form>
      <div className="card space-y-2">
        <h2 className="font-semibold">Task board</h2>
        {tasks.map((t) => (
          <div key={t.id} className="rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-700">
            <div className="flex justify-between">
              <span className="font-medium">{t.title}</span>
              <StatusPill value={t.status} />
            </div>
            <p className="text-slate-500">{t.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MentorProgress() {
  const [subs, setSubs] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [evaluation, setEvaluation] = useState({
    overall: "",
    comments: "",
    scores: { technical: 4, communication: 4, professionalism: 4 },
  });
  const [message, setMessage] = useState("");

  async function load() {
    const [submissionResponse, taskResponse, userResponse] = await Promise.all([
      api.get("/submissions"),
      api.get("/tasks"),
      api.get("/users"),
    ]);
    setSubs(submissionResponse.data);
    setTasks(taskResponse.data);
    setUsers(userResponse.data);
    if (userResponse.data[0]) setSelectedStudent(userResponse.data[0].id);
  }

  useEffect(() => {
    load();
  }, []);

  const name = (id) => users.find((u) => u.id === id)?.fullName || id;
  const taskName = (id) => tasks.find((t) => t.id === id)?.title || id;

  async function submitEvaluation(e) {
    e.preventDefault();
    if (!selectedStudent) return;
    await api.post(`/users/${selectedStudent}/evaluation`, evaluation);
    setMessage("Final mentor evaluation saved.");
  }

  return (
    <div className="space-y-5">
      <div className="card space-y-3">
        <h2 className="font-semibold">Progress tracker</h2>
        {subs.map((s) => (
          <div key={s.id} className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
            <p className="font-medium">
              {name(s.studentId)} — {taskName(s.taskId)}
            </p>
            <div className="mt-2 h-2 rounded-full bg-slate-200 dark:bg-slate-800">
              <div className="h-2 rounded-full bg-brand-500" style={{ width: `${s.percent}%` }} />
            </div>
            <p className="mt-2 text-sm text-slate-500">{s.progressNote}</p>
            {s.history?.length > 0 && (
              <div className="mt-3 space-y-2 rounded-xl bg-slate-50 p-2 text-xs dark:bg-slate-900/50">
                <p className="font-medium">Resubmission history</p>
                {s.history.slice().reverse().map((item, index) => (
                  <div key={`${s.id}-${index}`} className="rounded border border-slate-200 p-2 dark:border-slate-700">
                    <div className="flex justify-between gap-2">
                      <span className="font-medium">{item.status}</span>
                      <span>{item.percent}%</span>
                    </div>
                    <p className="mt-1 text-slate-500">{item.progressNote || "No note added"}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        {subs.length === 0 && <p className="text-sm text-slate-500">No updates yet.</p>}
      </div>

      <form className="card space-y-3" onSubmit={submitEvaluation}>
        <h2 className="font-semibold">Final mentor evaluation</h2>
        <select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)}>
          <option value="">Select student</option>
          {users.filter((u) => u.role === "student").map((u) => (
            <option key={u.id} value={u.id}>
              {u.fullName}
            </option>
          ))}
        </select>
        <textarea
          placeholder="Overall evaluation"
          value={evaluation.overall}
          onChange={(e) => setEvaluation((current) => ({ ...current, overall: e.target.value }))}
        />
        {Object.entries(evaluation.scores).map(([key, value]) => (
          <label key={key} className="block text-sm">
            {key}
            <input
              type="range"
              min="1"
              max="5"
              value={value}
              onChange={(e) => setEvaluation((current) => ({
                ...current,
                scores: { ...current.scores, [key]: Number(e.target.value) },
              }))}
            />
            <span className="text-slate-500">{value}/5</span>
          </label>
        ))}
        <textarea
          placeholder="Comments"
          value={evaluation.comments}
          onChange={(e) => setEvaluation((current) => ({ ...current, comments: e.target.value }))}
        />
        <button className="btn" type="submit">Save evaluation</button>
        {message && <p className="text-sm text-emerald-600">{message}</p>}
      </form>
    </div>
  );
}

export function MentorMemos() {
  const [students, setStudents] = useState([]);
  const [memos, setMemos] = useState([]);
  const [toId, setToId] = useState("");
  const [body, setBody] = useState("");
  const [info, setInfo] = useState("");

  async function load() {
    const [s, m] = await Promise.all([api.get("/users"), api.get("/memos")]);
    setStudents(s.data);
    setMemos(m.data);
  }
  useEffect(() => {
    load();
  }, []);

  async function send(e) {
    e.preventDefault();
    await api.post("/memos", { toId, body });
    setBody("");
    setInfo("Memo queued for admin approval.");
    load();
  }

  async function remind() {
    const { data } = await api.post("/memos/reminders", {});
    setInfo(`${data.count} reminder(s) queued for admin approval.`);
    load();
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <form className="card space-y-3" onSubmit={send}>
        <h2 className="font-semibold">Memo (needs admin approval)</h2>
        <select value={toId} onChange={(e) => setToId(e.target.value)} required>
          <option value="">Student</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.fullName}
            </option>
          ))}
        </select>
        <textarea value={body} onChange={(e) => setBody(e.target.value)} required />
        <button className="btn">Submit for approval</button>
        <button type="button" className="btn-ghost" onClick={remind}>
          Remind students with incomplete work
        </button>
        {info && <p className="text-sm text-emerald-600">{info}</p>}
      </form>
      <div className="card space-y-2">
        {memos.map((m) => (
          <div key={m.id} className="rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-700">
            <StatusPill value={m.status} />
            <p className="mt-2">{m.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
