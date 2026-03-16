import { createContext, useState, useEffect } from "react";
import axios from "axios";

// Create context (not exported immediately)
const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(null);
  const token = localStorage.getItem("token");

  // Fetch settings from backend
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/settings", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSettings(
          res.data || {
            emailNotifications: true,
            sessionReminders: true,
            anonymousNotes: false,
          }
        );
      } catch (err) {
        console.error("Fetch settings error:", err);
        // fallback default settings
        setSettings({
          emailNotifications: true,
          sessionReminders: true,
          anonymousNotes: false,
        });
      }
    };

    if (token) fetchSettings();
  }, [token]);

  // Update settings
  const updateSettings = async (newSettings) => {
    try {
      const res = await axios.post("http://localhost:5000/api/settings", newSettings, {
        headers: { Authorization: `Bearer ${token}` },
      });
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

// Export context here (after provider)
export { SettingsContext };