const express = require("express");
const db = require("../models");
const router = express.Router();
const { Auth, isAdmin } = require("../middlewares/auth.js");
const { User } = db;

router.get("/all-users", Auth, isAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;

    const offset = (page - 1) * pageSize;
    const limit = pageSize;

    const Users = await User.findAll({
      starting: offset,
      limit: limit,
    });

    if (Users.length == 0) {
      return res.status(404).json({ Message: "No Users Found In Our Records" });
    }

    const totalUsers = await User.count();
    const totalPages = Math.ceil(totalUsers / pageSize);

    return res.status(200).json({
      message: "All Users Retrieved Successfully.",
      currentPage: page,
      totalPages: totalPages,
      totalUsers: totalUsers,
      users: Users,
    });
  } catch (error) {
    return res.status(403).json({ Message: error.message });
  }
});

router.post("/create-admin", Auth, isAdmin, async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    const { error, value } = userSignUpValidationSchema.validate({
      email,
      password,
      firstName,
      lastName,
    });

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    const existingUser = await User.findOne({ where: { email: value.email } });

    if (existingUser) {
    return res.status(403).json({ message: "User with this email already exists." })}

    const hashedPassword = await bcrypt.hash(value.password, 10);
    const newAdmin = await User.create({
      email: value.email,
      password: hashedPassword,
      firstName: value.firstName,
      lastName: value.lastName,
      role: "Admin",
    });

    return res.status(201).json({ message: "Admin created successfully.",
      user: {
        email: newAdmin.email,
        firstName: newAdmin.firstName,
        lastName: newAdmin.lastName,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.post("/promote/:id", Auth, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "Admin") {
      return res.status(400).json({ message: "User is already an Admin" });
    }

    user.role = "Admin";
    await user.save();

    return res.status(200).json({ message: "User promoted to Admin successfully",
        user: { firstName: user.firstName, role: user.role, email: user.email },
      });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
