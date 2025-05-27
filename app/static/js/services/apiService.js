// apiService.js - Handles all API fetch operations
import { UiService } from './uiService.js';
import { AuthService } from './authService.js';

export class ApiService {
  
  /**
   * Fetches IER report data from the server
   */
  static async fetchIERReport() {
    try {
      // Show the loading spinner 
      UiService.showLoader();
      
      // Create a timer overlay - blue theme for IER to distinguish from SREQ
      const timerOverlay = UiService.createTimerOverlay({
        title: 'IER Coverage report generation in progress',
        subtitle: 'Usually takes less than a minute',
        backgroundColor: 'rgba(0, 70, 140, 0.8)',
        timerId: 'ier-timer',
        timerColor: '#7edfff'
      });
      
      // Start timer
      let seconds = 0;
      const timerElement = document.getElementById('ier-timer');
      const updateInterval = setInterval(() => {
        seconds += 1;
        timerElement.textContent = `${seconds}s elapsed`;
      }, 1000);
      
      // Make the request
      const response = await fetch('/get_ier_coverage');
      
      // Stop timer
      clearInterval(updateInterval);
      
      // Get text and try to parse
      const text = await response.text();
      let data;
      
      try {
        data = JSON.parse(text);
        
        // Success! Remove timer overlay and proceed
        UiService.removeTimerOverlay();
        
        if (data.success) {
          UiService.showSuccessMessage('IER Coverage');
          window.location.href = '/view_ier_tree';
        } else {
          alert('Failed to fetch report: ' + (data.error || 'Unknown error'));
        }
      } catch (parseError) {
        // Clean up the timer overlay
        UiService.removeTimerOverlay();
        
        // Check for session expiration
        if (AuthService.checkSessionExpiredInHtml(text)) {
          return;
        }
        
        // If we receive HTML but it's not a session expiration
        if (text.includes("<!DOCTYPE html>") || text.includes("<html")) {
          alert('Error parsing response. The request was received but returned HTML instead of JSON.');
          return;
        }
        
        // Some other parsing error
        alert('Error parsing response: ' + parseError.message);
      }
    } catch (error) {
      // Clean up timer overlay in case of error
      UiService.removeTimerOverlay();
      
      alert('Error fetching report: ' + error.message);
    } finally {
      // Always hide the loader
      UiService.hideLoader();
    }
  }
  
  /**
   * Fetches SREQ report data from the server
   */
  static async fetchSREQReport() {
    try {
      // Show the loading spinner 
      UiService.showLoader();
      
      // Create a timer overlay for background processing
      const timerOverlay = UiService.createTimerOverlay({
        title: 'SREQ Coverage report generation in progress',
        subtitle: 'This may take 3+ minutes',
        timerId: 'timer',
        timerColor: '#ffc107',
        statusId: 'status-message',
        statusMessage: 'Starting background process...'
      });
      
      // Start timer and background polling
      let seconds = 0;
      const timerElement = document.getElementById('timer');
      const statusElement = document.getElementById('status-message');
      
      // Start the background processing request
      const response = await fetch('/get_requirement_coverage');
      const data = await response.json();
      
      if (!data.success) {
        UiService.removeTimerOverlay();
        alert('Failed to start processing: ' + (data.error || 'Unknown error'));
        UiService.hideLoader();
        return;
      }
      
      // Update status to show we're processing
      statusElement.textContent = 'Processing in background... (will auto-redirect when done)';
      
      // Set up polling for status and timer
      const checkInterval = setInterval(async () => {
        // Update timer
        seconds += 1;
        timerElement.textContent = `${seconds}s elapsed`;
        
        try {
          // Every 5 seconds, check status
          if (seconds % 5 === 0) {
            const statusResponse = await fetch('/check_sreq_status');
            const statusData = await statusResponse.json();
            
            // Update the status message based on current state
            if (statusData.status === 'completed') {
              // Processing is done!
              clearInterval(checkInterval);
              statusElement.textContent = 'Processing complete! Redirecting...';
              
              // Success! Remove timer overlay and redirect
              setTimeout(() => {
                UiService.removeTimerOverlay();
                UiService.showSuccessMessage('SREQ Coverage');
                window.location.href = '/view_tree_func';
              }, 1000);
            } else if (statusData.status === 'processing') {
              // Still processing
              statusElement.textContent = `Processing in background... (${Math.round(statusData.elapsed_seconds)}s elapsed server-side)`;
            } else if (statusData.status === 'error') {
              // Error occurred
              clearInterval(checkInterval);
              UiService.removeTimerOverlay();
              alert('Error processing SREQ data: ' + statusData.message);
              UiService.hideLoader();
            }
          }
          
          // Every 50 seconds, keep session alive by pinging auth
          if (seconds % 50 === 0 && seconds > 0) {
            await fetch('/check_auth');
          }
        } catch (error) {
          console.error('Error checking status:', error);
          // Don't stop polling for transient errors
        }
      }, 1000);
      
      // Set a reasonable maximum time limit (10 minutes = 600 seconds)
      setTimeout(() => {
        clearInterval(checkInterval);
        UiService.removeTimerOverlay();
        UiService.hideLoader();
      }, 600000);
      
    } catch (error) {
      // Clean up timer overlay in case of error
      UiService.removeTimerOverlay();
      
      alert('Error starting SREQ process: ' + error.message);
      UiService.hideLoader();
    }
  }
  
  /**
   * Fetches test cases data from the server
   */
  static async fetchTestCases() {
    try {
      // Show the loading spinner
      UiService.showLoader();
      
      // Create a timer overlay with a green theme for test cases
      const timerOverlay = UiService.createTimerOverlay({
        title: 'Fetching Test Cases data',
        subtitle: 'Please wait...',
        backgroundColor: 'rgba(0, 100, 0, 0.8)',
        timerId: 'test-cases-timer',
        timerColor: '#a0ffa0'
      });
      
      // Start timer
      let seconds = 0;
      const timerElement = document.getElementById('test-cases-timer');
      const updateInterval = setInterval(() => {
        seconds += 1;
        timerElement.textContent = `${seconds}s elapsed`;
      }, 1000);
      
      // Make the request
      const response = await fetch('/get_test_cases');
      
      // Stop timer
      clearInterval(updateInterval);
      
      // Get text and try to parse
      const text = await response.text();
      let data;
      
      try {
        data = JSON.parse(text);
        
        // Remove timer overlay
        UiService.removeTimerOverlay();
        
        if (data.success) {
          const countText = typeof data.count === 'number' ?
            `${data.count} items` : '';
          UiService.showSuccessMessage(`Test Cases data fetched (${countText})`);

          // Also fetch Actors and Patterns as requested
          this.fetchActors();
          this.fetchPatterns();
        } else {
          alert('Failed to fetch test cases: ' + (data.error || 'Unknown error'));
        }
      } catch (parseError) {
        // Clean up the timer overlay
        UiService.removeTimerOverlay();
        
        // Check for session expiration
        if (AuthService.checkSessionExpiredInHtml(text)) {
          return;
        }
        
        // If we receive HTML but it's not a session expiration
        if (text.includes("<!DOCTYPE html>") || text.includes("<html")) {
          alert('Error parsing response. The request was received but returned HTML instead of JSON.');
          return;
        }
        
        // Some other parsing error
        alert('Error parsing response: ' + parseError.message);
      }
    } catch (error) {
      // Clean up timer overlay in case of error
      UiService.removeTimerOverlay();
      
      alert('Error fetching test cases: ' + error.message);
    } finally {
      // Always hide the loader
      UiService.hideLoader();
    }
  }

  /**
   * Fetches test results data from the server
   */
  static async fetchTestResults() {
    try {
      // Show the loading spinner
      UiService.showLoader();
      
      // Create a timer overlay with a purple theme for test results
      const timerOverlay = UiService.createTimerOverlay({
        title: 'Fetching Test Results data',
        subtitle: 'Please wait...',
        backgroundColor: 'rgba(75, 0, 130, 0.8)',
        timerId: 'test-results-timer',
        timerColor: '#d8b0ff'
      });
      
      // Start timer
      let seconds = 0;
      const timerElement = document.getElementById('test-results-timer');
      const updateInterval = setInterval(() => {
        seconds += 1;
        timerElement.textContent = `${seconds}s elapsed`;
      }, 1000);
      
      // Make the request
      const response = await fetch('/get_test_results');
      
      // Stop timer
      clearInterval(updateInterval);
      
      // Get text and try to parse
      const text = await response.text();
      let data;
      
      try {
        data = JSON.parse(text);
        
        // Remove timer overlay
        UiService.removeTimerOverlay();
        
        if (data.success) {
          const countText = typeof data.count === 'number' ? 
            `${data.count} items` : '';
          UiService.showSuccessMessage(`Test Results data fetched (${countText})`);
        } else {
          alert('Failed to fetch test results: ' + (data.error || 'Unknown error'));
        }
      } catch (parseError) {
        // Clean up the timer overlay
        UiService.removeTimerOverlay();
        
        // Check for session expiration
        if (AuthService.checkSessionExpiredInHtml(text)) {
          return;
        }
        
        // If we receive HTML but it's not a session expiration
        if (text.includes("<!DOCTYPE html>") || text.includes("<html")) {
          alert('Error parsing response. The request was received but returned HTML instead of JSON.');
          return;
        }
        
        // Some other parsing error
        alert('Error parsing response: ' + parseError.message);
      }
    } catch (error) {
      // Clean up timer overlay in case of error
      UiService.removeTimerOverlay();
      
      alert('Error fetching test results: ' + error.message);
    } finally {
      // Always hide the loader
      UiService.hideLoader();
    }
  }

  /**
   * Fetches test results data from the server using the new job-based API
   */
  static async fetchTestResultsNew() {
    try {
      // Show the loading spinner
      UiService.showLoader();
      
      // Create a timer overlay with a green theme for new test results
      const timerOverlay = UiService.createTimerOverlay({
        title: 'Fetching Test Results (NEW API)',
        subtitle: 'This may take several minutes due to job processing...',
        backgroundColor: 'rgba(34, 139, 34, 0.8)',
        timerId: 'test-results-new-timer',
        timerColor: '#90ee90'
      });
      
      // Start timer
      let seconds = 0;
      const timerElement = document.getElementById('test-results-new-timer');
      const updateInterval = setInterval(() => {
        seconds += 1;
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        const timeText = minutes > 0 ? 
          `${minutes}m ${remainingSeconds}s elapsed` : 
          `${seconds}s elapsed`;
        timerElement.textContent = timeText;
      }, 1000);
      
      // Make the request
      const response = await fetch('/get_test_results_new');
      
      // Stop timer
      clearInterval(updateInterval);
      
      // Get text and try to parse
      const text = await response.text();
      let data;
      
      try {
        data = JSON.parse(text);
        
        // Remove timer overlay
        UiService.removeTimerOverlay();
        
        if (data.success) {
          const countText = typeof data.count === 'number' ? 
            `${data.count} items` : '';
          const jobText = data.job_id ? ` (Job ID: ${data.job_id})` : '';
          
          UiService.showSuccessMessage(`Test Results data fetched using NEW API (${countText})${jobText}`);
          
          // If there's a redirect instruction, navigate to the statistics page
          if (data.redirect) {
            setTimeout(() => {
              window.location.href = data.redirect;
            }, 1500); // Small delay to show the success message
          }
        } else {
          alert('Failed to fetch test results with new API: ' + (data.error || 'Unknown error'));
        }
      } catch (parseError) {
        // Clean up the timer overlay
        UiService.removeTimerOverlay();
        
        // Check for session expiration
        if (AuthService.checkSessionExpiredInHtml(text)) {
          return;
        }
        
        // If we receive HTML but it's not a session expiration
        if (text.includes("<!DOCTYPE html>") || text.includes("<html")) {
          alert('Error parsing response. The request was received but returned HTML instead of JSON.');
          return;
        }
        
        // Some other parsing error
        alert('Error parsing response: ' + parseError.message);
      }
    } catch (error) {
      // Clean up timer overlay in case of error
      UiService.removeTimerOverlay();
      
      alert('Error fetching test results with new API: ' + error.message);
    } finally {
      // Always hide the loader
      UiService.hideLoader();
    }
  }

  /**
   * Fetches patterns data from the server
   */
  static async fetchPatterns() {
    try {
      // Show the loading spinner
      UiService.showLoader();
      
      // Create a timer overlay with an orange theme for patterns
      const timerOverlay = UiService.createTimerOverlay({
        title: 'Fetching Patterns data',
        subtitle: 'Please wait...',
        backgroundColor: 'rgba(255, 140, 0, 0.8)',
        timerId: 'patterns-timer',
        timerColor: '#ffe0b0'
      });
      
      // Start timer
      let seconds = 0;
      const timerElement = document.getElementById('patterns-timer');
      const updateInterval = setInterval(() => {
        seconds += 1;
        timerElement.textContent = `${seconds}s elapsed`;
      }, 1000);
      
      // Make the request
      const response = await fetch('/get_patterns');
      
      // Stop timer
      clearInterval(updateInterval);
      
      // Get text and try to parse
      const text = await response.text();
      let data;
      
      try {
        data = JSON.parse(text);
        
        // Remove timer overlay
        UiService.removeTimerOverlay();
        
        if (data.success) {
          const countText = typeof data.count === 'number' ? 
            `${data.count} items` : '';
          UiService.showSuccessMessage(`Patterns data fetched (${countText})`);
        } else {
          alert('Failed to fetch patterns: ' + (data.error || 'Unknown error'));
        }
      } catch (parseError) {
        // Clean up the timer overlay
        UiService.removeTimerOverlay();
        
        // Check for session expiration
        if (AuthService.checkSessionExpiredInHtml(text)) {
          return;
        }
        
        // If we receive HTML but it's not a session expiration
        if (text.includes("<!DOCTYPE html>") || text.includes("<html")) {
          alert('Error parsing response. The request was received but returned HTML instead of JSON.');
          return;
        }
        
        // Some other parsing error
        alert('Error parsing response: ' + parseError.message);
      }
    } catch (error) {
      // Clean up timer overlay in case of error
      UiService.removeTimerOverlay();
      
      alert('Error fetching patterns: ' + error.message);
    } finally {
      // Always hide the loader
      UiService.hideLoader();
    }
  }

  /**
   * Fetches actors data from the server
   */
  static async fetchActors() {
    try {
      // Show the loading spinner
      UiService.showLoader();
      
      // Create a timer overlay with a red theme for actors
      const timerOverlay = UiService.createTimerOverlay({
        title: 'Fetching Actors data',
        subtitle: 'Please wait...',
        backgroundColor: 'rgba(139, 0, 0, 0.8)',
        timerId: 'actors-timer',
        timerColor: '#ffb0b0'
      });
      
      // Start timer
      let seconds = 0;
      const timerElement = document.getElementById('actors-timer');
      const updateInterval = setInterval(() => {
        seconds += 1;
        timerElement.textContent = `${seconds}s elapsed`;
      }, 1000);
      
      // Make the request
      const response = await fetch('/get_actors');
      
      // Stop timer
      clearInterval(updateInterval);
      
      // Get text and try to parse
      const text = await response.text();
      let data;
      
      try {
        data = JSON.parse(text);
        
        // Remove timer overlay
        UiService.removeTimerOverlay();
        
        if (data.success) {
          const countText = typeof data.count === 'number' ? 
            `${data.count} items` : '';
          UiService.showSuccessMessage(`Actors data fetched (${countText})`);
        } else {
          alert('Failed to fetch actors: ' + (data.error || 'Unknown error'));
        }
      } catch (parseError) {
        // Clean up the timer overlay
        UiService.removeTimerOverlay();
        
        // Check for session expiration
        if (AuthService.checkSessionExpiredInHtml(text)) {
          return;
        }
        
        // If we receive HTML but it's not a session expiration
        if (text.includes("<!DOCTYPE html>") || text.includes("<html")) {
          alert('Error parsing response. The request was received but returned HTML instead of JSON.');
          return;
        }
        
        // Some other parsing error
        alert('Error parsing response: ' + parseError.message);
      }
    } catch (error) {
      // Clean up timer overlay in case of error
      UiService.removeTimerOverlay();
      
      alert('Error fetching actors: ' + error.message);
    } finally {
      // Always hide the loader
      UiService.hideLoader();
    }
  }
}
