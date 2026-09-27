import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Splash from "./pages/Splash";
import Login from "./pages/Login";
import CalendarPage from "./pages/CalendarPage";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminHome, { AdminPeople, AdminUsers } from "./pages/admin/AdminHome";
import AdminTasks from "./pages/admin/AdminTasks";
import AdminInternships from "./pages/admin/AdminInternships";
import AdminMemos from "./pages/admin/AdminMemos";
import AdminReports from "./pages/admin/AdminReports";
import MentorLayout from "./pages/mentor/MentorLayout";
import MentorHome, { MentorMemos, MentorProgress, MentorStudents, MentorTasks } from "./pages/mentor/MentorPages";
import StudentLayout from "./pages/student/StudentLayout";
import StudentHome, {
  StudentInternship,
  StudentMemos,
  StudentProfile,
  StudentTasks,
} from "./pages/student/StudentPages";
import { ActivityPage, DocumentsPage } from "./pages/Level2Pages";

function Guard({ role, children }) {
  const { user, ready } = useAuth();
  if (!ready) return null;
  if (!user) return <Navigate to={`/login/${role}`} replace />;
  if (user.role !== role) return <Navigate to={`/${user.role}`} replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Splash />} />
      <Route path="/login/:role" element={<Login />} />
      <Route
        path="/admin"
        element={
          <Guard role="admin">
            <AdminLayout />
          </Guard>
        }
      >
        <Route index element={<AdminHome />} />
        <Route path="students" element={<AdminPeople role="student" />} />
        <Route path="mentors" element={<AdminPeople role="mentor" />} />
        <Route path="tasks" element={<AdminTasks />} />
        <Route path="internships" element={<AdminInternships />} />
        <Route path="memos" element={<AdminMemos />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="documents" element={<DocumentsPage role="admin" />} />
        <Route path="activity" element={<ActivityPage role="admin" />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="calendar" element={<CalendarPage />} />
      </Route>
      <Route
        path="/mentor"
        element={
          <Guard role="mentor">
            <MentorLayout />
          </Guard>
        }
      >
        <Route index element={<MentorHome />} />
        <Route path="students" element={<MentorStudents />} />
        <Route path="tasks" element={<MentorTasks />} />
        <Route path="progress" element={<MentorProgress />} />
        <Route path="memos" element={<MentorMemos />} />
        <Route path="documents" element={<DocumentsPage role="mentor" />} />
        <Route path="activity" element={<ActivityPage role="mentor" />} />
        <Route path="calendar" element={<CalendarPage />} />
      </Route>
      <Route
        path="/student"
        element={
          <Guard role="student">
            <StudentLayout />
          </Guard>
        }
      >
        <Route index element={<StudentHome />} />
        <Route path="profile" element={<StudentProfile />} />
        <Route path="tasks" element={<StudentTasks />} />
        <Route path="internship" element={<StudentInternship />} />
        <Route path="memos" element={<StudentMemos />} />
        <Route path="documents" element={<DocumentsPage role="student" />} />
        <Route path="activity" element={<ActivityPage role="student" />} />
        <Route path="calendar" element={<CalendarPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
