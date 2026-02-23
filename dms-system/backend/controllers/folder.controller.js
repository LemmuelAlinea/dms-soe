const db = require("../config/db");

exports.createFolder = async (req, res) => {
  try {
    const { folderName, parentFolderID } = req.body;

    const departmentID = req.user.departmentID;
    const userID = req.user.userID;

    if (!departmentID) {
      return res.status(400).json({ message: "No department assigned" });
    }

    // If creating subfolder, validate parent belongs to same department
    if (parentFolderID) {
      const [parent] = await db.query(
        "SELECT * FROM folders WHERE folderID = ? AND departmentID = ?",
        [parentFolderID, departmentID]
      );

      if (parent.length === 0) {
        return res.status(403).json({ message: "Invalid parent folder" });
      }
    }

    await db.query(
      "INSERT INTO folders (folderName, parentFolderID, departmentID, createdBy) VALUES (?, ?, ?, ?)",
      [folderName, parentFolderID || null, departmentID, userID]
    );

    res.json({ message: "Folder created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getFolders = async (req, res) => {
  try {
    const departmentID = req.user.departmentID;

    const [folders] = await db.query(
      "SELECT * FROM folders WHERE departmentID = ?",
      [departmentID]
    );

    res.json(folders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getFolderTree = async (req, res) => {
  try {
    const departmentID = req.user.departmentID;

    const [folders] = await db.query(
      "SELECT * FROM folders WHERE departmentID = ?",
      [departmentID]
    );

    // Recursive tree builder
    const buildTree = (parentID = null) => {
      return folders
        .filter(f => f.parentFolderID === parentID)
        .map(f => ({
          ...f,
          children: buildTree(f.folderID)
        }));
    };

    res.json(buildTree());

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.renameFolder = async (req, res) => {
  try {
    const { folderID } = req.params;
    const { folderName } = req.body;
    const departmentID = req.user.departmentID;

    // Check folder exists and belongs to department
    const [folder] = await db.query(
      "SELECT * FROM folders WHERE folderID = ? AND departmentID = ?",
      [folderID, departmentID]
    );

    if (folder.length === 0) {
      return res.status(404).json({ message: "Folder not found" });
    }

    await db.query(
      "UPDATE folders SET folderName = ? WHERE folderID = ? AND departmentID = ?",
      [folderName, folderID, departmentID]
    );

    res.json({ message: "Folder renamed successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteFolder = async (req, res) => {
  try {
    const { folderID } = req.params;
    const departmentID = req.user.departmentID;

    // Check folder exists
    const [folder] = await db.query(
      "SELECT * FROM folders WHERE folderID = ? AND departmentID = ?",
      [folderID, departmentID]
    );

    if (folder.length === 0) {
      return res.status(404).json({ message: "Folder not found" });
    }

    // Check for subfolders
    const [subfolders] = await db.query(
      "SELECT * FROM folders WHERE parentFolderID = ?",
      [folderID]
    );

    if (subfolders.length > 0) {
      return res.status(400).json({
        message: "Cannot delete folder with subfolders"
      });
    }

    // Check for documents inside folder
    const [documents] = await db.query(
      "SELECT * FROM documents WHERE folderID = ? AND isDeleted = FALSE",
      [folderID]
    );

    if (documents.length > 0) {
      return res.status(400).json({
        message: "Cannot delete folder with documents"
      });
    }

    await db.query(
      "DELETE FROM folders WHERE folderID = ? AND departmentID = ?",
      [folderID, departmentID]
    );

    res.json({ message: "Folder deleted successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};