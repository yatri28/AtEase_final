import { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../../layouts/DashboardLayout";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
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
      console.error(err);
    }
  };

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
      console.error(err);
    }
  };

  if (!user) return <div className="p-6">Loading...</div>;

  return (
    <DashboardLayout role={user.role}>
      <h1 className="text-2xl font-bold mb-1">Profile</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        View and manage your personal information
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 flex flex-col items-center text-center">
          <div className="h-20 w-20 rounded-full bg-teal-500 flex items-center justify-center text-white text-3xl font-semibold">
            {user.name?.[0]}
          </div>

          <h2 className="mt-4 text-xl font-semibold">{user.name}</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{user.email}</p>

          <span className="mt-3 inline-block bg-teal-100 text-teal-700 text-xs px-3 py-1 rounded-full">
            {user.role}
          </span>

          {!editMode && (
            <button
              onClick={() => setEditMode(true)}
              className="mt-5 px-4 py-2 border rounded-lg"
            >
              Edit Profile
            </button>
          )}
        </div>

        {/* Details */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
          <h2 className="font-semibold mb-4">Personal Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white dark:bg-gray-800 rounded-2xl text-gray-500 dark:text-gray-400">
            <EditableField label="Full Name" name="name" value={user.name} editMode={editMode} onChange={handleChange}/>
            <EditableField label="Email" name="email" value={user.email} editMode={editMode} onChange={handleChange}/>
            <EditableField label="Academic Year" name="year" value={user.year} editMode={editMode} onChange={handleChange}/>
            <EditableField label="Department" name="department" value={user.department} editMode={editMode} onChange={handleChange}/>
            <EditableField label="Assigned Counselor" name="counselor" value={user.counselor} editMode={editMode} onChange={handleChange}/>
          </div>

          {editMode && (
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleSave}
                className="px-5 py-2 bg-teal-500 text-white rounded-lg"
              >
                Save Changes
              </button>
              <button
                onClick={() => setEditMode(false)}
                className="px-5 py-2 border rounded-lg"
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
          className="border rounded-lg px-3 py-2 w-full mt-1"
        />
      ) : (
        <p className="font-medium mt-1">{value}</p>
      )}
    </div>
  );
}