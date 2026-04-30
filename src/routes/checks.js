/**
 * Checks history routes for ELITE ELECTION.
 */
const express = require("express");
const router = express.Router();
const { readChecks, addCheck, clearChecks } = require("../utils/checksStore");
const { checkValidation } = require("../middleware/validation");

/** GET /api/checks — Read last 10 checks */
router.get("/", (req, res) => {
  const data = readChecks();
  res.json({ success: true, data });
});

/** POST /api/checks — Add a new check */
router.post("/", checkValidation, (req, res) => {
  const entry = addCheck({
    service: req.body.service || "manual",
    status: req.body.status || "ok",
    responseTime: req.body.responseTime || null,
    details: req.body.details || null,
    success: req.body.success !== undefined ? req.body.success : true,
  });
  res.status(201).json({ success: true, data: entry });
});

/** DELETE /api/checks — Clear all checks */
router.delete("/", (req, res) => {
  clearChecks();
  res.json({ success: true, message: "All checks cleared" });
});

module.exports = router;
