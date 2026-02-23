const db = require("../config/db");
const bcrypt = require("bcryptjs");

/*
|--------------------------------------------------------------------------
| CREATE COADMIN (ONLY ADMIN CAN DO THIS)
|--------------------------------------------------------------------------
*/

exports.createAdmin = async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    const creatorRole = req.user.role;
    const creatorDepartmentID = req.user.departmentID;

    // Only Admin can create CoAdmin
    if (creatorRole !== "Admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    // Admin can ONLY create CoAdmin
    if (role !== "CoAdmin") {
      return res.status(400).json({
        message: "Admin can only create CoAdmin"
      });
    }

    if (!creatorDepartmentID) {
      return res.status(400).json({
        message: "Creator has no department assigned"
      });
    }

    // Check if email already exists
    const [existing] = await db.query(
      "SELECT userID FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        message: "Email already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      `INSERT INTO users
       (fullName, email, passwordHash, role, departmentID)
       VALUES (?, ?, ?, ?, ?)`,
      [
        fullName,
        email,
        hashedPassword,
        "CoAdmin",
        creatorDepartmentID
      ]
    );

    res.json({
      message: "CoAdmin created successfully"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


/*
|--------------------------------------------------------------------------
| GET COADMINS FOR ADMIN'S DEPARTMENT
|--------------------------------------------------------------------------
*/

exports.getAdmins = async (req, res) => {
  try {
    const departmentID = req.user.departmentID;
    const role = req.user.role;

    if (role !== "Admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    if (!departmentID) {
      return res.status(400).json({
        message: "Admin has no department assigned"
      });
    }

    const [coadmins] = await db.query(
      `SELECT userID, fullName, email, role
       FROM users
       WHERE departmentID = ?
       AND role = 'CoAdmin'`,
      [departmentID]
    );

    res.json(coadmins);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


/*
|--------------------------------------------------------------------------
| DELETE COADMIN (ONLY FROM SAME DEPARTMENT)
|--------------------------------------------------------------------------
*/

exports.deleteAdmin = async (req, res) => {
  try {
    const { userID } = req.params;
    const departmentID = req.user.departmentID;
    const role = req.user.role;

    if (role !== "Admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    // Check if user exists in same department and is CoAdmin
    const [user] = await db.query(
      `SELECT * FROM users
       WHERE userID = ?
       AND departmentID = ?
       AND role = 'CoAdmin'`,
      [userID, departmentID]
    );

    if (user.length === 0) {
      return res.status(404).json({
        message: "CoAdmin not found"
      });
    }

    await db.query(
      "DELETE FROM users WHERE userID = ?",
      [userID]
    );

    res.json({ message: "CoAdmin deleted successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};