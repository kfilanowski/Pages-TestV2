import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// GitHub Pages 404.html workaround - restore original URL after Angular boots
bootstrapApplication(App, appConfig).then(() => {
  // Restore the original URL after Angular has bootstrapped
  if (typeof window !== 'undefined' && window.sessionStorage) {
    const hasRedirected = sessionStorage.getItem('ghp-redirecting');
    if (hasRedirected) {
      sessionStorage.removeItem('ghp-redirecting');
      const originalUrl = sessionStorage.getItem('ghp-original-url');
      if (originalUrl) {
        sessionStorage.removeItem('ghp-original-url');
        
        // Parse the original URL
        let path = originalUrl;
        let search = '';
        let hash = '';
        
        if (originalUrl.includes('?')) {
          const parts = originalUrl.split('?');
          path = parts[0];
          const queryAndHash = parts[1];
          if (queryAndHash.includes('#')) {
            const queryParts = queryAndHash.split('#');
            search = '?' + queryParts[0];
            hash = '#' + queryParts[1];
          } else {
            search = '?' + queryAndHash;
          }
        } else if (originalUrl.includes('#')) {
          const parts = originalUrl.split('#');
          path = parts[0];
          hash = '#' + parts[1];
        }
        
        // Restore the original path - Angular router will handle it
        if (path && path.startsWith('/Pages-TestV2/')) {
          const newUrl = path + search + hash;
          const currentUrl = window.location.pathname + window.location.search + window.location.hash;
          if (newUrl !== currentUrl) {
            window.history.replaceState(null, '', newUrl);
            // Trigger Angular router navigation
            window.dispatchEvent(new PopStateEvent('popstate'));
          }
        }
      }
    }
  }
}).catch((err) => console.error(err));
