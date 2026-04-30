/**
 * Google Maps Geocoding API Service
 * Converts coordinates to addresses for the Civic Information API.
 */
const axios = require("axios");

class GeocodeService {
  constructor() {
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_CIVIC_API_KEY;
    this.isInitialized = !!this.apiKey;
    
    if (!this.isInitialized) {
      console.warn("[GeocodeService] API Key not found. Geocoding service will be disabled.");
    }
  }

  /**
   * Reverse geocode latitude and longitude to get a formatted address.
   * @param {number} lat Latitude
   * @param {number} lng Longitude
   * @returns {Promise<Object>} Formatted address string
   */
  async reverseGeocode(lat, lng) {
    if (!this.isInitialized) {
      return { success: false, error: "Geocoding service is not configured." };
    }
    
    if (lat === undefined || lng === undefined) {
      return { success: false, error: "Latitude and longitude are required." };
    }

    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${this.apiKey}`;
      const response = await axios.get(url);
      
      if (response.data.status !== "OK") {
        return { 
          success: false, 
          error: `Geocoding failed with status: ${response.data.status}` 
        };
      }

      const results = response.data.results;
      if (results && results.length > 0) {
        return {
          success: true,
          data: {
            formattedAddress: results[0].formatted_address,
            placeId: results[0].place_id
          }
        };
      }
      
      return { success: false, error: "No address found for these coordinates." };
    } catch (error) {
      console.error("[GeocodeService] Reverse geocoding failed:", error.message);
      return { 
        success: false, 
        error: "Failed to reverse geocode coordinates." 
      };
    }
  }
}

module.exports = new GeocodeService();
