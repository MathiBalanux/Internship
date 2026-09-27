import { Outlet } from "react-router-dom";
import { LayoutDashboard, ClipboardList, User, Mail, CalendarDays, Briefcase, FileText, Activity } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";

const items = [
  { to: "/student", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/student/profile", label: "Profile & skills", icon: User },
  { to: "/student/tasks", label: "My tasks", icon: ClipboardList },
  { to: "/student/internship", label: "Internship", icon: Briefcase },
  { to: "/student/memos", label: "Memos", icon: Mail },
  { to: "/student/documents", label: "Documents", icon: FileText },
  { to: "/student/activity", label: "Activity", icon: Activity },
  { to: "/student/calendar", label: "Calendar", icon: CalendarDays },
];

export default function StudentLayout() {
  return (
    <DashboardLayout title="Student" items={items}>
      <Outlet />
    </DashboardLayout>
  );
}
