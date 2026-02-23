const express = require("express");
const router = express.Router();
const departmentController = require("../controllers/department.controller");
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");

router.post(
  "/",
  auth,
  role(["SuperAdmin"]),
  departmentController.createDepartment
);



module.exports = router;