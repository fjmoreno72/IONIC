// themeManager.js - Modified to always use light mode
export class ThemeManager {
  constructor() {
    this.init();
  }
  
  init() {
    // Always apply light theme
    this.applyLightTheme();
  }
  
  // Force light mode
  applyLightTheme() {
    // Remove any dark theme attributes
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.setAttribute('data-bs-theme', 'light');
    
    // Clear any saved theme preference
    localStorage.removeItem('theme');
  }
}
