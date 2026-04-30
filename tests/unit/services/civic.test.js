const civicService = require("../../../src/services/civic");
const { google } = require("googleapis");

jest.mock("googleapis", () => {
  const mCivicInfo = {
    elections: {
      voterInfoQuery: jest.fn(),
      electionQuery: jest.fn()
    },
    representatives: {
      representativeInfoByAddress: jest.fn()
    }
  };
  return {
    google: {
      civicinfo: jest.fn(() => mCivicInfo)
    }
  };
});

describe("Civic Information Service", () => {
  let civicApi;

  beforeEach(() => {
    // We get the mocked instance that the service uses
    civicApi = google.civicinfo();
    jest.clearAllMocks();
  });

  describe("getVoterInfo", () => {
    it("returns error if address is missing", async () => {
      civicService.isInitialized = true;
      const result = await civicService.getVoterInfo("");
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/Address is required/);
    });

    it("returns error if service is uninitialized", async () => {
      civicService.isInitialized = false;
      const result = await civicService.getVoterInfo("123 Test St");
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/not configured/);
    });

    it("fetches voter info successfully", async () => {
      civicService.isInitialized = true;
      civicApi.elections.voterInfoQuery.mockResolvedValue({
        data: {
          election: { id: "2000" },
          pollingLocations: [{ address: { line1: "Test Location" } }]
        }
      });

      const result = await civicService.getVoterInfo("123 Main St", "2000");

      expect(result.success).toBe(true);
      expect(result.data.pollingLocations[0].address.line1).toBe("Test Location");
      expect(civicApi.elections.voterInfoQuery).toHaveBeenCalledWith(
        expect.objectContaining({ address: "123 Main St", electionId: "2000" })
      );
    });

    it("handles API errors gracefully", async () => {
      civicService.isInitialized = true;
      civicApi.elections.voterInfoQuery.mockRejectedValue(new Error("API Error"));

      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
      const result = await civicService.getVoterInfo("Bad Address");

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/Failed to retrieve/);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe("getElections", () => {
    it("fetches elections successfully", async () => {
      civicService.isInitialized = true;
      civicApi.elections.electionQuery.mockResolvedValue({
        data: { elections: [{ id: "2000", name: "VIP Test Election" }] }
      });

      const result = await civicService.getElections();

      expect(result.success).toBe(true);
      expect(result.data[0].name).toBe("VIP Test Election");
    });
    
    it("handles errors gracefully", async () => {
      civicService.isInitialized = true;
      civicApi.elections.electionQuery.mockRejectedValue(new Error("API Error"));
      
      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
      const result = await civicService.getElections();

      expect(result.success).toBe(false);
      consoleSpy.mockRestore();
    });
  });

  describe("getRepresentatives", () => {
    it("fetches representatives successfully", async () => {
      civicService.isInitialized = true;
      civicApi.representatives.representativeInfoByAddress.mockResolvedValue({
        data: { offices: [], officials: [{ name: "John Doe" }] }
      });

      const result = await civicService.getRepresentatives("123 Main St");

      expect(result.success).toBe(true);
      expect(result.data.officials[0].name).toBe("John Doe");
    });
    
    it("handles errors gracefully", async () => {
      civicService.isInitialized = true;
      civicApi.representatives.representativeInfoByAddress.mockRejectedValue(new Error("API Error"));
      
      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
      const result = await civicService.getRepresentatives("123 Main St");

      expect(result.success).toBe(false);
      consoleSpy.mockRestore();
    });
  });
});
