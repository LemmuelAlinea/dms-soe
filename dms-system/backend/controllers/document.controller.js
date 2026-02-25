const db = require("../config/db");
const logger = require("../utils/logger");

exports.uploadDocument = async (req, res) => {
  try {
    const { folderID } = req.body;

    const departmentID = req.user.departmentID;
    const userID = req.user.userID;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Validate folder belongs to department
    const [folder] = await db.query(
      "SELECT * FROM folders WHERE folderID = ? AND departmentID = ?",
      [folderID, departmentID]
    );

    if (folder.length === 0) {
      return res.status(403).json({ message: "Invalid folder" });
    }
const [[usage]] = await db.query(
  `SELECT CAST(IFNULL(SUM(fileSize),0) AS UNSIGNED) as totalSize
   FROM documents
   WHERE departmentID = ? AND isDeleted = FALSE`,
  [departmentID]
);

const [[dept]] = await db.query(
  "SELECT CAST(storageLimit AS UNSIGNED) as storageLimit FROM departments WHERE departmentID = ?",
  [departmentID]
);

const currentUsage = usage.totalSize;
const storageLimit = dept.storageLimit;
const newFileSize = req.file.size;

console.log("----- STORAGE DEBUG -----");
console.log("Current usage:", currentUsage, typeof currentUsage);
console.log("New file size:", newFileSize, typeof newFileSize);
console.log("Storage limit:", storageLimit, typeof storageLimit);
console.log("Total after upload:", currentUsage + newFileSize);
console.log("-------------------------");

if (currentUsage + newFileSize > storageLimit) {
  return res.status(400).json({ message: "Storage limit exceeded" });
}


console.log("----- STORAGE DEBUG -----");
console.log("Current usage:", usage.totalSize);
console.log("New file size:", req.file.size);
console.log("Storage limit:", dept.storageLimit);
console.log("Total after upload:", usage.totalSize + req.file.size);
console.log("-------------------------");

if (usage.totalSize + req.file.size > dept.storageLimit) {
  return res.status(400).json({ message: "Storage limit exceeded" });
}
    // Insert document
    const [result] = await db.query(
      `INSERT INTO documents 
       (fileName, filePath, fileSize, folderID, departmentID, uploadedBy) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        req.file.originalname,
        req.file.filename,
        req.file.size,
        folderID,
        departmentID,
        userID,
      ]
    );

    // Log activity AFTER successful insert
    await logger.logActivity({
      userID,
      departmentID,
      actionType: "UPLOAD",
      targetType: "Document",
      targetID: result.insertId,
      description: `Uploaded file ${req.file.originalname}`,
    });

    res.json({ message: "Document uploaded successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getDocumentsByFolder = async (req, res) => {
  try {
    const { folderID } = req.params;
    const departmentID = req.user.departmentID;

    const [documents] = await db.query(
    "SELECT * FROM documents WHERE folderID = ? AND departmentID = ? AND isDeleted = FALSE",
    [folderID, departmentID]
    );

    res.json(documents);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.softDeleteDocument = async (req, res) => {
  try {
    const { documentID } = req.params;
    const departmentID = req.user.departmentID;
    const userID = req.user.userID;

    const [doc] = await db.query(
      "SELECT * FROM documents WHERE documentID = ? AND departmentID = ?",
      [documentID, departmentID]
    );

    if (doc.length === 0) {
      return res.status(404).json({ message: "Document not found" });
    }

    await db.query(
      "UPDATE documents SET isDeleted = TRUE, deletedAt = NOW(), deletedBy = ? WHERE documentID = ?",
      [userID, documentID]
    );

    res.json({ message: "Document soft deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.restoreDocument = async (req, res) => {
  try {
    const { documentID } = req.params;
    const departmentID = req.user.departmentID;
    const userID = req.user.userID;

    await db.query(
      "UPDATE documents SET isDeleted = FALSE, deletedAt = NULL, deletedBy = NULL WHERE documentID = ? AND departmentID = ?",
      [documentID, departmentID]
    );

    await logger.logActivity({
      userID,
      departmentID,
      actionType: "RESTORE",
      targetType: "Document",
      targetID: documentID,
      description: `Restored document ID ${documentID}`,
    });

    res.json({ message: "Document restored successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.searchDocuments = async (req, res) => {
  try {
    const departmentID = req.user.departmentID;
    const { q, page = 1, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({ message: "Search query required" });
    }

    const offset = (page - 1) * limit;
    const searchTerm = `%${q}%`;

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) as total
       FROM documents d
       JOIN folders f ON d.folderID = f.folderID
       JOIN users u ON d.uploadedBy = u.userID
       WHERE d.departmentID = ?
       AND d.isDeleted = FALSE
       AND (
         d.fileName LIKE ?
         OR f.folderName LIKE ?
         OR u.fullName LIKE ?
       )`,
      [departmentID, searchTerm, searchTerm, searchTerm]
    );

    const [results] = await db.query(
      `SELECT d.*, f.folderName, u.fullName as uploadedBy
       FROM documents d
       JOIN folders f ON d.folderID = f.folderID
       JOIN users u ON d.uploadedBy = u.userID
       WHERE d.departmentID = ?
       AND d.isDeleted = FALSE
       AND (
         d.fileName LIKE ?
         OR f.folderName LIKE ?
         OR u.fullName LIKE ?
       )
       ORDER BY d.createdAt DESC
       LIMIT ? OFFSET ?`,
      [departmentID, searchTerm, searchTerm, searchTerm, Number(limit), Number(offset)]
    );

    res.json({
      data: results,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.uploadNewVersion = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const { documentID } = req.params;
    const departmentID = req.user.departmentID;
    const userID = req.user.userID;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    await connection.beginTransaction();

    const [docRows] = await connection.query(
      "SELECT * FROM documents WHERE documentID = ? AND departmentID = ? AND isDeleted = FALSE",
      [documentID, departmentID]
    );

    if (docRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Document not found" });
    }

    const currentDoc = docRows[0];

    await connection.query(
      `INSERT INTO document_versions 
       (documentID, filePath, fileSize, uploadedBy)
       VALUES (?, ?, ?, ?)`,
      [documentID, currentDoc.filePath, currentDoc.fileSize, userID]
    );

    await connection.query(
      `UPDATE documents 
       SET filePath = ?, fileSize = ?, fileName = ?
       WHERE documentID = ?`,
      [req.file.filename, req.file.size, req.file.originalname, documentID]
    );

    await connection.commit();

    res.json({ message: "New version uploaded successfully" });

  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ message: "Server error" });
  } finally {
    connection.release();
  }
};

exports.getDocumentVersions = async (req, res) => {
  try {
    const { documentID } = req.params;
    const departmentID = req.user.departmentID;

    // Validate document belongs to department
    const [doc] = await db.query(
      "SELECT * FROM documents WHERE documentID = ? AND departmentID = ?",
      [documentID, departmentID]
    );

    if (doc.length === 0) {
      return res.status(404).json({ message: "Document not found" });
    }

    const [versions] = await db.query(
      "SELECT * FROM document_versions WHERE documentID = ? ORDER BY createdAt DESC",
      [documentID]
    );

    res.json(versions);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.restoreVersion = async (req, res) => {
  try {
    const { versionID } = req.params;
    const departmentID = req.user.departmentID;
    const userID = req.user.userID;

    // Get version
    const [versionRows] = await db.query(
      `SELECT dv.*, d.departmentID 
       FROM document_versions dv
       JOIN documents d ON dv.documentID = d.documentID
       WHERE dv.versionID = ?`,
      [versionID]
    );

    if (versionRows.length === 0) {
      return res.status(404).json({ message: "Version not found" });
    }

    const version = versionRows[0];

    if (version.departmentID !== departmentID) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Get current document
    const [docRows] = await db.query(
      "SELECT * FROM documents WHERE documentID = ?",
      [version.documentID]
    );

    const currentDoc = docRows[0];

    // Save current version into versions table
    await db.query(
      `INSERT INTO document_versions 
       (documentID, filePath, fileSize, uploadedBy)
       VALUES (?, ?, ?, ?)`,
      [
        currentDoc.documentID,
        currentDoc.filePath,
        currentDoc.fileSize,
        userID
      ]
    );

    // Replace document with selected version
    await db.query(
      `UPDATE documents 
       SET filePath = ?, fileSize = ?
       WHERE documentID = ?`,
      [
        version.filePath,
        version.fileSize,
        version.documentID
      ]
    );

    res.json({ message: "Version restored successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const path = require("path");

exports.downloadDocument = async (req, res) => {
  try {
    const { documentID } = req.params;
    const departmentID = req.user.departmentID;

    const [docRows] = await db.query(
      "SELECT * FROM documents WHERE documentID = ? AND departmentID = ?",
      [documentID, departmentID]
    );

    if (docRows.length === 0) {
      return res.status(404).json({ message: "Document not found" });
    }

    const filePath = path.join(__dirname, "../uploads", docRows[0].filePath);

    res.download(filePath);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const fs = require("fs");

exports.previewDocument = async (req, res) => {
  try {
    const { documentID } = req.params;
    const departmentID = req.user.departmentID;

    const [docRows] = await db.query(
      "SELECT * FROM documents WHERE documentID = ? AND departmentID = ? AND isDeleted = FALSE",
      [documentID, departmentID]
    );

    if (docRows.length === 0) {
      return res.status(404).json({ message: "Document not found" });
    }

    const document = docRows[0];

    // Allow only PDF preview
    if (!document.fileName.toLowerCase().endsWith(".pdf")) {
      return res.status(400).json({ message: "Preview only available for PDF files" });
    }

    const filePath = path.join(__dirname, "../uploads", document.filePath);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found on server" });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline");

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getDocuments = async (req, res) => {
  try {
    const departmentID = req.user.departmentID;

    const [documents] = await db.query(
      "SELECT * FROM documents WHERE departmentID = ? AND isDeleted = FALSE",
      [departmentID]
    );

    res.json(documents);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getDeletedDocuments = async (req, res) => {
  try {
    const departmentID = req.user.departmentID;

    const [documents] = await db.query(
      "SELECT * FROM documents WHERE departmentID = ? AND isDeleted = TRUE ORDER BY deletedAt DESC",
      [departmentID]
    );

    res.json(documents);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.permanentDeleteDocument = async (req, res) => {
  try {
    const { documentID } = req.params;
    const departmentID = req.user.departmentID;

    const [doc] = await db.query(
      "SELECT * FROM documents WHERE documentID = ? AND departmentID = ? AND isDeleted = TRUE",
      [documentID, departmentID]
    );

    if (doc.length === 0) {
      return res.status(404).json({ message: "Document not found in recycle bin" });
    }

    // 🔥 DELETE VERSIONS FIRST
    await db.query(
      "DELETE FROM document_versions WHERE documentID = ?",
      [documentID]
    );

    // 🔥 THEN DELETE DOCUMENT
    await db.query(
      "DELETE FROM documents WHERE documentID = ?",
      [documentID]
    );

    res.json({ message: "Document permanently deleted" });

  } catch (err) {
    console.error("Permanent delete error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
