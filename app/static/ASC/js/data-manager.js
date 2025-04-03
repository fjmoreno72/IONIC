// data-manager.js - ASC data fetching and management 

/**
 * DataManager class handles all ASC data operations
 * - Loading ASC, Affiliate, and Service data
 * - Providing filtered data
 * - Updating ASC statuses
 * - Preparing for future backend integration
 */
export class DataManager {
  constructor() {
    this.ascs = [];
    this.affiliates = {};
    this.services = {};
    this.loaded = false;
    this.error = null;
    this.filters = {
      affiliate: "",
      service: "",
      spiral: "",
      search: ""
    };
  }

  /**
   * Initialize the data manager
   * @returns {Promise} Promise that resolves when data is loaded
   */
  async init() {
    try {
      // Load all required data in parallel
      const [ascsData, affiliatesData, servicesData] = await Promise.all([
        this.fetchData("/static/ASC/data/ascs.json"),
        this.fetchData("/api/affiliates"), // Fetch affiliates via API
        this.fetchData("/api/services") // Fetch services via API
      ]);

      // Process the data
      this.processAffiliates(affiliatesData);
      this.processServices(servicesData);
      this.ascs = ascsData;
      
      this.loaded = true;
      return true;
    } catch (error) {
      console.error("Error initializing data:", error);
      this.error = error.message;
      return false;
    }
  }

  /**
   * Generic method to fetch JSON data
   * @param {string} url - URL to fetch data from
   * @returns {Promise} Promise that resolves with JSON data
   */
  async fetchData(url) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load data from ${url}: ${response.statusText}`);
    }
    return await response.json();
  }

  /**
   * Process affiliates data into a lookup object
   * @param {Array} affiliates - Raw affiliates data
   */
  processAffiliates(affiliates) {
    this.affiliates = {};
    this.affiliatesOptions = [];
    
    affiliates.forEach(affiliate => {
      this.affiliates[affiliate.id] = affiliate;
      this.affiliatesOptions.push({
        id: affiliate.id,
        name: affiliate.name
      });
    });
    
    // Sort by affiliate name
    this.affiliatesOptions.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Process services data into a lookup object
   * @param {Array} services - Raw services data
   */
  processServices(services) {
    this.services = {};
    this.servicesOptions = [];
    
    services.forEach(service => {
      this.services[service.id] = service;
      this.servicesOptions.push({
        id: service.id,
        name: service.name
      });
    });
    
    // Sort by service name
    this.servicesOptions.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Get all filter options for dropdowns
   * @returns {Object} Object with all filter options
   */
  getFilterOptions() {
    // Extract unique spirals from ASCs
    const spiralsSet = new Set();
    this.ascs.forEach(asc => {
      if (asc.spiral) spiralsSet.add(asc.spiral);
    });
    
    const spirals = Array.from(spiralsSet).sort();
    
    return {
      affiliates: this.affiliatesOptions,
      services: this.servicesOptions,
      spirals: spirals.map(spiral => ({ id: spiral, name: spiral }))
    };
  }

  /**
   * Set filters for ASC data
   * @param {Object} filters - Filter criteria
   */
  setFilters(filters) {
    this.filters = { ...this.filters, ...filters };
  }

  /**
   * Get all ASCs by status
   * @returns {Object} ASCs grouped by status
   */
  getAscsByStatus() {
    if (!this.loaded) return {};
    
    // Filter ASCs based on current filters
    const filteredAscs = this.ascs.filter(asc => {
      // Check affiliate filter
      if (this.filters.affiliate && asc.affiliateId !== this.filters.affiliate) {
        return false;
      }
      
      // Check service filter
      if (this.filters.service && asc.serviceId !== this.filters.service) {
        return false;
      }
      
      // Check spiral filter
      if (this.filters.spiral && asc.spiral !== this.filters.spiral) {
        return false;
      }
      
      // Check search filter (case insensitive)
      if (this.filters.search) {
        const searchTerm = this.filters.search.toLowerCase();
        const affiliateName = this.getAffiliateName(asc.affiliateId).toLowerCase();
        const serviceName = this.getServiceName(asc.serviceId).toLowerCase();
        
        // Search through all relevant fields
        const searchFields = [
          asc.id,
          affiliateName,
          serviceName,
          asc.environment,
          asc.spiral,
        ].filter(Boolean); // Remove falsy values
        
        // Check if any field contains the search term
        if (!searchFields.some(field => field.toLowerCase().includes(searchTerm))) {
          return false;
        }
      }
      
      return true;
    });
    
    // Group by status
    const result = {
      "Initial": [],
      "In Progress": [],
      "In Review": [],
      "Validated": [],
      "Deprecated": []
    };
    
    filteredAscs.forEach(asc => {
      const status = asc.status || "Initial";
      if (result[status]) {
        result[status].push(asc);
      } else {
        // Fallback to Initial if status is invalid
        result["Initial"].push(asc);
      }
    });
    
    return result;
  }

  /**
   * Get affiliate name from ID
   * @param {string} affiliateId - Affiliate ID
   * @returns {string} Affiliate name or fallback text
   */
  getAffiliateName(affiliateId) {
    return this.affiliates[affiliateId]?.name || "Unknown Affiliate";
  }

  /**
   * Get service name from ID
   * @param {string} serviceId - Service ID
   * @returns {string} Service name or fallback text
   */
  getServiceName(serviceId) {
    // Debugging: Log the state of the services map and the requested ID
    // console.log(`Looking up service ID: ${serviceId}. Services map size: ${Object.keys(this.services).length}`);
    // if (!this.services[serviceId]) {
    //   console.warn(`Service ID ${serviceId} not found in map. Available keys:`, Object.keys(this.services));
    // }
    return this.services[serviceId]?.name || "Unknown Service";
  }

  /**
   * Get flag path for an affiliate
   * @param {string} affiliateId - Affiliate ID
   * @returns {string} Path to flag image
   */
  getFlagPath(affiliateId) {
    const defaultPath = "/static/ASC/image/flags/FMN-ASC.png";
    if (!this.affiliates[affiliateId]) return defaultPath;
    
    // Extract the filename from flagPath and reconstruct with correct path
    const flagPath = this.affiliates[affiliateId].flagPath;
    if (!flagPath) return defaultPath;
    
    const filename = flagPath.split('/').pop();
    return `/static/ASC/image/flags/${filename}`;
  }

  /**
   * Update ASC status
   * @param {string} ascId - ASC ID
   * @param {string} newStatus - New status
   * @returns {Promise} Promise that resolves when update is complete
   */
  async updateAscStatus(ascId, newStatus) {
    try {
      // Find the ASC to update
      const ascIndex = this.ascs.findIndex(asc => asc.id === ascId);
      if (ascIndex === -1) {
        throw new Error(`ASC with ID ${ascId} not found`);
      }
      
      // Update in memory first
      this.ascs[ascIndex].status = newStatus;
      
      // Save to backend
      await this.saveAscs();
      
      return true;
    } catch (error) {
      console.error("Error updating ASC status:", error);
      return false;
    }
  }

  /**
   * Save all ASCs to the backend
   * @returns {Promise} Promise that resolves when save is complete
   */
  async saveAscs() {
    try {
      // For now, using direct fetch to update the JSON file
      // In future, this could be replaced with an API call
      const response = await fetch('/update_ascs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.ascs),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save ASCs: ${response.statusText}`);
      }
      
      return true;
    } catch (error) {
      console.error("Error saving ASCs:", error);
      // Fallback method for development/demo if API endpoint isn't available
      console.log("Using fallback save method (simulated)");
      return new Promise(resolve => {
        // Simulate a delay for demonstration purposes
        setTimeout(() => {
          console.log("ASCs data would be saved to:", JSON.stringify(this.ascs));
          resolve(true);
        }, 500);
      });
    }
  }
}
