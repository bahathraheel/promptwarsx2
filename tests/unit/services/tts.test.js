const { synthesizeSpeech } = require("../../../src/services/tts");
const { TextToSpeechClient } = require("@google-cloud/text-to-speech");

jest.mock("@google-cloud/text-to-speech", () => {
  const mClient = {
    synthesizeSpeech: jest.fn()
  };
  return { TextToSpeechClient: jest.fn(() => mClient) };
});

describe("TTS Service", () => {
  let client;

  beforeEach(() => {
    process.env.ENABLE_TTS = "true";
    const { TextToSpeechClient } = require("@google-cloud/text-to-speech");
    client = new TextToSpeechClient();
    client.synthesizeSpeech.mockReset();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("returns fallback if ENABLE_TTS is not true", async () => {
    process.env.ENABLE_TTS = "false";
    const result = await synthesizeSpeech("Hello world");
    expect(result.fallback).toBe(true);
    expect(result.message).toMatch(/TTS disabled/);
    expect(client.synthesizeSpeech).not.toHaveBeenCalled();
  });

  it("synthesizes speech successfully", async () => {
    const mockAudioContent = Buffer.from("mock-audio-data");
    client.synthesizeSpeech.mockResolvedValue([{ audioContent: mockAudioContent }]);

    const result = await synthesizeSpeech("Welcome to the election platform");
    
    expect(client.synthesizeSpeech).toHaveBeenCalledWith(
      expect.objectContaining({
        input: { text: "Welcome to the election platform" },
        voice: expect.objectContaining({ languageCode: "en-US" })
      })
    );
    expect(result.fallback).toBe(false);
    expect(result.audioContent).toBe(mockAudioContent.toString("base64"));
    expect(result.contentType).toBe("audio/mp3");
  });

  it("synthesizes speech with custom voice", async () => {
    const mockAudioContent = Buffer.from("mock-audio-data");
    client.synthesizeSpeech.mockResolvedValue([{ audioContent: mockAudioContent }]);

    await synthesizeSpeech("Hola", "es-ES", "es-ES-Wavenet-A");
    
    expect(client.synthesizeSpeech).toHaveBeenCalledWith(
      expect.objectContaining({
        voice: expect.objectContaining({ languageCode: "es-ES", name: "es-ES-Wavenet-A" })
      })
    );
  });

  it("returns fallback when GCP service throws an error", async () => {
    client.synthesizeSpeech.mockRejectedValue(new Error("GCP Error"));
    const consoleSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

    const result = await synthesizeSpeech("Test error");

    expect(result.fallback).toBe(true);
    expect(result.message).toMatch(/TTS unavailable/);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("[TTS] Service unavailable:"),
      "GCP Error"
    );

    consoleSpy.mockRestore();
  });
});
