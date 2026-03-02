const db = require("../config/db");
const bcrypt = require("bcryptjs");

/*
|--------------------------------------------------------------------------
| CREATE COADMIN (ONLY ADMIN CAN DO THIS)
|--------------------------------------------------------------------------
*/

exports.createAdmin = async (req, res) => {
  try {
    const { firstName, middleName, lastName, email, password } = req.body;

    if (req.user.role !== "Admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "All required fields missing" });
    }

    const departmentID = req.user.departmentID;

    const [existing] = await db.query(
      "SELECT userID FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      `INSERT INTO users
       (firstName, middleName, lastName, email, passwordHash, role, departmentID)
       VALUES (?, ?, ?, ?, ?, 'CoAdmin', ?)`,
      [
        firstName,
        middleName || null,
        lastName,
        email,
        hashedPassword,
        departmentID
      ]
    );

    res.json({ message: "CoAdmin created successfully" });

  } catch (err) {
    console.error("CREATE COADMIN ERROR:", err);
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
    if (req.user.role !== "Admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const departmentID = req.user.departmentID;

    const [coadmins] = await db.query(`
      SELECT 
        userID,
        CONCAT(
          firstName,
          IF(middleName IS NOT NULL AND middleName != '', CONCAT(' ', middleName), ''),
          ' ',
          lastName
        ) AS fullName,
        email,
        role
      FROM users
      WHERE departmentID = ?
      AND role = 'CoAdmin'
      AND isDeleted = FALSE
    `, [departmentID]);

    res.json(coadmins);

  } catch (err) {
    console.error("GET COADMINS ERROR:", err);
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

    if (req.user.role !== "Admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    await db.query(
      "UPDATE users SET isDeleted = TRUE WHERE userID = ? AND role = 'CoAdmin'",
      [userID]
    );

    res.json({ message: "CoAdmin deleted successfully" });

  } catch (err) {
    console.error("DELETE COADMIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};