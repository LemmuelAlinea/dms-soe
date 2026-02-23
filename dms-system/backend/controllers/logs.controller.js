const db = require("../config/db");

exports.getLogs = async (req, res) => {
  try {
    const departmentID = req.user.departmentID;
    const { action, from, to } = req.query;

    let query = `
      SELECT l.*, u.fullName
      FROM activity_logs l
      JOIN users u ON l.userID = u.userID
      WHERE l.departmentID = ?
    `;
    const params = [departmentID];

    if (action) {
      query += " AND l.actionType = ?";
      params.push(action);
    }

    if (from && to) {
      query += " AND l.createdAt BETWEEN ? AND ?";
      params.push(from, to);
    }

    query += " ORDER BY l.createdAt DESC";

    const [logs] = await db.query(query, params);

    res.json(logs);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};