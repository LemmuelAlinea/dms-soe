const db = require("../config/db");
const bcrypt = require("bcryptjs");
/*
|--------------------------------------------------------------------------
| SUPERADMIN GLOBAL DASHBOARD
|--------------------------------------------------------------------------
*/

exports.getSystemDashboard = async (req, res) => {
  try {
    // Only SuperAdmin allowed
    if (req.user.role !== "SuperAdmin") {
      return res.status(403).json({ message: "Access denied" });
    }

    // Total Departments
    const [[{ totalDepartments }]] = await db.query(
      "SELECT COUNT(*) as totalDepartments FROM departments"
    );

    // Total Admins
    const [[{ totalAdmins }]] = await db.query(
      "SELECT COUNT(*) as totalAdmins FROM users WHERE role = 'Admin'"
    );

    // Total CoAdmins
    const [[{ totalCoAdmins }]] = await db.query(
      "SELECT COUNT(*) as totalCoAdmins FROM users WHERE role = 'CoAdmin'"
    );

    // Total Documents
    const [[{ totalDocuments }]] = await db.query(
      "SELECT COUNT(*) as totalDocuments FROM documents WHERE isDeleted = FALSE"
    );

    // Total System Storage Used
    const [[{ totalStorage }]] = await db.query(
      "SELECT IFNULL(SUM(fileSize),0) as totalStorage FROM documents WHERE isDeleted = FALSE"
    );

    // Convert bytes to MB
    const totalStorageMB = (totalStorage / (1024 * 1024)).toFixed(2);

    // Top 3 Departments by Storage Usage
    const [topDepartments] = await db.query(`
      SELECT d.departmentName,
             IFNULL(SUM(doc.fileSize),0) as usedStorage
      FROM departments d
      LEFT JOIN documents doc
        ON d.departmentID = doc.departmentID
        AND doc.isDeleted = FALSE
      GROUP BY d.departmentID
      ORDER BY usedStorage DESC
      LIMIT 3
    `);

    res.json({
      totalDepartments,
      totalAdmins,
      totalCoAdmins,
      totalDocuments,
      totalStorageMB,
      topDepartments
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/*
|--------------------------------------------------------------------------
| GET ALL DEPARTMENTS WITH STORAGE USAGE
|--------------------------------------------------------------------------
*/

exports.getDepartments = async (req, res) => {
  try {
    if (req.user.role !== "SuperAdmin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const [departments] = await db.query(`
      SELECT d.*,
        IFNULL(SUM(doc.fileSize),0) as usedStorage
      FROM departments d
      LEFT JOIN documents doc
        ON d.departmentID = doc.departmentID
        AND doc.isDeleted = FALSE
      GROUP BY d.departmentID
      ORDER BY d.createdAt DESC
    `);

    res.json(departments);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


/*
|--------------------------------------------------------------------------
| CREATE DEPARTMENT
|--------------------------------------------------------------------------
*/

exports.createDepartment = async (req, res) => {
  try {
    const { departmentName, departmentCode, storageLimitMB } = req.body;

    if (req.user.role !== "SuperAdmin") {
      return res.status(403).json({ message: "Access denied" });
    }

    if (!departmentName || !departmentCode || !storageLimitMB) {
      return res.status(400).json({ message: "All fields required" });
    }

    const storageLimitBytes = storageLimitMB * 1024 * 1024;

    // Check if departmentCode already exists
    const [existing] = await db.query(
      "SELECT * FROM departments WHERE departmentCode = ?",
      [departmentCode]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        message: "Department code already exists"
      });
    }

    await db.query(
      `INSERT INTO departments 
       (departmentName, departmentCode, storageLimit)
       VALUES (?, ?, ?)`,
      [departmentName, departmentCode, storageLimitBytes]
    );

    res.json({ message: "Department created successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


/*
|--------------------------------------------------------------------------
| UPDATE DEPARTMENT
|--------------------------------------------------------------------------
*/

exports.updateDepartment = async (req, res) => {
  try {
    const { departmentID } = req.params;
    const { departmentName, storageLimitMB } = req.body;

    if (req.user.role !== "SuperAdmin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const storageLimitBytes = storageLimitMB * 1024 * 1024;

    await db.query(
      "UPDATE departments SET departmentName = ?, storageLimit = ? WHERE departmentID = ?",
      [departmentName, storageLimitBytes, departmentID]
    );

    res.json({ message: "Department updated successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


/*
|--------------------------------------------------------------------------
| DELETE DEPARTMENT
|--------------------------------------------------------------------------
*/

exports.deleteDepartment = async (req, res) => {
  try {
    const { departmentID } = req.params;

    if (req.user.role !== "SuperAdmin") {
      return res.status(403).json({ message: "Access denied" });
    }

    await db.query(
      "DELETE FROM departments WHERE departmentID = ?",
      [departmentID]
    );

    res.json({ message: "Department deleted successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAdmins = async (req, res) => {
  try {
    if (req.user.role !== "SuperAdmin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const [admins] = await db.query(`
      SELECT 
        u.userID,
        u.fullName,
        u.email,
        u.role,
        u.departmentID,
        d.departmentName,
        d.departmentCode
      FROM users u
      LEFT JOIN departments d 
        ON u.departmentID = d.departmentID
      WHERE u.role = 'Admin'
    `);

    res.json(admins);

  } catch (err) {
    console.error("GET ADMINS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.createAdmin = async (req, res) => {
  try {
    const { fullName, email, password, departmentID } = req.body;

    if (req.user.role !== "SuperAdmin") {
      return res.status(403).json({ message: "Access denied" });
    }

    if (!fullName || !email || !password || !departmentID) {
      return res.status(400).json({ message: "All fields required" });
    }

    const [existing] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      `INSERT INTO users 
       (fullName, email, passwordHash, role, departmentID)
       VALUES (?, ?, ?, 'Admin', ?)`,
      [fullName, email, hashedPassword, departmentID]
    );

    res.json({ message: "Admin created successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteAdmin = async (req, res) => {
  try {
    const { userID } = req.params;

    if (req.user.role !== "SuperAdmin") {
      return res.status(403).json({ message: "Access denied" });
    }

    await db.query(
      "DELETE FROM users WHERE userID = ?",
      [userID]
    );

    res.json({ message: "Admin deleted successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.resetUserPassword = async (req, res) => {
  try {
    if (req.user.role !== "SuperAdmin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { userID } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters"
      });
    }

    // Check if user exists and is Admin or CoAdmin
    const [users] = await db.query(
      "SELECT role FROM users WHERE userID = ?",
      [userID]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const targetRole = users[0].role;

    if (targetRole !== "Admin" && targetRole !== "CoAdmin") {
      return res.status(400).json({
        message: "Can only reset Admin or CoAdmin passwords"
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.query(
      "UPDATE users SET passwordHash = ? WHERE userID = ?",
      [hashedPassword, userID]
    );

    res.json({ message: "Password reset successfully" });

  } catch (err) {
    console.error("RESET PASSWORD ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.getGlobalLogs = async (req, res) => {
  try {
    if (req.user.role !== "SuperAdmin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const {
      departmentID,
      role,
      actionType,
      startDate,
      endDate,
      page = 1,
      limit = 20
    } = req.query;

    const offset = (page - 1) * limit;

    let conditions = [];
    let values = [];

    // Department filter
    if (departmentID) {
      conditions.push("l.departmentID = ?");
      values.push(departmentID);
    }

    // Role filter
    if (role) {
      conditions.push("u.role = ?");
      values.push(role);
    }

    // Action filter
    if (actionType) {
      conditions.push("l.actionType = ?");
      values.push(actionType);
    }

    // Date range
    if (startDate && endDate) {
      conditions.push("DATE(l.createdAt) BETWEEN ? AND ?");
      values.push(startDate, endDate);
    }

    const whereClause =
      conditions.length > 0
        ? "WHERE " + conditions.join(" AND ")
        : "";

    const [logs] = await db.query(
      `
      SELECT 
        l.logID,
        l.actionType,
        l.targetType,
        l.targetID,
        l.description,
        l.createdAt,
        u.fullName,
        u.role,
        d.departmentName
      FROM activity_logs l
      JOIN users u ON l.userID = u.userID
      LEFT JOIN departments d ON l.departmentID = d.departmentID
      ${whereClause}
      ORDER BY l.createdAt DESC
      LIMIT ? OFFSET ?
      `,
      [...values, Number(limit), Number(offset)]
    );

    // Get total count for pagination
    const [countResult] = await db.query(
      `
      SELECT COUNT(*) as total
      FROM activity_logs l
      JOIN users u ON l.userID = u.userID
      LEFT JOIN departments d ON l.departmentID = d.departmentID
      ${whereClause}
      `,
      values
    );

    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    res.json({
      data: logs,
      pagination: {
        total,
        page: Number(page),
        totalPages
      }
    });

  } catch (err) {
    console.error("GLOBAL LOGS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAdvancedAnalytics = async (req, res) => {
  try {
    // 1️⃣ Documents per department
    const [docsPerDept] = await db.query(`
      SELECT d.departmentID, dp.departmentName, COUNT(*) as totalDocuments
      FROM documents d
      JOIN departments dp ON d.departmentID = dp.departmentID
      WHERE d.isDeleted = FALSE
      GROUP BY d.departmentID
    `);

    // 2️⃣ Storage usage per department
    const [storageData] = await db.query(`
      SELECT 
        dp.departmentID,
        dp.departmentName,
        dp.storageLimit,
        IFNULL(SUM(d.fileSize), 0) as usedStorage
      FROM departments dp
      LEFT JOIN documents d 
        ON dp.departmentID = d.departmentID 
        AND d.isDeleted = FALSE
      GROUP BY dp.departmentID
    `);

    // 3️⃣ Activity trend (last 30 days)
    const [activityTrend] = await db.query(`
      SELECT DATE(createdAt) as date, COUNT(*) as total
      FROM activity_logs
      WHERE createdAt >= NOW() - INTERVAL 30 DAY
      GROUP BY DATE(createdAt)
      ORDER BY DATE(createdAt)
    `);

    // 4️⃣ Action distribution
    const [actionDistribution] = await db.query(`
      SELECT actionType, COUNT(*) as total
      FROM activity_logs
      GROUP BY actionType
    `);

    res.json({
      docsPerDept,
      storageData,
      activityTrend,
      actionDistribution
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};