/**
 * Google Cloud Natural Language service for ELITE ELECTION.
 * Sentiment analysis on user questions.
 */

async function analyzeSentiment(text) {
  if (process.env.ENABLE_NLP !== 'true') {
    return { score: 0, magnitude: 0, fallback: true };
  }

  try {
    const language = require('@google-cloud/language');
    const client = new language.LanguageServiceClient();

    const [result] = await client.analyzeSentiment({
      document: { content: text, type: 'PLAIN_TEXT' }
    });

    const sentiment = result.documentSentiment;
    return {
      score: sentiment.score,
      magnitude: sentiment.magnitude,
      fallback: false
    };
  } catch (error) {
    console.warn('[NLP] Service unavailable:', error.message);
    return { score: 0, magnitude: 0, fallback: true };
  }
}

async function analyzeEntities(text) {
  if (process.env.ENABLE_NLP !== 'true') {
    return { entities: [], fallback: true };
  }

  try {
    const language = require('@google-cloud/language');
    const client = new language.LanguageServiceClient();

    const [result] = await client.analyzeEntities({
      document: { content: text, type: 'PLAIN_TEXT' }
    });

    return {
      entities: result.entities.map(e => ({
        name: e.name,
        type: e.type,
        salience: e.salience
      })),
      fallback: false
    };
  } catch (error) {
    console.warn('[NLP] Entity analysis unavailable:', error.message);
    return { entities: [], fallback: true };
  }
}

module.exports = { analyzeSentiment, analyzeEntities };
