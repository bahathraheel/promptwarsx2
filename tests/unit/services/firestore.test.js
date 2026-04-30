const { getFirestore, getDocument, setDocument, queryCollection, logAnalytics } = require("../../../src/services/firestore");
const { Firestore } = require("@google-cloud/firestore");

jest.mock("@google-cloud/firestore", () => {
  const mDoc = {
    get: jest.fn(),
    set: jest.fn()
  };
  const mCollection = {
    doc: jest.fn(() => mDoc),
    where: jest.fn().mockReturnThis(),
    get: jest.fn()
  };
  const mFirestore = {
    collection: jest.fn(() => mCollection)
  };
  return { Firestore: jest.fn(() => mFirestore) };
});

describe("Firestore Service", () => {
  let db;

  beforeEach(() => {
    process.env.ENABLE_FIRESTORE = "true";
    // Force reset of singleton for testing
    jest.resetModules();
    const firestoreService = require("../../../src/services/firestore");
    
    const { Firestore } = require("@google-cloud/firestore");
    db = new Firestore();
    
    // reset mocks inside db
    db.collection().doc().get.mockReset();
    db.collection().doc().set.mockReset();
    db.collection().where().get.mockReset();
    db.collection.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getFirestore", () => {
    it("returns null if ENABLE_FIRESTORE is not true", () => {
      const { getFirestore } = require("../../../src/services/firestore");
      process.env.ENABLE_FIRESTORE = "false";
      expect(getFirestore()).toBeNull();
    });

    it("returns db instance", () => {
      const { getFirestore } = require("../../../src/services/firestore");
      process.env.ENABLE_FIRESTORE = "true";
      const instance = getFirestore();
      expect(instance).toBeDefined();
    });
  });

  describe("getDocument", () => {
    it("returns null if firestore is disabled", async () => {
      const { getDocument } = require("../../../src/services/firestore");
      process.env.ENABLE_FIRESTORE = "false";
      const result = await getDocument("users", "123");
      expect(result).toBeNull();
    });

    it("returns document data if exists", async () => {
      const { getDocument } = require("../../../src/services/firestore");
      process.env.ENABLE_FIRESTORE = "true";
      
      db.collection().doc().get.mockResolvedValue({
        exists: true,
        id: "123",
        data: () => ({ name: "Test" })
      });

      const result = await getDocument("users", "123");
      
      expect(result.id).toBe("123");
      expect(result.name).toBe("Test");
    });

    it("returns null if document does not exist", async () => {
      const { getDocument } = require("../../../src/services/firestore");
      process.env.ENABLE_FIRESTORE = "true";
      
      db.collection().doc().get.mockResolvedValue({ exists: false });

      const result = await getDocument("users", "123");
      expect(result).toBeNull();
    });

    it("handles errors gracefully", async () => {
      const { getDocument } = require("../../../src/services/firestore");
      process.env.ENABLE_FIRESTORE = "true";
      
      db.collection().doc().get.mockRejectedValue(new Error("DB Error"));
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

      const result = await getDocument("users", "123");
      
      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe("setDocument", () => {
    it("returns false if firestore is disabled", async () => {
      const { setDocument } = require("../../../src/services/firestore");
      process.env.ENABLE_FIRESTORE = "false";
      const result = await setDocument("users", "123", {});
      expect(result).toBe(false);
    });

    it("sets document data successfully", async () => {
      const { setDocument } = require("../../../src/services/firestore");
      process.env.ENABLE_FIRESTORE = "true";
      
      db.collection().doc().set.mockResolvedValue();

      const result = await setDocument("users", "123", { name: "Test" });
      
      expect(result).toBe(true);
      expect(db.collection().doc().set).toHaveBeenCalledWith({ name: "Test" }, { merge: true });
    });

    it("handles errors gracefully", async () => {
      const { setDocument } = require("../../../src/services/firestore");
      process.env.ENABLE_FIRESTORE = "true";
      
      db.collection().doc().set.mockRejectedValue(new Error("DB Error"));
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

      const result = await setDocument("users", "123", {});
      
      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe("queryCollection", () => {
    it("returns empty array if firestore is disabled", async () => {
      const { queryCollection } = require("../../../src/services/firestore");
      process.env.ENABLE_FIRESTORE = "false";
      const result = await queryCollection("users", "age", "==", 20);
      expect(result).toEqual([]);
    });

    it("queries collection successfully", async () => {
      const { queryCollection } = require("../../../src/services/firestore");
      process.env.ENABLE_FIRESTORE = "true";
      
      db.collection().where().get.mockResolvedValue({
        docs: [
          { id: "1", data: () => ({ name: "Alice" }) },
          { id: "2", data: () => ({ name: "Bob" }) }
        ]
      });

      const result = await queryCollection("users", "age", ">", 18);
      
      expect(result.length).toBe(2);
      expect(result[0].name).toBe("Alice");
    });

    it("handles errors gracefully", async () => {
      const { queryCollection } = require("../../../src/services/firestore");
      process.env.ENABLE_FIRESTORE = "true";
      
      db.collection().where().get.mockRejectedValue(new Error("DB Error"));
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

      const result = await queryCollection("users", "age", "==", 20);
      
      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe("logAnalytics", () => {
    it("logs analytics using setDocument", async () => {
      const { logAnalytics } = require("../../../src/services/firestore");
      process.env.ENABLE_FIRESTORE = "true";
      
      db.collection().doc().set.mockResolvedValue();

      const result = await logAnalytics("TEST_EVENT", { foo: "bar" });
      
      expect(result).toBe(true);
      expect(db.collection).toHaveBeenCalledWith("analytics");
      expect(db.collection().doc().set).toHaveBeenCalledWith(
        expect.objectContaining({ event: "TEST_EVENT", foo: "bar", timestamp: expect.any(String) }),
        { merge: true }
      );
    });
  });
});
