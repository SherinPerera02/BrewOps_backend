const express = require("express");
const router = express.Router();

// Mock user list - replace with DB query in production
const users = [
  {
    id: "vimalaweera",
    name: "M P S K M Vimalaweera",
    email: "vimalaweera@brewops.com",
    avatar: "MV",
    role: "Production Manager",
    department: "Production",
    online: true,
    joinDate: "2020-01-15",
  },
  {
    id: "weerasiri",
    name: "L D S N S Weerasiri",
    email: "weerasiri@brewops.com",
    avatar: "LW",
    role: "Quality Control Manager",
    department: "Quality Control",
    online: false,
    joinDate: "2020-03-20",
  },
  {
    id: "perera",
    name: "S M Perera",
    email: "perera@brewops.com",
    avatar: "SP",
    role: "Factory Supervisor",
    department: "Operations",
    online: true,
    joinDate: "2019-11-10",
  },
  {
    id: "manager",
    name: "Production Manager",
    email: "manager@brewops.com",
    avatar: "PM",
    role: "Production Manager",
    department: "Management",
    online: true,
    joinDate: "2018-05-01",
  },
  {
    id: "silva",
    name: "R A Silva",
    email: "silva@brewops.com",
    avatar: "RS",
    role: "Machine Operator",
    department: "Production",
    online: false,
    joinDate: "2021-02-14",
  },
  {
    id: "fernando",
    name: "K P Fernando",
    email: "fernando@brewops.com",
    avatar: "KF",
    role: "Tea Taster",
    department: "Quality Control",
    online: true,
    joinDate: "2020-08-30",
  },
];

// GET /api/users - get all users (with optional search)
router.get("/", (req, res) => {
  try {
    const search = (req.query.search || "").toLowerCase();
    let filtered = users;

    if (search) {
      filtered = users.filter(
        (u) =>
          u.name.toLowerCase().includes(search) ||
          u.email.toLowerCase().includes(search) ||
          u.role.toLowerCase().includes(search) ||
          u.department.toLowerCase().includes(search)
      );
    }

    res.json(filtered);
  } catch (error) {
    res.status(500).json([]);
  }
});

// GET /api/users/:id - get specific user
router.get("/:id", (req, res) => {
  try {
    const userId = req.params.id;
    const user = users.find((u) => u.id === userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/users/:id - update user status (online/offline)
router.put("/:id/status", (req, res) => {
  try {
    const userId = req.params.id;
    const { online } = req.body;
    const user = users.find((u) => u.id === userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.online = online;
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
