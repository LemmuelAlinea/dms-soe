const express = require("express");
const router = express.Router();
const logsController = require("../controllers/logs.controller");
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");


router.get(
  "/",
  auth,
  role(["Admin", "CoAdmin"]),
  logsController.getLogs
);

module.exports = router;