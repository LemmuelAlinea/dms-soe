const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analytics.controller");
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");

router.get(
  "/storage",
  auth,
  role(["Admin", "CoAdmin"]),
  analyticsController.getStorageAnalytics
);

router.get(
  "/dashboard",
  auth,
  role(["Admin", "CoAdmin"]),
  analyticsController.getDashboardSummary
);

module.exports = router;