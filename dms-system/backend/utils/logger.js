const db = require("../config/db");

exports.logActivity = async ({
  userID,
  departmentID,
  actionType,
  targetType,
  targetID,
  description,
}) => {
  await db.query(
    `INSERT INTO activity_logs 
     (userID, departmentID, actionType, targetType, targetID, description) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [userID, departmentID, actionType, targetType, targetID, description]
  );
};