import { useContext, useState, useEffect } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { ThemeContext } from "../../context/ThemeContext";
import { SettingsContext } from "../../context/SettingsContext.jsx";
import toast from "react-hot-toast";

export default function Settings() {
  const { settings, updateSettings } = useContext(SettingsContext);
  const { darkMode, setDarkMode } = useContext(ThemeContext);

  // Local settings
  const [localSettings, setLocalSettings] = useState({
    emailReminder: false,
    sessionReminder: false,
    anonymousNotes: false,
  });

  // Local dark mode (IMPORTANT)
  const [localDarkMode, setLocalDarkMode] = useState(darkMode);

  // Sync backend settings
  useEffect(() => {
    if (!settings) return;

    Promise.resolve().then(() => {
      setLocalSettings((prev) => ({
        ...prev,
        ...settings,
      }));
    });
  }, [settings]);

  // Sync dark mode
  useEffect(() => {
    setLocalDarkMode(darkMode);
  }, [darkMode]);

  // Check changes (settings + dark mode)
  const hasChanges =
  settings
    ? localSettings.emailReminder !== settings.emailReminder ||
      localSettings.sessionReminder !== settings.sessionReminder ||
      localSettings.anonymousNotes !== settings.anonymousNotes ||
      localDarkMode !== darkMode
    : false;

  const toggleSetting = (key) => {
    setLocalSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
  if (!hasChanges) return;

  try {
    await updateSettings(localSettings);
    setDarkMode(localDarkMode);

    toast.success("Settings saved successfully");
  } catch {
    toast.error("Failed to save settings");
  }
};


  // Loading state
  if (!settings) {
    return (
      <DashboardLayout role="student">
        <p className="p-6">Loading settings...</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="student">
      <h1 className="text-2xl font-bold mb-1">Settings</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        Manage your preferences and notifications
      </p>

      <div className="space-y-6 max-w-3xl">

        {/* Notifications */}
        <Section title="Notifications" desc="Control how we notify you">
          <Toggle
            label="Email Notifications"
            desc="Receive session reminders via email"
            checked={localSettings.emailReminder}
            onChange={() => toggleSetting("emailReminder")}
          />
          <Toggle
            label="Session Reminders"
            desc="Get in-app reminders before sessions"
            checked={localSettings.sessionReminder}
            onChange={() => toggleSetting("sessionReminder")}
          />
        </Section>

        {/* Privacy */}
        <Section title="Privacy" desc="Manage your data & visibility">
          <Toggle
            label="Anonymous Notes"
            desc="Allow counselors to see notes anonymously"
            checked={localSettings.anonymousNotes}
            onChange={() => toggleSetting("anonymousNotes")}
          />
        </Section>

        {/* Appearance */}
        <Section title="Appearance" desc="Customize your experience">
          <Toggle
            label="Dark Mode"
            desc="Reduce eye strain in low-light environments"
            checked={localDarkMode}
            onChange={() => setLocalDarkMode(!localDarkMode)}
          />
        </Section>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
          disabled={!hasChanges}
          onClick={handleSave}
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

/* ---------- Section ---------- */
function Section({ title, desc, children }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm">
      <h2 className="font-semibold mb-1">{title}</h2>
      {desc && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {desc}
        </p>
      )}
      <div className="space-y-4">{children}</div>
    </div>
  );
}

/* ---------- Toggle ---------- */
function Toggle({ label, desc, checked, onChange }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {desc}
        </p>
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