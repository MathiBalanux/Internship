import { Outlet } from "react-router-dom";
import { LayoutDashboard, Users, ClipboardList, Mail, CalendarDays, Activity, FileText } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";

const items = [
  { to: "/mentor", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/mentor/students", label: "My students", icon: Users },
  { to: "/mentor/tasks", label: "Tasks", icon: ClipboardList },
  { to: "/mentor/progress", label: "Progress", icon: Activity },
  { to: "/mentor/memos", label: "Memos", icon: Mail },
  { to: "/mentor/documents", label: "Documents", icon: FileText },
  { to: "/mentor/activity", label: "Activity", icon: Activity },
  { to: "/mentor/calendar", label: "Calendar", icon: CalendarDays },
];

export default function MentorLayout() {
  return (
    <DashboardLayout title="Mentor" items={items}>
      <Outlet />
    </DashboardLayout>
  );
}
