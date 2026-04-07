import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Auth() {
  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    department: "",
    year: "",
    assignedYear: "",
  });

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (mode === "signup" && !form.name.trim()) {
      setError("Name is required.");
      return;
    }

    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;

    if (!passwordRegex.test(form.password)) {
      setError(
        "Password must be at least 8 characters, include 1 uppercase letter and 1 special character."
      );
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
        setError(data.message || "Something went wrong.");
        return;
      }

      if (mode === "login") {
        sessionStorage.setItem("token", data.token);
        sessionStorage.setItem("user", JSON.stringify(data.user));

        if (data.user.role === "student") navigate("/student");
        if (data.user.role === "counselor") navigate("/counselor");
        if (data.user.role === "admin") navigate("/admin");
      }

      if (mode === "signup") {
        alert("Signup successful! Please login.");
        setMode("login");
        setForm({
          name: "",
          email: "",
          password: "",
          role: "student",
          department: "",
          year: "",
          assignedYear: "",
        });
      }
    } catch {
      setError("Server error. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-6">
          <div className="mx-auto h-12 w-12 rounded-lg bg-teal-500 flex items-center justify-center text-white font-bold text-xl">
            A
          </div>
          <h1 className="text-2xl font-bold mt-3">AtEase</h1>
          <p className="text-gray-500 text-sm">Student Wellness Portal</p>
        </div>

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

        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="text-red-500 text-sm bg-red-50 p-2 rounded-lg">
              {error}
            </div>
          )}

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

          {mode === "signup" && form.role !== "admin" && (
            <select
              className="w-full px-4 py-2 border rounded-lg"
              value={form.department}
              onChange={(e) =>
                setForm({ ...form, department: e.target.value })
              }
              required
            >
              <option value="">Select Department</option>
              <option value="CP">CP</option>
              <option value="IT">IT</option>
              <option value="CE">CE</option>
              <option value="EE">EE</option>
              <option value="EC">EC</option>

            </select>
          )}

          {mode === "signup" && form.role === "student" && (
            <select
              className="w-full px-4 py-2 border rounded-lg"
              value={form.year}
              onChange={(e) =>
                setForm({ ...form, year: e.target.value })
              }
              required
            >
              <option value="">Select Year</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
          )}

          {mode === "signup" && form.role === "counselor" && (
            <select
              className="w-full px-4 py-2 border rounded-lg"
              value={form.assignedYear}
              onChange={(e) =>
                setForm({ ...form, assignedYear: e.target.value })
              }
              required
            >
              <option value="">Handles Year</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
          )}

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