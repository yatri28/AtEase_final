import { createContext, useState, useEffect } from "react";
import axios from "axios";

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(null);
  const token = localStorage.getItem("token");

  // 🔄 Fetch settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/settings", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // ✅ Correct field names
        setSettings({
          emailReminder: false,
          sessionReminder: false,
          anonymousNotes: false,
          ...res.data,
        });

      } catch (err) {
        console.error("Fetch settings error:", err);

        setSettings({
          emailReminder: false,
          sessionReminder: false,
          anonymousNotes: false,
        });
      }
    };

    if (token) fetchSettings();
  }, [token]);

  // 🔄 Update settings
  const updateSettings = async (newSettings) => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/settings",
        {
          // ✅ MATCH BACKEND FIELDS
          emailReminder: !!newSettings.emailReminder,
          sessionReminder: !!newSettings.sessionReminder,
          anonymousNotes: !!newSettings.anonymousNotes,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSettings(res.data);
      return res.data;

    } catch (err) {
      console.error("Update settings error:", err);
      throw err;
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export { SettingsContext };