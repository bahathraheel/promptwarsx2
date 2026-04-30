const express = require("express");
const router = express.Router();
const civicService = require("../services/civic");
const geocodeService = require("../services/geocode");
const { validateBody, validateQuery } = require("../middleware/validation");
const { verifyRecaptcha } = require("../middleware/recaptcha");
const { authLimiter } = require("../middleware/rateLimiter");
const Joi = require("joi");

// Apply basic rate limiting to civic API routes
router.use(authLimiter);

/**
 * @route GET /api/civic/elections
 * @desc Get a list of available elections from Google Civic API
 */
router.get("/elections", async (req, res) => {
  const result = await civicService.getElections();
  
  if (!result.success) {
    return res.status(503).json(result);
  }
  
  res.json(result);
});

/**
 * @route POST /api/civic/voterinfo
 * @desc Look up voter information including polling locations
 */
const voterInfoSchema = Joi.object({
  address: Joi.string().required().min(5).max(100),
  electionId: Joi.string().optional().allow("")
});

router.post("/voterinfo", verifyRecaptcha, validateBody(voterInfoSchema), async (req, res) => {
  const { address, electionId } = req.body;
  const result = await civicService.getVoterInfo(address, electionId);
  
  if (!result.success) {
    return res.status(400).json(result);
  }
  
  res.json(result);
});

/**
 * @route POST /api/civic/representatives
 * @desc Look up representative information by address
 */
const repSchema = Joi.object({
  address: Joi.string().required().min(5).max(100)
});

router.post("/representatives", verifyRecaptcha, validateBody(repSchema), async (req, res) => {
  const { address } = req.body;
  const result = await civicService.getRepresentatives(address);
  
  if (!result.success) {
    return res.status(400).json(result);
  }
  
  res.json(result);
});

/**
 * @route POST /api/civic/geocode
 * @desc Reverse geocode latitude/longitude to a formatted address
 */
const geocodeSchema = Joi.object({
  lat: Joi.number().required().min(-90).max(90),
  lng: Joi.number().required().min(-180).max(180)
});

router.post("/geocode", verifyRecaptcha, validateBody(geocodeSchema), async (req, res) => {
  const { lat, lng } = req.body;
  const result = await geocodeService.reverseGeocode(lat, lng);
  
  if (!result.success) {
    return res.status(400).json(result);
  }
  
  res.json(result);
});

module.exports = router;
