import User from "../models/User.js";
import Counselor from "../models/Counselor.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ===================== SIGNUP =====================
export const signup = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      department,
      year,
      assignedYear,
    } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
      role,
      department: role !== "admin" ? department : undefined,
      year: role === "student" ? Number(year) : undefined,
      assignedYear: role === "counselor" ? Number(assignedYear) : undefined,
    });

    // If counselor → create counselor profile
    if (role === "counselor") {
      await Counselor.create({
        userId: user._id,
        name: user.name,
        specialization: "General",
        contactNumber: "0000000000",
      });
    }

    res.status(201).json({ message: "Signup success" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===================== LOGIN =====================
export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (user.role !== role) {
      return res.status(403).json({
        message: "Role does not match this account",
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};