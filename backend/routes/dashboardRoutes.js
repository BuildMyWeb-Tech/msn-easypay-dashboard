const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/dashboardController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

// ── Main dashboard data (PR_GETDBOARD_DATA_01) ────────────────────────────────
router.get("/main-data",    ctrl.getMainData);    // donut + pie + empData + attend + turnover

// ── Weekly charts (PRW_GET_WEEKLYDEPTSTRENGTH) ────────────────────────────────
router.get("/weekly-data",  ctrl.getWeeklyData);  // strength + absent arrays

// ── Dept summary table (PRW_GetDeptSummary) ───────────────────────────────────
router.get("/dept-summary", ctrl.getDeptSummary); // ON Roll/Dayshift/Nightshift/Present/Absent/Present%

// ── Report accordions (SPs TBD) ───────────────────────────────────────────────
router.get("/absent-list",  ctrl.getAbsentList);
router.get("/late-in",      ctrl.getLateIn);
router.get("/punch-list",   ctrl.getPunchList);
router.get("/ot-list",      ctrl.getOTList);
router.get("/long-absent",  ctrl.getLongAbsent);

module.exports = router;
