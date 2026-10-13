const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/dashboardController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/summary",        ctrl.getSummary);
router.get("/dept-absent",    ctrl.getDeptAbsent);
router.get("/dept-strength",  ctrl.getDeptStrength);
router.get("/weekly-strength",ctrl.getWeeklyStrength);
router.get("/weekly-absent",  ctrl.getWeeklyAbsent);
router.get("/turnover",       ctrl.getTurnover);
router.get("/absent-list",    ctrl.getAbsentList);
router.get("/late-in",        ctrl.getLateIn);
router.get("/punch-list",     ctrl.getPunchList);
router.get("/ot-list",        ctrl.getOTList);
router.get("/employee-list",  ctrl.getEmployeeList);
router.get("/long-absent",    ctrl.getLongAbsent);
router.get("/geo-punch",      ctrl.getGeoPunch);
router.get("/assets",         ctrl.getAssets);

module.exports = router;
