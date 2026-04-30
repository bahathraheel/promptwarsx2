const { analyzeSentiment, analyzeEntities } = require("../../../src/services/nlp");
const { LanguageServiceClient } = require("@google-cloud/language");

jest.mock("@google-cloud/language", () => {
  const mClient = {
    analyzeSentiment: jest.fn(),
    analyzeEntities: jest.fn()
  };
  return { LanguageServiceClient: jest.fn(() => mClient) };
});

describe("NLP Service", () => {
  let client;

  beforeEach(() => {
    process.env.ENABLE_NLP = "true";
    const { LanguageServiceClient } = require("@google-cloud/language");
    client = new LanguageServiceClient();
    client.analyzeSentiment.mockReset();
    client.analyzeEntities.mockReset();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("analyzeSentiment", () => {
    it("returns fallback if ENABLE_NLP is not true", async () => {
      process.env.ENABLE_NLP = "false";
      const result = await analyzeSentiment("Hello world");
      expect(result.fallback).toBe(true);
      expect(result.score).toBe(0);
      expect(result.magnitude).toBe(0);
      expect(client.analyzeSentiment).not.toHaveBeenCalled();
    });

    it("analyzes sentiment successfully", async () => {
      client.analyzeSentiment.mockResolvedValue([{
        documentSentiment: { score: 0.8, magnitude: 0.9 }
      }]);

      const result = await analyzeSentiment("I love this election platform!");
      
      expect(client.analyzeSentiment).toHaveBeenCalledWith({
        document: { content: "I love this election platform!", type: "PLAIN_TEXT" }
      });
      expect(result.fallback).toBe(false);
      expect(result.score).toBe(0.8);
      expect(result.magnitude).toBe(0.9);
    });

    it("returns fallback when GCP service throws an error", async () => {
      client.analyzeSentiment.mockRejectedValue(new Error("API Error"));
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

      const result = await analyzeSentiment("Test error");

      expect(result.fallback).toBe(true);
      expect(result.score).toBe(0);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("[NLP] Service unavailable:"),
        "API Error"
      );

      consoleSpy.mockRestore();
    });
  });

  describe("analyzeEntities", () => {
    it("returns fallback if ENABLE_NLP is not true", async () => {
      process.env.ENABLE_NLP = "false";
      const result = await analyzeEntities("Hello world");
      expect(result.fallback).toBe(true);
      expect(result.entities).toEqual([]);
      expect(client.analyzeEntities).not.toHaveBeenCalled();
    });

    it("analyzes entities successfully", async () => {
      client.analyzeEntities.mockResolvedValue([{
        entities: [
          { name: "George Washington", type: "PERSON", salience: 0.9 },
          { name: "White House", type: "LOCATION", salience: 0.8 }
        ]
      }]);

      const result = await analyzeEntities("George Washington lived in the White House");
      
      expect(client.analyzeEntities).toHaveBeenCalledWith({
        document: { content: "George Washington lived in the White House", type: "PLAIN_TEXT" }
      });
      expect(result.fallback).toBe(false);
      expect(result.entities.length).toBe(2);
      expect(result.entities[0].name).toBe("George Washington");
      expect(result.entities[0].type).toBe("PERSON");
    });

    it("returns fallback when GCP service throws an error", async () => {
      client.analyzeEntities.mockRejectedValue(new Error("API Error"));
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

      const result = await analyzeEntities("Test error");

      expect(result.fallback).toBe(true);
      expect(result.entities).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("[NLP] Entity analysis unavailable:"),
        "API Error"
      );

      consoleSpy.mockRestore();
    });
  });
});
