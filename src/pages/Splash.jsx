import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { Loader2, GraduationCap } from "lucide-react";

export default function Splash() {
  const navigate = useNavigate();
  const [msg, setMsg] = useState("Starting Internship Management System…");

  useEffect(() => {
    const started = Date.now();
    (async () => {
      try {
        await api.get("/health");
        setMsg("Connected. Loading workspace…");
      } catch {
        setMsg("Server not ready yet — opening login anyway…");
      }
      const wait = Math.max(0, 1600 - (Date.now() - started));
      setTimeout(() => {
        const token = localStorage.getItem("ims_token");
        const user = localStorage.getItem("ims_user");
        if (token && user) {
          const role = JSON.parse(user).role;
          navigate(`/${role}`, { replace: true });
        } else {
          const last = localStorage.getItem("ims_last_role") || "student";
          navigate(`/login/${last}`, { replace: true });
        }
      }, wait);
    })();
  }, [navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-white">
      <GraduationCap className="mb-4 h-14 w-14 text-sky-400" />
      <h1 className="text-2xl font-semibold">Internship Management System</h1>
      <Loader2 className="mt-6 h-8 w-8 animate-spin text-sky-400" />
      <p className="mt-4 text-sm text-slate-400">{msg}</p>
    </div>
  );
}
