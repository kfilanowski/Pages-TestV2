import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// GitHub Pages 404.html workaround - restore original URL if redirected
(function() {
  if (typeof window !== 'undefined' && window.sessionStorage) {
    // Clear the redirecting flag
    sessionStorage.removeItem('ghp-redirecting');
    
    const originalUrl = sessionStorage.getItem('ghp-original-url');
    // Only restore if we came from a 404.html redirect (we're on index.html now)
    if (originalUrl && window.location.pathname.endsWith('/index.html')) {
      sessionStorage.removeItem('ghp-original-url');
      
      // Parse the original URL
      const urlParts = originalUrl.split('?');
      const path = urlParts[0];
      const search = urlParts[1] ? '?' + urlParts[1] : '';
      const hash = window.location.hash; // Keep current hash if any
      
      // Only restore if the path is different and valid
      if (path !== window.location.pathname && path.startsWith('/Pages-TestV2/')) {
        // Restore the full path before Angular boots so router can handle it correctly
        window.history.replaceState(null, '', path + search + hash);
      }
    }
  }
})();

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
