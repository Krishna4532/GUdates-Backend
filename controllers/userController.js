import User from "../models/User.js";

export const getMyProfile = async (req, res) => {
  res.json(req.user);
};

export const updateProfile = async (req, res) => {
  try {
    const updates = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true }
    ).select("-password");

    res.json({ message: "Updated", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const exploreUsers = async (req, res) => {
  try {
    const { search, age, height, course, interests } = req.query;

    let filter = {};

    if (search) filter.username = { $regex: search, $options: "i" };
    if (age) filter.age = age;
    if (height) filter.height = height;
    if (course) filter.course = course;
    if (interests) filter.interests = { $in: interests.split(",") };

    const users = await User.find(filter).select("-password");

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



