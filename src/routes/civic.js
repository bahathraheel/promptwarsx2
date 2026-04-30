/**
 * Google Civic Information API routes for ELITE ELECTION.
 * Provides voter info, elections list, representatives, and geocoding.
 */

const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const civicService = require("../services/civic");
const geocodeService = require("../services/geocode");
const { verifyRecaptcha } = require("../middleware/recaptcha");
const { apiLimiter } = require("../middleware/rateLimiter");

// Rate limit all civic routes
router.use(apiLimiter);

/** Reusable validation error handler */
function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid input",
        details: errors.array().map((e) => ({ field: e.path, message: e.msg })),
      },
    });
  }
  return null;
}

/**
 * GET /api/civic/elections
 * Returns list of upcoming elections from Google Civic API.
 */
router.get("/elections", async (req, res) => {
  const result = await civicService.getElections();
  if (!result.success) return res.status(503).json(result);
  res.json(result);
});

/**
 * POST /api/civic/voterinfo
 * Returns polling locations and voter info for a given address.
 */
router.post(
  "/voterinfo",
  verifyRecaptcha,
  [
    body("address")
      .isString().withMessage("Address must be a string")
      .trim()
      .isLength({ min: 5, max: 200 }).withMessage("Address must be 5-200 characters"),
    body("electionId").optional().isString().isLength({ max: 20 }),
  ],
  async (req, res) => {
    const invalid = handleValidation(req, res);
    if (invalid) return;
    const { address, electionId } = req.body;
    const result = await civicService.getVoterInfo(address, electionId);
    if (!result.success) return res.status(400).json(result);
    res.json(result);
  }
);

/**
 * POST /api/civic/representatives
 * Returns elected officials for a given address.
 */
router.post(
  "/representatives",
  verifyRecaptcha,
  [
    body("address")
      .isString().withMessage("Address must be a string")
      .trim()
      .isLength({ min: 5, max: 200 }).withMessage("Address must be 5-200 characters"),
  ],
  async (req, res) => {
    const invalid = handleValidation(req, res);
    if (invalid) return;
    const { address } = req.body;
    const result = await civicService.getRepresentatives(address);
    if (!result.success) return res.status(400).json(result);
    res.json(result);
  }
);

/**
 * POST /api/civic/geocode
 * Reverse geocode lat/lng into a formatted street address.
 */
router.post(
  "/geocode",
  verifyRecaptcha,
  [
    body("lat").isFloat({ min: -90, max: 90 }).withMessage("lat must be between -90 and 90"),
    body("lng").isFloat({ min: -180, max: 180 }).withMessage("lng must be between -180 and 180"),
  ],
  async (req, res) => {
    const invalid = handleValidation(req, res);
    if (invalid) return;
    const { lat, lng } = req.body;
    const result = await geocodeService.reverseGeocode(lat, lng);
    if (!result.success) return res.status(400).json(result);
    res.json(result);
  }
);

module.exports = router;
