import { useEffect, useMemo, useState } from "react";
import { api, fileUrl } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { SkillBars, Stat, StatusPill } from "../../components/ui";

export default function StudentHome() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [memos, setMemos] = useState([]);
  const [dashboard, setDashboard] = useState({ summary: {}, upcomingTasks: [] });
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    Promise.all([api.get("/dashboard"), api.get("/tasks"), api.get("/memos"), api.get("/activities")]).then(([dash, taskRes, memoRes, actRes]) => {
      setDashboard(dash.data || { summary: {}, upcomingTasks: [] });
      setTasks(taskRes.data || []);
      setMemos(memoRes.data || []);
      setActivity(actRes.data || []);
    });
  }, []);

  const summary = dashboard.summary || {};
  const totalTasks = Number(summary.tasksTotal ?? tasks.length ?? 0);
  const completedTasks = Number(summary.tasksCompleted ?? tasks.filter((task) => ["submitted", "reviewed"].includes(task.status)).length ?? 0);
  const inProgressTasks = Number(summary.tasksInProgress ?? tasks.filter((task) => task.status === "in_progress").length ?? 0);
  const pendingTasks = Number(summary.tasksPending ?? Math.max(totalTasks - completedTasks - inProgressTasks, 0));
  const internshipProgress = Number(summary.progressPercent ?? 0);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="card">
          <p className="text-sm text-slate-500">Internship Status</p>
          <p className="mt-2 text-xl font-semibold text-emerald-600">{summary.internshipStatus || user?.internshipStatus || "none"}</p>
          <p className="mt-1 text-xs text-slate-500">Updated from live backend data</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-500">Tasks</p>
          <p className="mt-2 text-xl font-semibold">{totalTasks} Total</p>
          <p className="mt-1 text-xs text-slate-500">{completedTasks} Completed • {inProgressTasks} In Progress • {pendingTasks} Pending</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-500">Progress</p>
          <p className="mt-2 text-xl font-semibold">{internshipProgress}%</p>
          <div className="mt-2 h-2 rounded-full bg-slate-200 dark:bg-slate-800">
            <div className="h-2 rounded-full bg-brand-500" style={{ width: `${internshipProgress}%` }} />
          </div>
        </div>
        <div className="card">
          <p className="text-sm text-slate-500">Memos</p>
          <p className="mt-2 text-xl font-semibold">{memos.length}</p>
          <p className="mt-1 text-xs text-slate-500">Live memo history</p>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="card">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold">Upcoming Tasks</h3>
            <StatusPill value="in_progress" />
          </div>
          <div className="space-y-3">
            {(dashboard.upcomingTasks || tasks).map((task) => (
              <div key={task.id} className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{task.title}</p>
                    <p className="text-xs text-slate-500">{task.deadline ? `Due ${task.deadline}` : "Upcoming"}</p>
                  </div>
                  <StatusPill value={task.priority || task.status} />
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                  <span>{task.assignedBy || "Mentor"}</span>
                  <span>{task.status}</span>
                </div>
              </div>
            ))}
            {!tasks.length && <p className="text-sm text-slate-500">No assigned tasks yet.</p>}
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold">Recent activity</h3>
          <div className="mt-4 space-y-2 text-sm">
            {activity.slice(0, 5).map((item) => (
              <div key={item.id} className="rounded-lg border border-slate-200 p-2 dark:border-slate-700">
                <p>{item.message}</p>
                <p className="mt-1 text-xs text-slate-500">{item.action}</p>
              </div>
            ))}
            {!activity.length && <p className="text-sm text-slate-500">No recent activity.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export function StudentProfile() {
  const { user, refresh } = useAuth();
  const [form, setForm] = useState({
    fullName: "",
    registerNumber: "",
    department: "",
    year: "",
    college: "",
    email: "",
    phone: "",
    bio: "",
    languages: "",
    skills: "",
  });
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!user) return;
    setForm({
      fullName: user.fullName || "",
      registerNumber: user.registerNumber || "2024CS012",
      department: user.department || "Computer Science",
      year: user.year || "3rd Year",
      college: user.college || "ABC College of Engineering",
      email: user.email || "",
      phone: user.phone || "+91 90000 12345",
      bio: user.bio || "",
      languages: (user.languages || []).join(", "),
      skills: (user.skills || []).map((s) => `${s.name}:${s.level}`).join(", "),
    });
  }, [user]);

  async function save(e) {
    e.preventDefault();
    const payload = {
      fullName: form.fullName,
      registerNumber: form.registerNumber,
      department: form.department,
      year: form.year,
      college: form.college,
      phone: form.phone,
      bio: form.bio,
      languages: form.languages.split(",").map((s) => s.trim()).filter(Boolean),
      skills: form.skills
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean)
        .map((x) => {
          const [name, level] = x.split(":");
          return { name: name.trim(), level: Number(level || 3) };
        }),
    };
    await api.patch("/users/me", payload);
    await refresh();
    setMsg("Profile updated — admin and mentor can review your skill profile.");
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
      <form className="card space-y-4" onSubmit={save}>
        <h2 className="font-semibold">Student Profile</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="Full name" />
          <input value={form.registerNumber} onChange={(e) => setForm({ ...form, registerNumber: e.target.value })} placeholder="Register number" />
          <input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="Department" />
          <input value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} placeholder="Year" />
          <input value={form.college} onChange={(e) => setForm({ ...form, college: e.target.value })} placeholder="College" className="md:col-span-2" />
          <input value={form.email} readOnly placeholder="Email" />
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone" />
        </div>
        <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Introduce yourself" />
        <input value={form.languages} onChange={(e) => setForm({ ...form, languages: e.target.value })} placeholder="Languages: Python, Java, SQL" />
        <input value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="Skills: Python:4, React:3, MongoDB:3" />
        <button className="btn">Save profile</button>
        {msg && <p className="text-sm text-emerald-600">{msg}</p>}
      </form>

      <div className="card">
        <h3 className="mb-3 font-semibold">Skill Proficiency</h3>
        <SkillBars skills={user?.skills} />
      </div>
    </div>
  );
}

export function StudentTasks() {
  const [tasks, setTasks] = useState([]);
  const [subs, setSubs] = useState([]);
  const [note, setNote] = useState("");
  const [percent, setPercent] = useState(0);
  const [active, setActive] = useState(null);
  const [files, setFiles] = useState([]);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    Promise.all([api.get("/tasks"), api.get("/submissions")]).then(([t, s]) => {
      if (t.data?.length) setTasks(t.data);
      setSubs(s.data || []);
    });
  }, []);

  const selectedTask = useMemo(
    () => tasks.find((task) => task.id === active) || tasks[0] || null,
    [tasks, active],
  );

  async function upload(e) {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;

    const maxPerFile = 50 * 1024 * 1024;
    const maxTotal = 100 * 1024 * 1024;
    const totalSize = selected.reduce((sum, file) => sum + file.size, 0);
    const tooLarge = selected.find((file) => file.size > maxPerFile);

    if (tooLarge || totalSize > maxTotal) {
      setUploadError("Upload limit: 50 MB per file and 100 MB total per batch.");
      e.target.value = "";
      return;
    }

    const fd = new FormData();
    selected.forEach((file) => fd.append("files", file));
    try {
      const { data } = await api.post("/files", fd);
      const items = Array.isArray(data) ? data : [data];
      setFiles((f) => [...f, ...items]);
      setUploadError("");
    } catch (error) {
      setUploadError(error.response?.data?.detail || "Could not upload files.");
    } finally {
      e.target.value = "";
    }
  }

  async function submit(e) {
    e.preventDefault();
    if (!selectedTask) return;
    const nextStatus = "submitted";
    setTasks((current) =>
      current.map((task) => (task.id === selectedTask.id ? { ...task, status: nextStatus } : task)),
    );
    if (selectedTask.id) {
      try {
        await api.post(`/submissions/${selectedTask.id}`, {
          progressNote: note || "Submitted for review.",
          percent: Number(percent),
          files,
        });
      } catch (error) {
        console.error("Submission failed", error);
      }
    }
    setNote("");
    setFiles([]);
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
      <div className="space-y-3">
        {tasks.map((task) => {
          const sub = subs.find((s) => s.taskId === task.id);
          return (
            <button
              type="button"
              key={task.id}
              onClick={() => setActive(task.id)}
              className={`card w-full text-left ${active === task.id ? "ring-2 ring-brand-500" : ""}`}
            >
              <div className="flex items-center justify-between">
                <p className="font-semibold">{task.title}</p>
                <StatusPill value={task.status} />
              </div>
              <p className="mt-1 text-sm text-slate-500">{task.description}</p>
              <div className="mt-3 flex justify-between text-xs text-slate-500">
                <span>Assigned by: {task.assignedBy || "Mentor"}</span>
                <span>Due: {task.dueDate || "—"}</span>
              </div>
              {sub && <p className="mt-1 text-xs">Progress {sub.percent}%</p>}
            </button>
          );
        })}
      </div>

      <form className="card space-y-4" onSubmit={submit}>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">{selectedTask?.title}</h2>
          <StatusPill value={selectedTask?.priority || "medium"} />
        </div>
        <p className="text-sm text-slate-500">{selectedTask?.description}</p>
        <div className="grid gap-2 text-sm sm:grid-cols-2">
          <div><span className="text-slate-500">Assigned by:</span> {selectedTask?.assignedBy || "Mentor"}</div>
          <div><span className="text-slate-500">Start:</span> {selectedTask?.startDate || "—"}</div>
          <div><span className="text-slate-500">Due:</span> {selectedTask?.dueDate || "—"}</div>
          <div><span className="text-slate-500">Status:</span> {selectedTask?.status}</div>
        </div>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add project notes or task update" />
        <label className="text-sm">
          Completion progress: {percent}%
          <input type="range" min="0" max="100" value={percent} onChange={(e) => setPercent(Number(e.target.value))} />
        </label>
        <label className="block text-sm text-slate-600 dark:text-slate-300">
          Attach files (multiple, max 50 MB per file / 100 MB total)
          <input type="file" className="mt-2 block w-full" multiple accept="*" onChange={upload} />
        </label>
        {uploadError && <p className="text-sm text-rose-500">{uploadError}</p>}
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-ghost" onClick={() => setTasks((current) => current.map((task) => task.id === selectedTask.id ? { ...task, status: "in_progress" } : task))}>
            Start task
          </button>
          <button type="button" className="btn-ghost" onClick={() => setTasks((current) => current.map((task) => task.id === selectedTask.id ? { ...task, status: "submitted" } : task))}>
            Mark as completed
          </button>
        </div>
        <button className="btn" type="submit">Submit for review</button>
        {selectedTask?.mentorFeedback && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-900/20 dark:text-amber-200">
            <p className="font-medium">Mentor feedback</p>
            <p className="mt-1">{selectedTask.mentorFeedback}</p>
          </div>
        )}
        {(() => {
          const currentSubmission = selectedTask ? subs.find((entry) => entry.taskId === selectedTask.id) : null;
          const history = currentSubmission?.history || [];
          if (!history.length) return null;
          return (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-900/50">
              <p className="font-medium">Resubmission history</p>
              <div className="mt-2 space-y-2">
                {history.slice().reverse().map((item, index) => (
                  <div key={`${selectedTask.id}-${index}`} className="rounded-lg border border-slate-200 p-2 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{item.status}</span>
                      <span>{item.percent || 0}%</span>
                    </div>
                    <p className="mt-1 text-slate-500">{item.progressNote || "No update note"}</p>
                    <p className="mt-1 text-xs text-slate-400">{item.updatedAt ? new Date(item.updatedAt).toLocaleString() : ""}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </form>
    </div>
  );
}

export function StudentInternship() {
  const { user, refresh } = useAuth();
  const [message, setMessage] = useState("");
  const [reqs, setReqs] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    Promise.all([api.get("/internships"), api.get("/documents")]).then(([internships, docs]) => {
      setReqs(internships.data || []);
      setDocuments(docs.data || []);
    });
  }, []);

  async function send(e) {
    e.preventDefault();
    setErr("");
    try {
      await api.post("/internships", { message });
      await refresh();
      const { data } = await api.get("/internships");
      setReqs(data);
    } catch (ex) {
      setErr(ex.response?.data?.detail || "Could not submit");
    }
  }

  return (
    <div className="space-y-5">
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Internship Overview</h2>
          <StatusPill value={user?.internshipStatus || "active"} />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div><span className="text-slate-500">Company:</span> ABC Technologies</div>
          <div><span className="text-slate-500">Role:</span> Full Stack Development Intern</div>
          <div><span className="text-slate-500">Mentor:</span> Ravi Kumar</div>
          <div><span className="text-slate-500">Duration:</span> 24 Jun – 30 Sep 2026</div>
          <div><span className="text-slate-500">Mode:</span> Hybrid</div>
          <div><span className="text-slate-500">Status:</span> Active</div>
        </div>
        <div>
          <div className="mb-2 flex justify-between text-sm"><span>Internship Progress</span><span>82%</span></div>
          <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-800">
            <div className="h-3 rounded-full bg-emerald-500" style={{ width: "82%" }} />
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="mb-3 font-semibold">Documents</h3>
        <div className="space-y-2 text-sm">
          {documents.length === 0 && <p className="text-sm text-slate-500">No uploaded documents yet.</p>}
          {documents.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700">
              <div>
                <p className="font-medium">{doc.title}</p>
                {doc.url && <a href={fileUrl(doc.url)} target="_blank" rel="noreferrer" className="text-xs text-brand-500 underline">Open file</a>}
              </div>
              <StatusPill value={doc.status || "submitted"} />
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm text-amber-600">Certificate status updates from the real backend review flow.</p>
      </div>

      <div className="card max-w-xl space-y-3">
        <h2 className="font-semibold">Internship request</h2>
        <p className="text-sm text-slate-500">
          Admin will assign or reject based on the skills on your profile. Current status: {user?.internshipStatus}
        </p>
        <form onSubmit={send} className="space-y-3">
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Why you want this internship" required />
          <button className="btn">Request internship</button>
        </form>
        {err && <p className="text-sm text-rose-500">{err}</p>}
        {reqs.map((r) => (
          <div key={r.id} className="rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-700">
            <StatusPill value={r.status} />
            <p className="mt-2">{r.message}</p>
            {r.adminNote && <p className="text-slate-500">Admin: {r.adminNote}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

export function StudentMemos() {
  const [memos, setMemos] = useState([
    {
      id: "memo-1",
      type: "Important",
      title: "Final Internship Report Submission",
      from: "Admin",
      to: "All Students",
      body: "All students must submit their final internship report before September 30.",
      deadline: "2026-09-30",
      isReminder: true,
    },
  ]);

  useEffect(() => {
    api.get("/memos").then((r) => {
      if (r.data?.length) setMemos(r.data);
    });
  }, []);

  return (
    <div className="space-y-3">
      {memos.length === 0 && <p className="text-slate-500">No memos yet.</p>}
      {memos.map((m) => (
        <div key={m.id} className="card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-rose-500">{m.type || "General"}</span>
            {m.isReminder && <StatusPill value="pending" />}
          </div>
          <h3 className="mt-2 text-lg font-semibold">{m.title || "Internship Update"}</h3>
          <p className="mt-1 text-sm text-slate-500">From: {m.from || "Admin"} • To: {m.to || "All Students"}</p>
          <p className="mt-3">{m.body || m.message}</p>
          {m.deadline && <p className="mt-2 text-xs text-slate-500">Deadline: {m.deadline}</p>}
          <p className="mt-2 text-xs text-slate-500">{m.createdAt ? new Date(m.createdAt).toLocaleString() : ""}</p>
        </div>
      ))}
    </div>
  );
}
