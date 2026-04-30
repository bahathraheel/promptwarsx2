/**
 * Google Civic Information API Service
 * Fetches polling locations and voter info using the civicinfo v2 API.
 */
const { google } = require("googleapis");

class CivicService {
  constructor() {
    this.civicinfo = google.civicinfo("v2");
    this.apiKey = process.env.GOOGLE_CIVIC_API_KEY;
    this.isInitialized = !!this.apiKey;
    
    if (!this.isInitialized) {
      console.warn("[CivicService] GOOGLE_CIVIC_API_KEY not found. Civic Information service will be disabled.");
    }
  }

  /**
   * Look up voter information including polling locations by address.
   * @param {string} address The registered address of the voter
   * @param {string} [electionId] Optional specific election ID (defaults to 2000 for VIP Test, or upcoming)
   * @returns {Promise<Object>} Polling locations, early vote sites, and contests
   */
  async getVoterInfo(address, electionId = "") {
    if (!this.isInitialized) {
      return { success: false, error: "Civic Information service is not configured." };
    }
    
    if (!address) {
      return { success: false, error: "Address is required for voter info lookup." };
    }

    try {
      const params = {
        address,
        key: this.apiKey,
        returnAllAvailableData: true
      };
      
      if (electionId) {
        params.electionId = electionId;
      }

      const response = await this.civicinfo.elections.voterInfoQuery(params);
      
      return {
        success: true,
        data: {
          election: response.data.election,
          pollingLocations: response.data.pollingLocations || [],
          earlyVoteSites: response.data.earlyVoteSites || [],
          state: response.data.state || [],
          contests: response.data.contests || []
        }
      };
    } catch (error) {
      console.error("[CivicService] Voter info lookup failed:", error.message);
      return { 
        success: false, 
        error: "Failed to retrieve voting information. Please ensure the address is formatted correctly." 
      };
    }
  }

  /**
   * Get a list of upcoming elections available in the Civic Information API.
   * @returns {Promise<Object>} List of elections
   */
  async getElections() {
    if (!this.isInitialized) {
      return { success: false, error: "Civic Information service is not configured." };
    }

    try {
      const response = await this.civicinfo.elections.electionQuery({
        key: this.apiKey
      });
      
      return {
        success: true,
        data: response.data.elections || []
      };
    } catch (error) {
      console.error("[CivicService] Elections lookup failed:", error.message);
      return { success: false, error: "Failed to retrieve election lists." };
    }
  }
  
  /**
   * Lookup representative information by address (officials and offices).
   */
  async getRepresentatives(address) {
    if (!this.isInitialized) {
      return { success: false, error: "Civic Information service is not configured." };
    }

    try {
      const response = await this.civicinfo.representatives.representativeInfoByAddress({
        address,
        key: this.apiKey
      });
      
      return {
        success: true,
        data: {
          offices: response.data.offices || [],
          officials: response.data.officials || []
        }
      };
    } catch (error) {
      console.error("[CivicService] Representative lookup failed:", error.message);
      return { success: false, error: "Failed to retrieve representative information." };
    }
  }
}

// Export singleton instance
module.exports = new CivicService();
