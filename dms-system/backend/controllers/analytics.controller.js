const db = require("../config/db");

exports.getStorageAnalytics = async (req, res) => {
  try {
    const departmentID = req.user.departmentID;

    const [result] = await db.query(
      `SELECT 
         COUNT(*) AS totalFiles,
         IFNULL(SUM(fileSize), 0) AS totalSize
       FROM documents
       WHERE departmentID = ?
       AND isDeleted = FALSE`,
      [departmentID]
    );

    res.json(result[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getDashboardSummary = async (req, res) => {
  try {
    const departmentID = req.user.departmentID;

    // Get total storage used
    const [[usage]] = await db.query(
      `SELECT IFNULL(SUM(fileSize),0) as totalSize
       FROM documents
       WHERE departmentID = ? AND isDeleted = FALSE`,
      [departmentID]
    );

    // Get department storage limit
    const [[dept]] = await db.query(
      "SELECT storageLimit FROM departments WHERE departmentID = ?",
      [departmentID]
    );

    const usedStorageBytes = usage.totalSize;
    const storageLimitBytes = dept.storageLimit || 0;

    // Convert to MB
    const usedStorageMB = Number((usedStorageBytes / (1024 * 1024)).toFixed(2));
    const storageLimitMB = Number((storageLimitBytes / (1024 * 1024)).toFixed(2));

    let usagePercentage = 0;
    if (storageLimitBytes > 0) {
      usagePercentage = (usedStorageBytes / storageLimitBytes) * 100;
    }

    usagePercentage = Number(usagePercentage.toFixed(2));

    // Determine health status
    let healthStatus = "HEALTHY";

    if (usagePercentage > 100) {
      healthStatus = "EXCEEDED";
    } else if (usagePercentage >= 90) {
      healthStatus = "CRITICAL";
    } else if (usagePercentage >= 70) {
      healthStatus = "WARNING";
    }

    res.json({
      usedStorageBytes,
      storageLimitBytes,
      usedStorageMB,
      storageLimitMB,
      usagePercentage,
      healthStatus
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};