// authService.js - Handles authentication and session management
export class AuthService {
  
  /**
   * Handles user logout process
   */
  static logout() {
    // Clear session
    fetch('/logout')
      .then(() => {
        // Redirect to login page
        window.location.href = '/';
      })
      .catch(error => {
        console.error('Error during logout:', error);
        // Redirect anyway to ensure user gets logged out
        window.location.href = '/';
      });
  }
  
  /**
   * Checks if the user is authenticated
   * @returns {Promise<boolean>} Authentication status
   */
  static async checkAuthentication() {
    try {
      const response = await fetch('/check_auth');
      const data = await response.json();
      
      if (!data.authenticated) {
        // If not on login page, redirect to login
        if (!window.location.pathname.endsWith('/')) {
          window.location.href = '/';
        }
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error checking authentication:', error);
      // Assume not authenticated on error
      return false;
    }
  }
  
  /**
   * Handles potential session expiration in API responses
   * @param {Response} response - The fetch API response
   * @returns {boolean|Object} True if session expired, otherwise the response data
   */
  static async handleSessionExpiration(response) {
    // Check if response is HTML
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("text/html")) {
      alert('Your session has expired. Please log in again.');
      window.location.href = '/';
      return true;
    }

    try {
      // Clone the response so we don't consume it
      const clonedResponse = response.clone();
      const text = await clonedResponse.text();
      const data = JSON.parse(text);
      
      // Check for session expiration message in JSON response
      if (data.error && (
          data.error.includes("session has expired") || 
          data.error.includes("Please log in again")
      )) {
        alert('Your session has expired. Please log in again.');
        window.location.href = '/';
        return true;
      }
      
      return { isExpired: false, data };
    } catch (error) {
      // If we can't parse JSON, it might be an HTML response
      try {
        const clonedResponse = response.clone();
        const text = await clonedResponse.text();
        if (text.includes("session has expired") || text.includes("Please log in again")) {
          alert('Your session has expired. Please log in again.');
          window.location.href = '/';
          return true;
        }
      } catch (e) {
        // Ignore if we can't read the response body
      }
      
      return { isExpired: false, response };
    }
  }
  
  /**
   * Checks HTML text for session expiration messages
   * @param {string} text - HTML text to check
   * @returns {boolean} True if session expired message detected
   */
  static checkSessionExpiredInHtml(text) {
    if (text.includes("session has expired") || text.includes("Please log in again")) {
      alert('Your session has expired. Please log in again.');
      window.location.href = '/';
      return true;
    }
    return false;
  }
  
  /**
   * Initializes authentication checks
   * Hides nav menu if not authenticated and redirects as needed
   */
  static initAuthChecks() {
    fetch('/check_auth')
      .then(response => response.json())
      .then(data => {
        if (!data.authenticated) {
          const navMenu = document.getElementById('navMenu');
          if (navMenu) {
            navMenu.style.display = 'none';
          }
          
          // If not on login page, redirect to login
          if (!window.location.pathname.endsWith('/')) {
            window.location.href = '/';
          }
        }
      })
      .catch(error => {
        console.error('Error initializing auth checks:', error);
      });
  }
}
