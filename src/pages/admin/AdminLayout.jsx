import { Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Mail,
  CalendarDays,
  UserPlus,
  Briefcase,
  FileText,
  Activity,
  BarChart3,
} from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";

const items = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/students", label: "Students", icon: Users },
  { to: "/admin/mentors", label: "Mentors", icon: Users },
  { to: "/admin/tasks", label: "Tasks", icon: ClipboardList },
  { to: "/admin/internships", label: "Internships", icon: Briefcase },
  { to: "/admin/memos", label: "Memos", icon: Mail },
  { to: "/admin/reports", label: "Reports", icon: BarChart3 },
  { to: "/admin/documents", label: "Documents", icon: FileText },
  { to: "/admin/activity", label: "Activity", icon: Activity },
  { to: "/admin/users", label: "Create users", icon: UserPlus },
  { to: "/admin/calendar", label: "Calendar", icon: CalendarDays },
];

export default function AdminLayout() {
  return (
    <DashboardLayout title="Admin" items={items}>
      <Outlet />
    </DashboardLayout>
  );
}
