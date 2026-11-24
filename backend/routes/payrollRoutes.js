const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/payrollController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/dashboard", ctrl.getPayrollDashboard);

module.exports = router;
