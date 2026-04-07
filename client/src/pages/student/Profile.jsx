import { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../../layouts/DashboardLayout";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const token = sessionStorage.getItem("token");

  // ✅ FIX: define function BEFORE useEffect
 useEffect(() => {
  if (!token) return;

  const getUser = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/users/me",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUser(res.data);
    } catch (err) {
      console.error("Fetch user error:", err);
    }
  };

  getUser();
}, [token]);


  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const res = await axios.put(
        "http://localhost:5000/api/users/update",
        user,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUser(res.data);
      setEditMode(false);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  if (!user) return <div className="p-6">Loading...</div>;

  return (
    <DashboardLayout role={user.role}>
      <div className="max-w-3xl mx-auto">

        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8 text-center">

          <div className="flex justify-center">
            <div className="h-24 w-24 rounded-full bg-teal-500 flex items-center justify-center text-white text-4xl font-semibold">
              {user.name?.[0]}
            </div>
          </div>

          <h2 className="mt-4 text-2xl font-semibold">{user.name}</h2>
          <p className="text-gray-500 dark:text-gray-400">{user.email}</p>

          <span className="mt-3 inline-block bg-teal-100 text-teal-700 text-xs px-3 py-1 rounded-full">
            {user.role}
          </span>

          {!editMode && (
            <div className="mt-5">
              <button
                onClick={() => setEditMode(true)}
                className="px-5 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Edit Profile
              </button>
            </div>
          )}
        </div>

        {/* Profile Details */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 mt-6">

          <h2 className="font-semibold mb-5 text-lg">
            Personal Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <EditableField
              label="Full Name"
              name="name"
              value={user.name}
              editMode={editMode}
              onChange={handleChange}
            />

            <EditableField
              label="Email"
              name="email"
              value={user.email}
              editMode={editMode}
              onChange={handleChange}
            />

            <EditableField
              label="Department"
              name="department"
              value={user.department}
              editMode={editMode}
              onChange={handleChange}
            />

            <EditableField
              label="Academic Year"
              name="year"
              value={user.year}
              editMode={editMode}
              onChange={handleChange}
            />

          </div>

          {editMode && (
            <div className="mt-6 flex gap-3 justify-center">
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
              >
                Save Changes
              </button>

              <button
                onClick={() => setEditMode(false)}
                className="px-6 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}

/* Editable Field Component */

function EditableField({ label, name, value, editMode, onChange }) {
  return (
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>

      {editMode ? (
        <input
          type="text"
          name={name}
          value={value || ""}
          onChange={onChange}
          className="border rounded-lg px-3 py-2 w-full mt-1 dark:bg-gray-700 dark:border-gray-600"
        />
      ) : (
        <p className="font-medium mt-1">{value}</p>
      )}
    </div>
  );
}