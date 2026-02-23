const express = require("express");
const router = express.Router();
const superadminController = require("../controllers/superadmin.controller");
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");

router.get(
  "/dashboard",
  auth,
  role(["SuperAdmin"]),
  superadminController.getSystemDashboard
);

router.get(
  "/departments",
  auth,
  role(["SuperAdmin"]),
  superadminController.getDepartments
);

router.post(
  "/departments",
  auth,
  role(["SuperAdmin"]),
  superadminController.createDepartment
);

router.put(
  "/departments/:departmentID",
  auth,
  role(["SuperAdmin"]),
  superadminController.updateDepartment
);

router.delete(
  "/departments/:departmentID",
  auth,
  role(["SuperAdmin"]),
  superadminController.deleteDepartment
);

router.get(
  "/admins",
  auth,
  role(["SuperAdmin"]),
  superadminController.getAdmins
);

router.post(
  "/admins",
  auth,
  role(["SuperAdmin"]),
  superadminController.createAdmin
);

router.delete(
  "/admins/:userID",
  auth,
  role(["SuperAdmin"]),
  superadminController.deleteAdmin
);

router.put(
  "/users/reset-password/:userID",
  auth,
  role(["SuperAdmin"]),
  superadminController.resetUserPassword
);

router.get(
  "/coadmins",
  auth,
  role(["SuperAdmin"]),
  superadminController.getAllCoAdmins
);

router.get(
  "/logs",
  auth,
  role(["SuperAdmin"]),
  superadminController.getGlobalLogs
);

router.get(
  "/analytics/advanced",
  auth,
  role(["SuperAdmin"]),
  superadminController.getAdvancedAnalytics
);

module.exports = router;