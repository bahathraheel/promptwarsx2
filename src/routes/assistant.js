/**
 * AI Assistant routes for ELITE ELECTION.
 * Handles AI Q&A, TTS, sentiment analysis, follow-ups, and proactive tips.
 */
const express = require("express");
const router = express.Router();
const {
  askAssistant,
  getProactiveTip,
  generateFollowUps,
  classifyIntent,
} = require("../services/gemini");
const { synthesizeSpeech } = require("../services/tts");
const { analyzeSentiment } = require("../services/nlp");
const { translateText } = require("../services/translate");
const {
  askValidation,
  ttsValidation,
  sentimentValidation,
} = require("../middleware/validation");
const { assistantLimiter, ttsLimiter } = require("../middleware/rateLimiter");
const { sanitizeQuestion } = require("../utils/sanitizer");

/** POST /api/assistant/ask — Ask the AI assistant */
router.post("/ask", assistantLimiter, askValidation, async (req, res, next) => {
  try {
    const question = sanitizeQuestion(req.body.question);
    const { zoneId, language, conversationHistory } = req.body;

    const [aiResponse, sentiment] = await Promise.all([
      askAssistant(
        question,
        zoneId,
        language || "en",
        conversationHistory || [],
      ),
      analyzeSentiment(question).catch(() => ({
        score: 0,
        magnitude: 0,
        fallback: true,
      })),
    ]);

    // Auto-translate if language is not English
    let translatedAnswer = aiResponse.answer;
    if (language && language !== "en") {
      try {
        const translated = await translateText(
          aiResponse.answer,
          language,
          "en",
        );
        if (!translated.fallback) {
          translatedAnswer = translated.translatedText;
        }
      } catch (e) {
        /* keep original */
      }
    }

    res.json({
      success: true,
      data: {
        answer: translatedAnswer,
        originalAnswer:
          language && language !== "en" ? aiResponse.answer : undefined,
        zone: aiResponse.zone,
        model: aiResponse.model,
        intent: aiResponse.intent,
        confidence: aiResponse.confidence,
        followUps: aiResponse.followUps || [],
        sentiment: {
          score: sentiment.score,
          magnitude: sentiment.magnitude,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

/** POST /api/assistant/tts — Convert text to speech */
router.post("/tts", ttsLimiter, ttsValidation, async (req, res, next) => {
  try {
    const { text, languageCode } = req.body;
    const result = await synthesizeSpeech(text, languageCode || "en-IN");

    if (result.fallback) {
      return res.json({
        success: true,
        data: { fallback: true, message: result.message },
      });
    }

    res.json({
      success: true,
      data: {
        audioContent: result.audioContent,
        contentType: result.contentType,
        fallback: false,
      },
    });
  } catch (error) {
    next(error);
  }
});

/** POST /api/assistant/sentiment — Analyze text sentiment */
router.post("/sentiment", sentimentValidation, async (req, res, next) => {
  try {
    const result = await analyzeSentiment(req.body.text);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

/** GET /api/assistant/tip/:zoneId — Get proactive tip for current zone */
router.get("/tip/:zoneId", (req, res) => {
  const tip = getProactiveTip(req.params.zoneId);
  res.json({ success: true, data: { tip, zone: req.params.zoneId } });
});

/** POST /api/assistant/follow-ups — Get smart follow-up suggestions */
router.post("/follow-ups", (req, res) => {
  const { question, zoneId } = req.body;
  if (!question) {
    return res
      .status(400)
      .json({ success: false, error: { message: "Question is required" } });
  }
  const { loadElectionData } = require("../services/gemini");
  const data = loadElectionData();
  const followUps = generateFollowUps(question, zoneId, data);
  const intent = classifyIntent(question);
  res.json({ success: true, data: { followUps, intent } });
});

module.exports = router;
