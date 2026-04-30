/**
 * Google Cloud Translation service for ELITE ELECTION.
 * Multi-language support for election content.
 */

async function translateText(text, targetLanguage, sourceLanguage = null) {
  if (process.env.ENABLE_TRANSLATION !== "true") {
    return { translatedText: text, detectedLanguage: "en", fallback: true };
  }

  try {
    const { Translate } = require("@google-cloud/translate").v2;
    const translate = new Translate({
      projectId: process.env.GOOGLE_CLOUD_PROJECT,
    });

    const options = { to: targetLanguage };
    if (sourceLanguage) options.from = sourceLanguage;

    const [translation] = await translate.translate(text, options);
    return {
      translatedText: translation,
      detectedLanguage: sourceLanguage || "auto",
      fallback: false,
    };
  } catch (error) {
    console.warn("[Translation] Service unavailable:", error.message);
    return { translatedText: text, detectedLanguage: "en", fallback: true };
  }
}

async function detectLanguage(text) {
  try {
    const { Translate } = require("@google-cloud/translate").v2;
    const translate = new Translate({
      projectId: process.env.GOOGLE_CLOUD_PROJECT,
    });
    const [detections] = await translate.detect(text);
    return Array.isArray(detections) ? detections[0] : detections;
  } catch (error) {
    console.warn("[Translation] Detection unavailable:", error.message);
    return { language: "en", confidence: 0 };
  }
}

module.exports = { translateText, detectLanguage };
