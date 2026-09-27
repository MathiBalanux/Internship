import { useEffect, useState } from "react";
import { api } from "../../api";
import { SkillBars, StatusPill } from "../../components/ui";

export default function AdminInternships() {
  const [requests, setRequests] = useState([]);
  const [students, setStudents] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [mentorPick, setMentorPick] = useState({});

  async function load() {
    const [r, s, m] = await Promise.all([
      api.get("/internships"),
      api.get("/users", { params: { role: "student" } }),
      api.get("/users", { params: { role: "mentor" } }),
    ]);
    setRequests(r.data);
    setStudents(s.data);
    setMentors(m.data);
  }

  useEffect(() => {
    load();
  }, []);

  function studentOf(id) {
    return students.find((s) => s.id === id);
  }

  async function decide(id, status) {
    await api.post(`/internships/${id}/decide`, {
      status,
      assignedMentorId: mentorPick[id] || null,
      adminNote: status === "assigned" ? "Assigned based on skill overlap" : "Does not match current openings",
    });
    load();
  }

  return (
    <div className="space-y-4">
      {requests.map((req) => {
        const st = studentOf(req.studentId);
        return (
          <div key={req.id} className="card space-y-3">
            <div className="flex justify-between">
              <h3 className="font-semibold">{st?.fullName || req.studentId}</h3>
              <StatusPill value={req.status} />
            </div>
            <p className="text-sm">{req.message}</p>
            {st && <SkillBars skills={st.skills} />}
            {req.status === "pending" && (
              <div className="flex flex-wrap gap-2">
                <select value={mentorPick[req.id] || ""} onChange={(e) => setMentorPick({ ...mentorPick, [req.id]: e.target.value })}>
                  <option value="">Select mentor</option>
                  {mentors.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} — {(m.skills || []).map((s) => s.name).join(", ")}
                    </option>
                  ))}
                </select>
                <button className="btn" onClick={() => decide(req.id, "assigned")}>
                  Assign
                </button>
                <button className="btn-ghost" onClick={() => decide(req.id, "rejected")}>
                  Reject
                </button>
              </div>
            )}
          </div>
        );
      })}
      {requests.length === 0 && <p className="text-slate-500">No internship requests.</p>}
    </div>
  );
}
