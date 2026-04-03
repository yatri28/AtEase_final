import { BrowserRouter, Routes, Route } from "react-router-dom";
import Auth from "./pages/auth/Auth";
import StudentDashboard from "./pages/student/Dashboard";
import BookSession from "./pages/student/BookSession";
import Messages from "./pages/student/Messages";
import Profile from "./pages/student/Profile";
import StudentSettings from "./pages/student/Settings";      // renamed
import CounselorDashboard from "./pages/counselor/Dashboard";
import { Toaster } from "react-hot-toast";
import CounselorSessions from "./pages/counselor/CounselorSessions";
import CounselorMessages from "./pages/counselor/CounselorMessages";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminReports from "./pages/admin/AdminReports";

export default function App() {
  return (
    <BrowserRouter>
      <Toaster />
      <Routes>
        <Route path="/" element={<Auth />} />

        {/* Student */}
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/student/profile" element={<Profile />} />
        <Route path="/student/settings" element={<StudentSettings />} />
        <Route path="/student/book" element={<BookSession />} />
        <Route path="/student/messages" element={<Messages />} />

        {/* Counselor */}
        <Route path="/counselor" element={<CounselorDashboard />} />
        <Route path="/counselor/sessions" element={<CounselorSessions />} />
        <Route path="/counselor/messages" element={<CounselorMessages />} />

        {/* Admin */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/analytics" element={<AdminAnalytics />} />
        <Route path="/admin/reports" element={<AdminReports />} />
      </Routes>
    </BrowserRouter>
  );
}