const { translateText, detectLanguage } = require("../../../src/services/translate");
const { Translate } = require("@google-cloud/translate").v2;

jest.mock("@google-cloud/translate", () => {
  const mTranslate = {
    translate: jest.fn(),
    detect: jest.fn()
  };
  return {
    v2: {
      Translate: jest.fn(() => mTranslate)
    }
  };
});

describe("Translation Service", () => {
  let translateClient;

  beforeEach(() => {
    process.env.ENABLE_TRANSLATION = "true";
    process.env.GOOGLE_CLOUD_PROJECT = "test-project";
    
    const { Translate } = require("@google-cloud/translate").v2;
    translateClient = new Translate();
    translateClient.translate.mockReset();
    translateClient.detect.mockReset();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("translateText", () => {
    it("returns fallback if ENABLE_TRANSLATION is not true", async () => {
      process.env.ENABLE_TRANSLATION = "false";
      const result = await translateText("Hello", "es");
      expect(result.fallback).toBe(true);
      expect(result.translatedText).toBe("Hello");
      expect(translateClient.translate).not.toHaveBeenCalled();
    });

    it("translates text successfully", async () => {
      translateClient.translate.mockResolvedValue(["Hola"]);

      const result = await translateText("Hello", "es");
      
      expect(translateClient.translate).toHaveBeenCalledWith("Hello", { to: "es" });
      expect(result.fallback).toBe(false);
      expect(result.translatedText).toBe("Hola");
      expect(result.detectedLanguage).toBe("auto");
    });

    it("translates text with source language specified", async () => {
      translateClient.translate.mockResolvedValue(["Bonjour"]);

      const result = await translateText("Hello", "fr", "en");
      
      expect(translateClient.translate).toHaveBeenCalledWith("Hello", { to: "fr", from: "en" });
      expect(result.fallback).toBe(false);
      expect(result.translatedText).toBe("Bonjour");
      expect(result.detectedLanguage).toBe("en");
    });

    it("returns fallback when GCP service throws an error", async () => {
      translateClient.translate.mockRejectedValue(new Error("API Error"));
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

      const result = await translateText("Hello", "es");

      expect(result.fallback).toBe(true);
      expect(result.translatedText).toBe("Hello");
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("[Translation] Service unavailable:"),
        "API Error"
      );

      consoleSpy.mockRestore();
    });
  });

  describe("detectLanguage", () => {
    it("detects language successfully (array response)", async () => {
      translateClient.detect.mockResolvedValue([[{ language: "es", confidence: 1 }]]);

      const result = await detectLanguage("Hola mundo");
      
      expect(translateClient.detect).toHaveBeenCalledWith("Hola mundo");
      expect(result.language).toBe("es");
      expect(result.confidence).toBe(1);
    });

    it("detects language successfully (single object response)", async () => {
      translateClient.detect.mockResolvedValue([{ language: "fr", confidence: 0.9 }]);

      const result = await detectLanguage("Bonjour le monde");
      
      expect(result.language).toBe("fr");
      expect(result.confidence).toBe(0.9);
    });

    it("returns fallback en when GCP service throws an error", async () => {
      translateClient.detect.mockRejectedValue(new Error("API Error"));
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

      const result = await detectLanguage("Unrecognizable");

      expect(result.language).toBe("en");
      expect(result.confidence).toBe(0);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("[Translation] Detection unavailable:"),
        "API Error"
      );

      consoleSpy.mockRestore();
    });
  });
});
