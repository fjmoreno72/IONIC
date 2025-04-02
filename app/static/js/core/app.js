/**
 * app.js - Core application initialization
 * Uses module pattern to avoid polluting global scope
 */
import { ApiService } from '../services/apiService.js';
import { UiService } from '../services/uiService.js';
import { AuthService } from '../services/authService.js';

/**
 * Self-executing function to create a closure and avoid global scope pollution
 */
(function() {
  /**
   * IONIC namespace - Main application interface
   * The only object we expose to the global scope, containing all app functionality
   */
  const IONIC = {
    // API Methods
    fetchIERReport: () => ApiService.fetchIERReport(),
    fetchSREQReport: () => ApiService.fetchSREQReport(),
    fetchTestCases: () => ApiService.fetchTestCases(),
    fetchTestResults: () => ApiService.fetchTestResults(),
    fetchPatterns: () => ApiService.fetchPatterns(),
    fetchActors: () => ApiService.fetchActors(),
    
    // Auth Methods
    logout: () => AuthService.logout(),
    
    // Session handling
    handleSessionExpiration: (response) => AuthService.handleSessionExpiration(response),
    
    // Initialize the application
    init: function() {
      // Check authentication
      AuthService.initAuthChecks();
      
      // Initialize mobile menu
      this.initMobileMenu();
      
      // Setup backward compatibility methods
      this._setupBackwardCompatibility();
    },
    
    /**
     * Initialize the mobile menu toggle functionality
     * Private function within the IONIC namespace
     */
    initMobileMenu: function() {
      const menuToggle = document.getElementById('menuToggle');
      if (!menuToggle) return;
      
      menuToggle.addEventListener('click', () => {
        const navLinks = document.getElementById('navLinks');
        navLinks.classList.toggle('active');
      });
      
      // Handle dropdowns on mobile
      document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
        toggle.addEventListener('click', (e) => {
          if (window.innerWidth <= 991) {
            e.preventDefault();
            const dropdown = toggle.closest('.dropdown');
            dropdown.classList.toggle('active');
            
            // Close other dropdowns
            document.querySelectorAll('.dropdown').forEach(item => {
              if (item !== dropdown) {
                item.classList.remove('active');
              }
            });
          }
        });
      });
      
      // Close mobile menu when clicking outside
      document.addEventListener('click', (e) => {
        const navLinks = document.getElementById('navLinks');
        if (!navLinks) return;
        
        if (window.innerWidth <= 991 && 
            navLinks.classList.contains('active') && 
            !navLinks.contains(e.target) && 
            e.target !== menuToggle && 
            !menuToggle.contains(e.target)) {
          navLinks.classList.remove('active');
        }
      });
      
      // Close mobile menu when window is resized to desktop
      window.addEventListener('resize', () => {
        if (window.innerWidth > 991) {
          const navLinks = document.getElementById('navLinks');
          if (navLinks && navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
          }
          document.querySelectorAll('.dropdown').forEach(dropdown => {
            dropdown.classList.remove('active');
          });
        }
      });
    },
    
    /**
     * Setup backward compatibility methods
     * Private method - not meant to be called externally
     */
    _setupBackwardCompatibility: function() {
      // We need to keep these global window methods for backward compatibility
      // since they're used in inline onclick handlers in the HTML
      window.handleSessionExpiration = this.handleSessionExpiration;
      window.fetchIERReport = this.fetchIERReport;
      window.fetchSREQReport = this.fetchSREQReport;
      window.fetchTestCases = this.fetchTestCases;
      window.fetchTestResults = this.fetchTestResults;
      window.fetchPatterns = this.fetchPatterns;
      window.fetchActors = this.fetchActors;
      window.logout = this.logout;
    }
  };
  
  /**
   * Initialize the application once DOM is loaded
   */
  document.addEventListener('DOMContentLoaded', () => {
    // Expose only the IONIC namespace to global scope
    window.IONIC = IONIC;
    
    // Initialize the application
    IONIC.init();
  });
  
  // Handle CORS and Rocket Loader compatibility
  // This empty function declaration helps with Cloudflare compatibility
  // The __cfRLUnblockHandlers variable is a Cloudflare-specific flag 
  window.__cfRLUnblockHandlers = true;
})();
