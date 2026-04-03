import { useContext, useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { ThemeContext } from "../../context/ThemeContext";
import axios from "axios";
import toast from "react-hot-toast";

export default function Settings() {
  const { darkMode, setDarkMode } = useContext(ThemeContext);
  const [settings, setSettings] = useState(null);       // Backend data
const [localSettings, setLocalSettings] = useState({
  sessionNotifications: {
    newSessionScheduled: true,
    sessionReminders: true,
  },
  studentActivity: {
    studentMessages: true,
    emailNotifications: false,
  },
  doNotDisturb: {
    enabled: false,
  },
});
  const token = localStorage.getItem("token");

  // Fetch counselor settings from backend
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/counselor-settings",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSettings(res.data);
        setLocalSettings((prev) => ({
          ...prev,
          ...res.data,
        }));
      } catch (err) {
        console.error("Error fetching settings:", err);
      }
    };
    fetchSettings();
  }, [token]);

  // Toggle local settings (does NOT update backend)
 const toggleSetting = (category, key) => {
  setLocalSettings((prev) => ({
    ...prev,
    [category]: {
      ...(prev[category] || {}),   // ✅ prevent undefined
      [key]: !prev[category]?.[key],
    },
  }));
};

  // Save all changes to backend
  const handleSave = async () => {
    try {
      await axios.put(
        "http://localhost:5000/api/counselor-settings",
        localSettings,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSettings(localSettings); // sync main state
      toast.success("Settings saved successfully!");
    } catch (err) {
      console.error("Error saving settings:", err);
      toast.error("Failed to save settings");
    }
  };

  // Check if there are unsaved changes
  const hasChanges = JSON.stringify(localSettings) !== JSON.stringify(settings);

  if (!localSettings) {
    return (
      <DashboardLayout role="counselor">
        <p className="p-6">Loading settings...</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="counselor">
      <h1 className="text-2xl font-bold mb-1">Settings</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        Customize your dashboard experience
      </p>

      <div className="space-y-6 max-w-3xl">
        {/* Appearance */}
        <Section title="Appearance" desc="Customize your dashboard theme">
          <Toggle
            label="Dark Mode"
            desc="Reduce eye strain in low-light environments"
            checked={darkMode}
            onChange={() => setDarkMode(!darkMode)}
          />
        </Section>

        {/* Session Notifications */}
        <Section title="Session Notifications">
          <Toggle
            label="New Session Scheduled"
            desc="Notify when a student books a session"
            checked={localSettings.sessionNotifications?.newSessionScheduled ?? true}
            onChange={() => toggleSetting("sessionNotifications", "newSessionScheduled")}
          />
          <Toggle
            label="Session Reminders"
            desc="Remind before your own sessions"
            checked={localSettings.sessionNotifications?.sessionReminders ?? true}
            onChange={() => toggleSetting("sessionNotifications", "sessionReminders")}
          />
        </Section>

        {/* Student Activity Notifications */}
        <Section title="Student Activity Notifications">
          <Toggle
            label="Student Messages"
            desc="Notify when a student sends a message"
            checked={localSettings.studentActivity?.studentMessages ?? true}
            onChange={() => toggleSetting("studentActivity", "studentMessages")}
          />
          <Toggle
            label="Email Notifications"
            desc="Receive email for critical notifications"
            checked={localSettings?.studentActivity?.emailNotifications ?? false}
            onChange={() => toggleSetting("studentActivity", "emailNotifications")}
          />
        </Section>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            disabled={!hasChanges}
            onClick={handleSave}
            className={`px-6 py-2 rounded-lg text-white transition ${
              hasChanges ? "bg-teal-500 hover:bg-teal-600" : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            Save Changes
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}

/* ---------- Section Component ---------- */
function Section({ title, desc, children }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm">
      <h2 className="font-semibold mb-1">{title}</h2>
      {desc && <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{desc}</p>}
      <div className="space-y-4">{children}</div>
    </div>
  );
}

/* ---------- Toggle Component ---------- */
function Toggle({ label, desc, checked, onChange }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{desc}</p>
      </div>
      <button
        onClick={onChange}
        className={`w-11 h-6 flex items-center rounded-full transition ${
          checked ? "bg-teal-500" : "bg-gray-300"
        }`}
      >
        <span
          className={`h-5 w-5 bg-white rounded-full shadow transform transition ${
            checked ? "translate-x-5" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}