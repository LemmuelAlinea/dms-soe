const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");

/*
|--------------------------------------------------------------------------
| CREATE COADMIN (ADMIN ONLY)
|--------------------------------------------------------------------------
*/
router.post(
  "/",
  auth,
  role(["Admin"]),
  adminController.createAdmin
);

/*
|--------------------------------------------------------------------------
| GET ALL COADMINS OF ADMIN'S DEPARTMENT
|--------------------------------------------------------------------------
*/
router.get(
  "/",
  auth,
  role(["Admin"]),
  adminController.getAdmins
);

/*
|--------------------------------------------------------------------------
| DELETE COADMIN (ADMIN ONLY)
|--------------------------------------------------------------------------
*/
router.delete(
  "/:userID",
  auth,
  role(["Admin"]),
  adminController.deleteAdmin
);

module.exports = router;