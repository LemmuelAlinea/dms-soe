const db = require("../config/db");

exports.createDepartment = async (req, res) => {
  try {
    const { departmentName, departmentCode } = req.body;

    await db.query(
      "INSERT INTO departments (departmentName, departmentCode) VALUES (?, ?)",
      [departmentName, departmentCode]
    );

    res.json({ message: "Department created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};