/**
 * Translation routes for ELITE ELECTION.
 */
const express = require('express');
const router = express.Router();
const { translateText, detectLanguage } = require('../services/translate');
const { translateValidation } = require('../middleware/validation');

/** POST /api/translate — Translate text */
router.post('/', translateValidation, async (req, res, next) => {
  try {
    const { text, targetLanguage, sourceLanguage } = req.body;
    const result = await translateText(text, targetLanguage, sourceLanguage);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

/** POST /api/translate/detect — Detect language */
router.post('/detect', async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, error: { message: 'Text is required' } });
    }
    const result = await detectLanguage(text);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
