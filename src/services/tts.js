/**
 * Google Cloud Text-to-Speech service for ELITE ELECTION.
 * Converts assistant text responses to audio.
 */

async function synthesizeSpeech(
  text,
  languageCode = "en-IN",
  voiceName = null,
) {
  if (process.env.ENABLE_TTS !== "true") {
    return {
      fallback: true,
      message: "TTS disabled, use browser SpeechSynthesis",
    };
  }

  try {
    const textToSpeech = require("@google-cloud/text-to-speech");
    const client = new textToSpeech.TextToSpeechClient();

    const request = {
      input: { text },
      voice: {
        languageCode,
        name: voiceName || undefined,
        ssmlGender: "NEUTRAL",
      },
      audioConfig: {
        audioEncoding: "MP3",
        speakingRate: 1.0,
        pitch: 0.0,
        effectsProfileId: ["headphone-class-device"],
      },
    };

    const [response] = await client.synthesizeSpeech(request);
    return {
      audioContent: response.audioContent.toString("base64"),
      contentType: "audio/mp3",
      fallback: false,
    };
  } catch (error) {
    console.warn("[TTS] Service unavailable:", error.message);
    return {
      fallback: true,
      message: "TTS unavailable, use browser SpeechSynthesis",
    };
  }
}

module.exports = { synthesizeSpeech };
