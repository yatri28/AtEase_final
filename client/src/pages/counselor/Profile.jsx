import { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../../layouts/DashboardLayout";

export default function CounselorProfile() {

  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const token = sessionStorage.getItem("token");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {

      const res = await axios.get(
        "http://localhost:5000/api/counselors/profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProfile(res.data);

    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {

      const res = await axios.put(
        "http://localhost:5000/api/counselors/profile",
        profile,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProfile(res.data);
      setEditMode(false);

      alert("Profile updated successfully");

    } catch (err) {
      console.error(err);
    }
  };

  if (!profile) return <div className="p-6">Loading...</div>;

  return (
    <DashboardLayout role="counselor">

      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8 text-center">

          <div className="flex justify-center">
            <div className="h-24 w-24 rounded-full bg-teal-500 flex items-center justify-center text-white text-4xl font-semibold">
              {profile.name?.[0]}
            </div>
          </div>

          <h2 className="mt-4 text-2xl font-semibold">{profile.name}</h2>
          <p className="text-gray-500 dark:text-gray-400">{profile.email}</p>

          <span className="mt-3 inline-block bg-teal-100 text-teal-700 text-xs px-3 py-1 rounded-full">
            Counselor
          </span>

          {!editMode && (
            <div className="mt-5">
              <button
                onClick={() => setEditMode(true)}
                className="px-5 py-2 border rounded-lg"
              >
                Edit Profile
              </button>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 mt-6">

          <h2 className="font-semibold mb-5 text-lg">
            Counselor Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <EditableField label="Full Name" name="name" value={profile.name} editMode={editMode} onChange={handleChange}/>
            <EditableField label="Email" name="email" value={profile.email} editMode={false}/>
            <EditableField label="Department" name="department" value={profile.department} editMode={false}/>
            <EditableField label="Assigned Year" name="assignedYear" value={profile.assignedYear} editMode={false}/>
            <EditableField label="Specialization" name="specialization" value={profile.specialization} editMode={editMode} onChange={handleChange}/>
            <EditableField label="Contact Number" name="contactNumber" value={profile.contactNumber} editMode={editMode} onChange={handleChange}/>

          </div>

          {editMode && (
            <div className="mt-6 flex gap-3 justify-center">

              <button
                onClick={handleSave}
                className="px-6 py-2 bg-teal-500 text-white rounded-lg"
              >
                Save Changes
              </button>

              <button
                onClick={() => setEditMode(false)}
                className="px-6 py-2 border rounded-lg"
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

      <p className="text-sm text-gray-500 dark:text-gray-400">
        {label}
      </p>

      {editMode ? (
        <input
          type="text"
          name={name}
          value={value || ""}
          onChange={onChange}
          className="border rounded-lg px-3 py-2 w-full mt-1"
        />
      ) : (
        <p className="font-medium mt-1">
          {value}
        </p>
      )}

    </div>
  );
}