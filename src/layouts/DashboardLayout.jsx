import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Bell,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Moon,
  Sun,
  CircleDot,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { api } from "../api";

export default function DashboardLayout({ items, title }) {
  const { user, logout, refresh } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [notes, setNotes] = useState([]);
  const [openBell, setOpenBell] = useState(false);

  async function loadNotes() {
    const { data } = await api.get("/notifications");
    setNotes(data);
  }

  useEffect(() => {
    loadNotes();
    const t = setInterval(loadNotes, 15000);
    return () => clearInterval(t);
  }, []);

  const unread = notes.filter((n) => !n.read).length;

  async function toggleStatus() {
    const next = user.status === "active" ? "inactive" : "active";
    await api.patch("/users/me/status", { status: next });
    await refresh();
  }

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
      <aside
        className={`${collapsed ? "w-[72px]" : "w-64"} sticky top-0 h-screen shrink-0 border-r border-slate-200 bg-white transition-all dark:border-slate-800 dark:bg-slate-900`}
      >
        <div className="flex items-center justify-between border-b border-slate-200 p-3 dark:border-slate-800">
          {!collapsed && (
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">IMS</p>
              <p className="font-semibold">{title}</p>
            </div>
          )}
          <button
            className="btn-ghost p-2"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
        <nav className="space-y-1 p-2">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2 text-sm ${
                  isActive
                    ? "bg-brand-50 text-brand-700 dark:bg-slate-800 dark:text-white"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                }`
              }
            >
              <item.icon size={18} />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-3 dark:border-slate-800 dark:bg-slate-900">
          <div>
            <p className="text-sm text-slate-500">Welcome</p>
            <p className="font-semibold">{user?.fullName}</p>
          </div>
          <div className="flex items-center gap-2">
            {user?.role !== "admin" && (
              <button className="btn-ghost" onClick={toggleStatus}>
                <CircleDot size={16} className={user?.status === "active" ? "text-emerald-500" : "text-slate-400"} />
                {user?.status === "active" ? "Active" : "Inactive"}
              </button>
            )}
            <button className="btn-ghost" onClick={toggle}>
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <div className="relative">
              <button className="btn-ghost" onClick={() => setOpenBell((o) => !o)}>
                <Bell size={16} />
                {unread > 0 && (
                  <span className="absolute -right-1 -top-1 rounded-full bg-rose-500 px-1.5 text-[10px] text-white">
                    {unread}
                  </span>
                )}
              </button>
              {openBell && (
                <div className="absolute right-0 z-20 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-700 dark:bg-slate-900">
                  <div className="mb-2 flex justify-between px-2 text-xs">
                    <span>Notifications</span>
                    <button
                      onClick={async () => {
                        await api.post("/notifications/read-all");
                        loadNotes();
                      }}
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="max-h-72 overflow-auto">
                    {notes.length === 0 && <p className="p-3 text-sm text-slate-500">No notifications</p>}
                    {notes.slice(0, 12).map((n) => (
                      <button
                        key={n.id}
                        className={`mb-1 w-full rounded-lg p-2 text-left text-sm ${n.read ? "opacity-60" : "bg-slate-50 dark:bg-slate-800"}`}
                        onClick={async () => {
                          await api.post(`/notifications/${n.id}/read`);
                          loadNotes();
                        }}
                      >
                        {n.message}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button
              className="btn-ghost"
              onClick={() => {
                logout();
                navigate(`/login/${user?.role || "admin"}`);
              }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>
        <main className="flex-1 p-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function CalendarHint() {
  return (
    <div className="hidden">
      <CalendarDays />
    </div>
  );
}
