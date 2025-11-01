import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// GitHub Pages 404.html workaround - restore original URL if redirected
(function() {
  if (typeof window !== 'undefined' && window.sessionStorage) {
    const originalUrl = sessionStorage.getItem('ghp-original-url');
    if (originalUrl) {
      sessionStorage.removeItem('ghp-original-url');
      // Restore the original URL path so Angular router can handle it
      const newUrl = window.location.origin + originalUrl;
      if (window.location.href !== newUrl) {
        window.history.replaceState(null, '', originalUrl);
      }
    }
  }
})();

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
