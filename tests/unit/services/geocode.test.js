const geocodeService = require("../../../src/services/geocode");
const axios = require("axios");

jest.mock("axios");

describe("Geocode Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.GOOGLE_MAPS_API_KEY = "test-key";
    geocodeService.apiKey = "test-key";
    geocodeService.isInitialized = true;
  });

  describe("reverseGeocode", () => {
    it("returns error if service is uninitialized", async () => {
      geocodeService.isInitialized = false;
      const result = await geocodeService.reverseGeocode(37.7749, -122.4194);
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/not configured/);
    });

    it("returns error if lat or lng is missing", async () => {
      geocodeService.isInitialized = true;
      const result = await geocodeService.reverseGeocode(37.7749, undefined);
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/Latitude and longitude are required/);
    });

    it("handles non-OK status from API", async () => {
      geocodeService.isInitialized = true;
      axios.get.mockResolvedValue({ data: { status: "ZERO_RESULTS" } });

      const result = await geocodeService.reverseGeocode(0, 0);
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/Geocoding failed with status: ZERO_RESULTS/);
    });

    it("returns error if no results are found", async () => {
      geocodeService.isInitialized = true;
      axios.get.mockResolvedValue({ data: { status: "OK", results: [] } });

      const result = await geocodeService.reverseGeocode(0, 0);
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/No address found/);
    });

    it("returns formatted address on success", async () => {
      geocodeService.isInitialized = true;
      axios.get.mockResolvedValue({
        data: {
          status: "OK",
          results: [{ formatted_address: "1600 Amphitheatre Parkway, Mountain View, CA", place_id: "ChIJ2eUgeAK6j4ARbn5u_wAGqWA" }]
        }
      });

      const result = await geocodeService.reverseGeocode(37.422, -122.084);
      expect(result.success).toBe(true);
      expect(result.data.formattedAddress).toBe("1600 Amphitheatre Parkway, Mountain View, CA");
      expect(result.data.placeId).toBe("ChIJ2eUgeAK6j4ARbn5u_wAGqWA");
      
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining("latlng=37.422,-122.084")
      );
    });

    it("handles axios errors gracefully", async () => {
      geocodeService.isInitialized = true;
      axios.get.mockRejectedValue(new Error("Network Error"));
      
      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
      const result = await geocodeService.reverseGeocode(37.7749, -122.4194);

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/Failed to reverse geocode/);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
