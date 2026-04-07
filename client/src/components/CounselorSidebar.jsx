import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function CounselorSidebar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

useEffect(() => {
  const storedUser = sessionStorage.getItem("user");
  if (storedUser) {
    const userData = JSON.parse(storedUser);
    // Defer state update to avoid synchronous setState warning
    setTimeout(() => setUser(userData), 0);
  }
}, []);

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    navigate("/");
  };

  const menus = [
    { name: "Dashboard", path: "/counselor", icon: "📊" },
    { name: "Session Requests", path: "/counselor/requests", icon: "📥" },
    { name: "Messages", path: "/counselor/messages", icon: "💬" },
    { name: "Session Notes", path: "/counselor/notes", icon: "📝" },
    { name: "Session History", path: "/counselor/history", icon: "📆" },
  ];

  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-teal-400">AtEase</h1>
        <p className="text-xs text-gray-400 mt-1">
          Counselor Portal
        </p>
      </div>

      <div className="px-6 py-4 flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-teal-500 flex items-center justify-center font-semibold">
          {user?.name?.charAt(0).toUpperCase() || "C"}
        </div>

        <div>
          <p className="text-sm font-medium">
            {user?.name || "Loading..."}
          </p>
          <p className="text-xs text-gray-400">
            Counselor
          </p>
        </div>
      </div>

      <nav className="flex-1 px-4 mt-4 space-y-1">
        {menus.map((item) => (
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

      <div className="px-4 mb-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm text-red-400 hover:bg-slate-800 transition"
        >
          🚪 Logout
        </button>
      </div>
    </aside>
  );
}