/**
 * Input validation schemas for ELITE ELECTION.
 */

const { body, param, query, validationResult } = require("express-validator");

/** Middleware to check validation results */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid input",
        details: errors.array().map((e) => ({
          field: e.path,
          message: e.msg,
        })),
      },
    });
  }
  next();
}

/** Validation for assistant ask endpoint */
const askValidation = [
  body("question")
    .isString()
    .withMessage("Question must be a string")
    .trim()
    .isLength({ min: 2, max: 500 })
    .withMessage("Question must be 2-500 characters")
    .escape(),
  body("zoneId")
    .optional()
    .isString()
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage("Invalid zone ID format"),
  body("language")
    .optional()
    .isString()
    .isLength({ min: 2, max: 10 })
    .withMessage("Language code must be 2-10 characters"),
  validate,
];

/** Validation for translation endpoint */
const translateValidation = [
  body("text")
    .isString()
    .withMessage("Text must be a string")
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage("Text must be 1-2000 characters"),
  body("targetLanguage")
    .isString()
    .withMessage("Target language is required")
    .isLength({ min: 2, max: 10 }),
  body("sourceLanguage").optional().isString().isLength({ min: 2, max: 10 }),
  validate,
];

/** Validation for TTS endpoint */
const ttsValidation = [
  body("text")
    .isString()
    .withMessage("Text must be a string")
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage("Text must be 1-1000 characters"),
  body("languageCode")
    .optional()
    .isString()
    .matches(/^[a-z]{2}(-[A-Z]{2})?$/)
    .withMessage("Invalid language code"),
  validate,
];

/** Validation for zone ID param */
const zoneIdValidation = [
  param("id")
    .isString()
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage("Invalid zone ID"),
  validate,
];

/** Validation for checks POST */
const checkValidation = [
  body("service").optional().isString().isLength({ max: 100 }),
  body("status")
    .optional()
    .isString()
    .isIn(["ok", "error", "warning", "unknown"]),
  validate,
];

/** Validation for sentiment analysis */
const sentimentValidation = [
  body("text")
    .isString()
    .withMessage("Text must be a string")
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage("Text must be 1-1000 characters"),
  validate,
];

module.exports = {
  validate,
  askValidation,
  translateValidation,
  ttsValidation,
  zoneIdValidation,
  checkValidation,
  sentimentValidation,
};
