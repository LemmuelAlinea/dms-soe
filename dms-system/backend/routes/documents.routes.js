const express = require("express");
const router = express.Router();
const documentController = require("../controllers/document.controller");
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");
const multer = require("multer");

// Multer storage config
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const allowedTypes = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png"
];

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("File type not allowed"));
    }
  }
});

router.post(
  "/",
  auth,
  role(["Admin", "CoAdmin"]),
  upload.single("file"),
  documentController.uploadDocument
);

router.get(
  "/search",
  auth,
  role(["Admin", "CoAdmin"]),
  documentController.searchDocuments
);


router.get(
  "/preview/:documentID",
  auth,
  role(["Admin", "CoAdmin"]),
  documentController.previewDocument
);

router.get(
  "/deleted",
  auth,
  role(["Admin", "CoAdmin"]),
  documentController.getDeletedDocuments
);

router.delete(
  "/permanent/:documentID",
  auth,
  role(["Admin", "CoAdmin"]),
  documentController.permanentDeleteDocument
);

router.get(
  "/:folderID",
  auth,
  role(["Admin", "CoAdmin"]),
  documentController.getDocumentsByFolder
);

router.delete(
  "/:documentID",
  auth,
  role(["Admin", "CoAdmin"]),
  documentController.softDeleteDocument
);

router.put(
  "/restore/:documentID",
  auth,
  role(["Admin", "CoAdmin"]),
  documentController.restoreDocument
);

router.put(
  "/version/:documentID",
  auth,
  role(["Admin", "CoAdmin"]),
  upload.single("file"),
  documentController.uploadNewVersion
);

router.get(
  "/versions/:documentID",
  auth,
  role(["Admin", "CoAdmin"]),
  documentController.getDocumentVersions
);

router.put(
  "/versions/restore/:versionID",
  auth,
  role(["Admin", "CoAdmin"]),
  documentController.restoreVersion
);

router.get(
  "/download/:documentID",
  auth,
  role(["Admin", "CoAdmin"]),
  documentController.downloadDocument
);

router.get(
  "/",
  auth,
  role(["Admin", "CoAdmin"]),
  documentController.getDocuments
);


module.exports = router;