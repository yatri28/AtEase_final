import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Sidebar({ role }) {
  const navigate = useNavigate();

  const menus = {
    student: [
      { name: "Dashboard", path: "/student", icon: "🏠" },
      { name: "Book Session", path: "/student/book", icon: "📅" },
      { name: "Messages", path: "/student/messages", icon: "💬" },
      { name: "Profile", path: "/student/profile", icon: "👤" },
      { name: "Settings", path: "/student/settings", icon: "⚙️" },
    ],
    counselor: [
      { name: "Dashboard", path: "/counselor", icon: "🏠" },
      { name: "Anonymous Notes", path: "/counselor/notes", icon: "📝" },
      { name: "Messages", path: "/counselor/messages", icon: "💬" },
      { name: "Sessions", path: "/counselor/sessions", icon: "📆" },
      { name: "Settings", path: "/counselor/settings", icon: "⚙️" },
      { name: "Profile", path: "/counselor/profile", icon: "👤" },
    ],
    admin: [
         { name: "Dashboard",  path: "/admin",           icon: "🏠" },
      { name: "Users",      path: "/admin/users",     icon: "👥" },
      { name: "Analytics",  path: "/admin/analytics", icon: "📊" },
      { name: "Reports",    path: "/admin/reports",   icon: "📄" },
      { name: "Settings", path: "/admin/settings", icon: "⚙️" },
    ],
  };

  const [user, setUser] = useState(null);

useEffect(() => {
  const storedUser = sessionStorage.getItem("user");
  if (storedUser) {
    // Wrap in a function to defer state update
    const userData = JSON.parse(storedUser);
    setTimeout(() => setUser(userData), 0);
  }
}, []);

  // ✅ Logout Function
  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    navigate("/");
  };

  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white flex flex-col">
      
      {/* App Brand */}
      <div className="p-6">
        <h1 className="text-2xl font-bold text-teal-400">AtEase</h1>
        <p className="text-xs text-gray-400 mt-1 capitalize">
          {role} portal
        </p>
      </div>

      {/* User Info */}
      <div className="px-6 py-4 flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-teal-500 flex items-center justify-center font-semibold">
          {user?.name?.charAt(0).toUpperCase() || "U"}
        </div>

        <div>
          <p className="text-sm font-medium">
            {user?.name || "Loading..."}
          </p>
          <p className="text-xs text-gray-400 capitalize">
            {role}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 mt-4 space-y-1">
        {menus[role]?.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition ${
                isActive
                  ? "bg-teal-500 text-white"
                  : "text-gray-300 hover:bg-slate-800"
              }`
            }
          >
            <span>{item.icon}</span>
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="px-4 mb-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm text-red-400 hover:bg-slate-800 transition"
        >
          <span>🚪</span>
          Logout
        </button>
      </div>

      {/* Footer */}
      <div className="p-4 text-xs text-teal-300 border-t border-slate-800">
        Crisis Helpline: <b>23it472@gmail.com</b>
      </div>
    </aside>
  );
}