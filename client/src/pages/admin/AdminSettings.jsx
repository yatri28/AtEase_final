import { useContext } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { ThemeContext } from "../../context/ThemeContext";

export default function AdminSettings() {
  const { darkMode, setDarkMode } = useContext(ThemeContext);

  const handleToggle = () => {
    setDarkMode((prev) => !prev); // just toggle, no toast
  };

  return (
    <DashboardLayout role="admin">
      <h1 className="text-2xl font-bold mb-1">Appearance Settings</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        Customize admin dashboard appearance
      </p>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm max-w-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Dark Mode</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Reduce eye strain in low-light environments
            </p>
          </div>

          <button
            onClick={handleToggle}
            className={`w-11 h-6 flex items-center rounded-full transition ${
              darkMode ? "bg-teal-500" : "bg-gray-300"
            }`}
          >
            <span
              className={`h-5 w-5 bg-white rounded-full shadow transform transition ${
                darkMode ? "translate-x-5" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}