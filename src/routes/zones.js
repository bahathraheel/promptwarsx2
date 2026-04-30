/**
 * Election zone routes for ELITE ELECTION.
 */
const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const { zoneIdValidation } = require("../middleware/validation");
const { NotFoundError } = require("../utils/errors");

function loadZones() {
  const dataPath = path.join(
    __dirname,
    "..",
    "..",
    "data",
    "election-data.json",
  );
  const raw = fs.readFileSync(dataPath, "utf8");
  return JSON.parse(raw).zones;
}

/** GET /api/zones — List all zones */
router.get("/", (req, res) => {
  const zones = loadZones();
  const summary = zones.map((z) => ({
    id: z.id,
    name: z.name,
    icon: z.icon,
    tagline: z.tagline,
  }));
  res.json({ success: true, data: summary, count: summary.length });
});

/** GET /api/zones/:id — Get a specific zone */
router.get("/:id", zoneIdValidation, (req, res, next) => {
  const zones = loadZones();
  const zone = zones.find((z) => z.id === req.params.id);
  if (!zone) return next(new NotFoundError("Zone"));
  res.json({ success: true, data: zone });
});

module.exports = router;
