import { BrowserRouter, Routes, Route } from "react-router-dom";
import Auth from "./pages/auth/Auth";
import StudentDashboard from "./pages/student/Dashboard";
import BookSession from "./pages/student/BookSession";
import Messages from "./pages/student/Messages";
import Profile from "./pages/student/Profile";
import Settings from "./pages/student/Settings";
import CounselorDashboard from "./pages/counselor/Dashboard";
import CounselorSessions from "./pages/counselor/CounselorSessions";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Auth />} />

        {/* Student */}
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/student/profile" element={<Profile />} />
        <Route path="/student/settings" element={<Settings />} />
        <Route path="/student/book" element={<BookSession />} />
        <Route path="/student/messages" element={<Messages />} />

        {/* Counselor */}
        <Route path="/counselor" element={<CounselorDashboard />} />
<Route path="/counselor/sessions" element={<CounselorSessions />} />
      </Routes>
    </BrowserRouter>
  );
}
