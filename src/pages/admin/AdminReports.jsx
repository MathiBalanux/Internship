import { useEffect, useState } from "react";
import { api } from "../../api";

function Stat({ label, value }) {
    return (
        <div className="card flex flex-col justify-between">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-semibold">{value}</p>
        </div>
    );
}

function BarChart({ entries, formatter = (v) => v }) {
    const max = Math.max(...entries.map(([, value]) => Number(value) || 0), 1);
    return (
        <div className="space-y-3">
            {entries.map(([label, value]) => (
                <div key={label}>
                    <div className="mb-1 flex justify-between text-xs text-slate-500">
                        <span>{label}</span>
                        <span>{formatter(value)}</span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                        <div
                            className="h-full rounded-full bg-brand-500"
                            style={{ width: `${((Number(value) || 0) / max) * 100}%` }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function AdminReports() {
    const [summary, setSummary] = useState({});
    const [analytics, setAnalytics] = useState({});
    const [health, setHealth] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [preferences, setPreferences] = useState({
        taskReminders: true,
        reviewNotifications: true,
        internshipAlerts: true,
        memoNotifications: true,
        submissionUpdates: true,
        documentNotifications: true,
    });

    useEffect(() => {
        Promise.all([
            api.get("/reports/summary"),
            api.get("/reports/analytics"),
            api.get("/reports/health"),
            api.get("/audit/logs"),
            api.get("/notifications/preferences"),
        ]).then(([summaryRes, analyticsRes, healthRes, auditRes, prefsRes]) => {
            setSummary(summaryRes.data || {});
            setAnalytics(analyticsRes.data || {});
            setHealth(healthRes.data || []);
            setAuditLogs(auditRes.data || []);
            setPreferences(prefsRes.data || {});
        });
    }, []);

    async function exportCsv(report) {
        const response = await api.get("/reports/export", {
            params: { report, fmt: "csv" },
            responseType: "blob",
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `${report}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    }

    async function updatePreference(key, value) {
        const next = { ...preferences, [key]: value };
        setPreferences(next);
        await api.post("/notifications/preferences", next);
    }

    const taskBarEntries = Object.entries(analytics.taskStatus || {});
    const internshipEntries = Object.entries(analytics.internshipStatus || {});
    const progressEntries = Object.entries(analytics.studentProgress || {});
    const workloadEntries = Object.entries(analytics.mentorWorkload || {});

    return (
        <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Stat label="Students" value={summary.students ?? 0} />
                <Stat label="Mentors" value={summary.mentors ?? 0} />
                <Stat label="Open tasks" value={summary.tasks ?? 0} />
                <Stat label="Overdue" value={summary.overdueTasks ?? 0} />
            </div>

            <div className="grid gap-5 xl:grid-cols-2">
                <div className="card">
                    <div className="mb-3 flex items-center justify-between">
                        <h3 className="font-semibold">Task status</h3>
                        <button className="btn btn-sm" onClick={() => exportCsv("tasks")}>Export CSV</button>
                    </div>
                    <BarChart entries={taskBarEntries} />
                </div>

                <div className="card">
                    <div className="mb-3 flex items-center justify-between">
                        <h3 className="font-semibold">Internship status</h3>
                        <button className="btn btn-sm" onClick={() => exportCsv("internships")}>Export CSV</button>
                    </div>
                    <BarChart entries={internshipEntries} />
                </div>
            </div>

            <div className="grid gap-5 xl:grid-cols-2">
                <div className="card">
                    <h3 className="mb-3 font-semibold">Student progress bands</h3>
                    <BarChart entries={progressEntries} />
                </div>

                <div className="card">
                    <h3 className="mb-3 font-semibold">Mentor workload</h3>
                    <BarChart entries={workloadEntries} formatter={(v) => `${v} tasks`} />
                </div>
            </div>

            <div className="grid gap-5 xl:grid-cols-2">
                <div className="card">
                    <h3 className="mb-3 font-semibold">Internship health</h3>
                    <div className="space-y-2">
                        {health.length === 0 && <p className="text-sm text-slate-500">No student health data yet.</p>}
                        {health.map((student) => (
                            <div key={student.studentId} className="rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-700">
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">{student.studentName}</span>
                                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs capitalize dark:bg-slate-800">{student.status}</span>
                                </div>
                                <p className="mt-2 text-slate-500">Progress: {student.progress}% • Overdue: {student.overdue}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card">
                    <h3 className="mb-3 font-semibold">Notification preferences</h3>
                    <div className="space-y-3">
                        {Object.entries(preferences).map(([key, value]) => (
                            <label key={key} className="flex items-center justify-between rounded-lg border border-slate-200 p-2 text-sm dark:border-slate-700">
                                <span>{key}</span>
                                <input
                                    type="checkbox"
                                    checked={Boolean(value)}
                                    onChange={(e) => updatePreference(key, e.target.checked)}
                                />
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-semibold">Audit log</h3>
                    <button className="btn btn-sm" onClick={() => exportCsv("students")}>Student export</button>
                </div>
                <div className="space-y-2 text-sm">
                    {auditLogs.length === 0 && <p className="text-slate-500">No audit records available.</p>}
                    {auditLogs.slice(0, 8).map((item) => (
                        <div key={item.id} className="rounded-lg border border-slate-200 p-2 dark:border-slate-700">
                            <div className="flex justify-between">
                                <span className="font-medium">{item.action}</span>
                                <span className="text-xs text-slate-500">{item.targetType}</span>
                            </div>
                            <p className="mt-1 text-slate-500">{item.details}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
