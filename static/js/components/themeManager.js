// themeManager.js - Theme toggling functionality
export class ThemeManager {
  constructor() {
    this.init();
  }
  
  init() {
    // Load saved theme preference
    this.loadThemePreference();
    
    // Add event listener for theme toggle button if present
    const toggleButton = document.querySelector('.theme-toggle');
    if (toggleButton) {
      toggleButton.addEventListener('click', () => this.toggleTheme());
    }
  }
  
  loadThemePreference() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.applyTheme(savedTheme === 'dark');
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      this.applyTheme(true);
    }
  }
  
  toggleTheme() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    this.applyTheme(!isDark);
    
    // Save preference
    localStorage.setItem('theme', !isDark ? 'dark' : '');
  }
  
  applyTheme(isDark) {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : '');
    document.documentElement.setAttribute('data-bs-theme', isDark ? 'dark' : 'light');
  }
}
