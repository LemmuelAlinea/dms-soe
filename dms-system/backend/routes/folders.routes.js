const express = require("express");
const router = express.Router();
const folderController = require("../controllers/folder.controller");
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");
const { body } = require("express-validator");
const validate = require("../middleware/validate.middleware");

router.post(
  "/",
  auth,
  role(["Admin", "CoAdmin"]),
  body("folderName")
    .notEmpty()
    .withMessage("Folder name required")
    .isLength({ max: 255 })
    .withMessage("Folder name too long"),
  validate,
  folderController.createFolder
);

router.put(
  "/:folderID",
  auth,
  role(["Admin", "CoAdmin"]),
  body("folderName")
    .notEmpty()
    .withMessage("Folder name required")
    .isLength({ max: 255 })
    .withMessage("Folder name too long"),
  validate,
  folderController.renameFolder
);

router.delete(
  "//:folderID",
  auth,
  role(["Admin", "CoAdmin"]),
  folderController.deleteFolder
);

router.get(
  "/",
  auth,
  role(["Admin", "CoAdmin"]),
  folderController.getFolders
);

router.get(
  "/tree",
  auth,
  role(["Admin", "CoAdmin"]),
  folderController.getFolderTree
);

module.exports = router;