import { useEffect, useMemo, useState } from "react";
import { api } from "../api";

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [cursor, setCursor] = useState(() => new Date());
  const [selected, setSelected] = useState(() => new Date());

  useEffect(() => {
    const load = () => api.get("/calendar").then((r) => setEvents(r.data));
    load();
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, []);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const first = new Date(year, month, 1);
  const startPad = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = useMemo(() => {
    const list = [];
    for (let i = 0; i < startPad; i++) list.push(null);
    for (let d = 1; d <= daysInMonth; d++) list.push(new Date(year, month, d));
    return list;
  }, [year, month, startPad, daysInMonth]);

  const dayEvents = events.filter((e) => e.deadline && sameDay(new Date(e.deadline), selected));

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <div className="card lg:col-span-2">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Admin-assigned deadlines
          </h2>
          <span className="text-xs text-slate-500">Live</span>
        </div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-medium">
            {cursor.toLocaleString(undefined, { month: "long", year: "numeric" })}
          </h3>
          <div className="flex gap-2">
            <button className="btn-ghost" onClick={() => setCursor(new Date(year, month - 1, 1))}>
              Prev
            </button>
            <button className="btn-ghost" onClick={() => setCursor(new Date(year, month + 1, 1))}>
              Next
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-500">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="py-1">
              {d}
            </div>
          ))}
          {cells.map((day, i) => {
            const has = day && events.some((e) => e.deadline && sameDay(new Date(e.deadline), day));
            const isSel = day && sameDay(day, selected);
            return (
              <button
                key={i}
                disabled={!day}
                onClick={() => day && setSelected(day)}
                className={`min-h-12 rounded-lg p-1 text-sm ${
                  isSel ? "bg-brand-600 text-white" : has ? "bg-amber-100 dark:bg-amber-900/40" : "hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {day ? day.getDate() : ""}
                {has && <span className="mt-1 block h-1 w-1 mx-auto rounded-full bg-amber-500" />}
              </button>
            );
          })}
        </div>
      </div>
      <div className="card">
        <h3 className="font-semibold">Deadlines on {selected.toDateString()}</h3>
        <div className="mt-3 space-y-2">
          {dayEvents.length === 0 && <p className="text-sm text-slate-500">No deadlines this day.</p>}
          {dayEvents.map((e) => (
            <div key={e.id} className="rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-700">
              <p className="font-medium">{e.title}</p>
              <p className="text-slate-500">{e.status}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
