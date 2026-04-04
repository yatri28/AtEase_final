import { useContext, useState, useEffect } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { ThemeContext } from "../../context/ThemeContext";

export default function AdminSettings() {
  const { darkMode, setDarkMode } = useContext(ThemeContext);

  // Local state (for save functionality)
  const [localDarkMode, setLocalDarkMode] = useState(darkMode);

  // Sync when context changes
  useEffect(() => {
    setLocalDarkMode(darkMode);
  }, [darkMode]);

  const handleToggle = () => {
    setLocalDarkMode((prev) => !prev);
  };

  const handleSave = () => {
    setDarkMode(localDarkMode); // apply change
  };

  const hasChanges = localDarkMode !== darkMode;

  return (
    <DashboardLayout role="admin">
      <h1 className="text-2xl font-bold mb-1">Appearance Settings</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        Customize admin dashboard appearance
      </p>

      <div className="space-y-6 max-w-md">

        {/* Dark Mode Card */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm">
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
                localDarkMode ? "bg-teal-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`h-5 w-5 bg-white rounded-full shadow transform transition ${
                  localDarkMode ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className={`px-6 py-2 rounded-lg text-white transition ${
              hasChanges
                ? "bg-teal-500 hover:bg-teal-600"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            Save Changes
          </button>
        </div>

      </div>
    </DashboardLayout>
  );
}