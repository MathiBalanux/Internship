import { useEffect, useState } from "react";
import { api } from "../../api";
import { StatusPill } from "../../components/ui";

export default function AdminMemos() {
  const [memos, setMemos] = useState([]);
  const [students, setStudents] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [toId, setToId] = useState("");
  const [body, setBody] = useState("");
  const [result, setResult] = useState("");

  async function load() {
    const [m, s, g] = await Promise.all([
      api.get("/memos"),
      api.get("/users", { params: { role: "student" } }),
      api.get("/users", { params: { role: "mentor" } }),
    ]);
    setMemos(m.data);
    setStudents(s.data);
    setMentors(g.data);
  }

  useEffect(() => {
    load();
  }, []);

  const people = [...students, ...mentors];

  async function send(e) {
    e.preventDefault();
    await api.post("/memos", { toId, body, isReminder: false });
    setBody("");
    load();
  }

  async function approve(id, ok) {
    await api.post(`/memos/${id}/approve`, null, { params: { approve: ok } });
    load();
  }

  async function remind() {
    const { data } = await api.post("/memos/reminders", {});
    setResult(`Sent ${data.count} reminder memo(s) to mentors/students with incomplete work.`);
    load();
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="space-y-4">
        <form onSubmit={send} className="card space-y-3">
          <h2 className="font-semibold">Send memo</h2>
          <select value={toId} onChange={(e) => setToId(e.target.value)} required>
            <option value="">Recipient</option>
            {people.map((p) => (
              <option key={p.id} value={p.id}>
                {p.fullName} ({p.role})
              </option>
            ))}
          </select>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} required placeholder="Memo text" />
          <button className="btn">Send now</button>
        </form>
        <div className="card space-y-2">
          <h2 className="font-semibold">Deadline reminders</h2>
          <p className="text-sm text-slate-500">
            Notify mentors to follow up, and memo students whose work is not submitted before the deadline.
          </p>
          <button className="btn" type="button" onClick={remind}>
            Send reminders
          </button>
          {result && <p className="text-sm text-emerald-600">{result}</p>}
        </div>
      </div>
      <div className="card space-y-3">
        <h2 className="font-semibold">Memo queue</h2>
        {memos.map((m) => (
          <div key={m.id} className="rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-700">
            <div className="flex justify-between">
              <StatusPill value={m.status} />
              {m.isReminder && <span className="text-xs">reminder</span>}
            </div>
            <p className="mt-2">{m.body}</p>
            {m.status === "pending_approval" && (
              <div className="mt-2 flex gap-2">
                <button className="btn" onClick={() => approve(m.id, true)}>
                  Approve
                </button>
                <button className="btn-ghost" onClick={() => approve(m.id, false)}>
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
