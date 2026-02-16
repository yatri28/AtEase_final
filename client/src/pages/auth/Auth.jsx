import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Auth() {
  const [mode, setMode] = useState("login"); 
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });

  const navigate = useNavigate();

 const handleSubmit = async (e) => {
  e.preventDefault();

  // 🔴 FIX 1: validate BEFORE API call
  if (mode === "signup" && !form.name.trim()) {
    alert("Name is required");
    return;
  }

  setLoading(true);

  const url =
    mode === "signup"
      ? "http://localhost:5000/api/auth/signup"
      : "http://localhost:5000/api/auth/login";

  const payload =
    mode === "signup"
      ? form
      : {
          email: form.email,
          password: form.password,
          role: form.role,
        };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Something went wrong");
      return;
    }

    // ✅ LOGIN SUCCESS
    if (mode === "login") {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (data.user.role === "student") navigate("/student");
      if (data.user.role === "counselor") navigate("/counselor");
      if (data.user.role === "admin") navigate("/admin");
    }

    // 🟢 FIX 2: SIGNUP SUCCESS FLOW
    if (mode === "signup") {
      alert("Signup successful! Please login.");
      setMode("login");
      setForm({
        name: "",
        email: "",
        password: "",
        role: "student",
      });
    }
  } catch (error) {
    alert("Server error. Try again later.");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="mx-auto h-12 w-12 rounded-lg bg-teal-500 flex items-center justify-center text-white font-bold text-xl">
            A
          </div>
          <h1 className="text-2xl font-bold mt-3">AtEase</h1>
          <p className="text-gray-500 text-sm">Student Wellness Portal</p>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`flex-1 py-2 rounded-md text-sm font-medium ${
              mode === "login" ? "bg-white shadow" : "text-gray-500"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`flex-1 py-2 rounded-md text-sm font-medium ${
              mode === "signup" ? "bg-white shadow" : "text-gray-500"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Name (signup only) */}
          {mode === "signup" && (
            <input
              type="text"
              placeholder="Full Name"
              className="w-full px-4 py-2 border rounded-lg"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              required
            />
          )}

          {/* Email */}
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2 border rounded-lg"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
            required
          />

          {/* Password */}
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2 border rounded-lg"
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
            required
          />

          {/* ✅ ROLE DROPDOWN (LOGIN + SIGNUP) */}
          <select
            className="w-full px-4 py-2 border rounded-lg"
            value={form.role}
            onChange={(e) =>
              setForm({ ...form, role: e.target.value })
            }
          >
            <option value="student">Student</option>
            <option value="counselor">Counselor</option>
            <option value="admin">Admin</option>
          </select>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-500 text-white py-2 rounded-lg font-semibold hover:bg-teal-600 disabled:opacity-50"
          >
            {loading
              ? "Please wait..."
              : mode === "login"
              ? "Sign In"
              : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          ✨ Your wellness journey starts here
        </p>
      </div>
    </div>
  );
}