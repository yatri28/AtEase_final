import User from "../models/User.js";

/* GET Logged-in User */
export const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


/* UPDATE Profile */
export const updateProfile = async (req, res) => {
  try {
    const { name, email, year, department, counselor } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.year = year || user.year;
    user.department = department || user.department;
    user.counselor = counselor || user.counselor;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      year: updatedUser.year,
      department: updatedUser.department,
      counselor: updatedUser.counselor
    });

  } catch (error) {
    res.status(500).json({ message: "Update failed" });
  }
};