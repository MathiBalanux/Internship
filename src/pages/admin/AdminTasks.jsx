import { useEffect, useState } from "react";
import { api } from "../../api";
import { SkillBars, StatusPill } from "../../components/ui";

export default function AdminTasks() {
  const [tasks, setTasks] = useState([]);
  const [students, setStudents] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [ranked, setRanked] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    requiredSkills: "React,Python",
    deadline: "",
    mentorId: "",
    assignedTo: [],
  });

  async function load() {
    const [t, s, m] = await Promise.all([
      api.get("/tasks"),
      api.get("/users", { params: { role: "student" } }),
      api.get("/users", { params: { role: "mentor" } }),
    ]);
    setTasks(t.data);
    setStudents(s.data);
    setMentors(m.data);
  }

  useEffect(() => {
    load();
  }, []);

  async function suggest() {
    const { data } = await api.get("/tasks/suggest", { params: { skills: form.requiredSkills } });
    setRanked(data);
  }

  function toggleAssign(id) {
    setForm((f) => ({
      ...f,
      assignedTo: f.assignedTo.includes(id) ? f.assignedTo.filter((x) => x !== id) : [...f.assignedTo, id],
    }));
  }

  async function create(e) {
    e.preventDefault();
    await api.post("/tasks", {
      ...form,
      requiredSkills: form.requiredSkills.split(",").map((s) => s.trim()).filter(Boolean),
      deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
    });
    setForm({ ...form, title: "", description: "" });
    load();
  }

  async function review(id) {
    const note = prompt("Review note") || "Looks good";
    await api.patch(`/tasks/${id}`, { status: "reviewed", reviewNote: note });
    load();
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <form onSubmit={create} className="card space-y-3">
        <h2 className="font-semibold">Assign a task</h2>
        <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <input placeholder="Required skills (comma)" value={form.requiredSkills} onChange={(e) => setForm({ ...form, requiredSkills: e.target.value })} />
        <input type="datetime-local" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
        <select value={form.mentorId} onChange={(e) => setForm({ ...form, mentorId: e.target.value })}>
          <option value="">Regulating mentor (optional)</option>
          {mentors.map((m) => (
            <option key={m.id} value={m.id}>
              {m.fullName}
            </option>
          ))}
        </select>
        <button type="button" className="btn-ghost" onClick={suggest}>
          Rank students by skill fit
        </button>
        <div className="max-h-56 space-y-2 overflow-auto">
          {(ranked.length ? ranked : students).map((s) => (
            <label key={s.id} className="flex cursor-pointer items-start gap-2 rounded-lg border border-slate-200 p-2 text-sm dark:border-slate-700">
              <input type="checkbox" checked={form.assignedTo.includes(s.id)} onChange={() => toggleAssign(s.id)} />
              <div className="flex-1">
                <p className="font-medium">
                  {s.fullName} {s.matchScore != null && <span className="text-xs text-slate-500">match {s.matchScore}</span>}
                </p>
                <SkillBars skills={s.skills} />
              </div>
            </label>
          ))}
        </div>
        <button className="btn">Create & assign</button>
      </form>
      <div className="card space-y-3">
        <h2 className="font-semibold">All tasks (review mentor work too)</h2>
        {tasks.map((t) => (
          <div key={t.id} className="rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-700">
            <div className="flex justify-between">
              <p className="font-medium">{t.title}</p>
              <StatusPill value={t.status} />
            </div>
            <p className="text-slate-500">{t.description}</p>
            <p className="mt-1 text-xs">Deadline: {t.deadline ? new Date(t.deadline).toLocaleString() : "—"}</p>
            {t.status !== "reviewed" && (
              <button className="btn-ghost mt-2" onClick={() => review(t.id)}>
                Mark reviewed
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
