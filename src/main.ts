import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { Router } from '@angular/router';

// GitHub Pages 404.html workaround - navigate to stored URL after Angular boots
bootstrapApplication(App, appConfig).then(appRef => {
  // Check for stored URL and navigate to it after Angular is ready
  if (typeof window !== 'undefined' && window.localStorage) {
    const originalUrl = localStorage.getItem('ghp-original-url');
    if (originalUrl) {
      localStorage.removeItem('ghp-original-url');
      
      // Parse the original URL to get the path relative to base
      let path = originalUrl;
      if (path.includes('?')) {
        path = path.split('?')[0];
      }
      if (path.includes('#')) {
        path = path.split('#')[0];
      }
      
      // Remove the base path to get the route
      // originalUrl is like "/Pages-TestV2/Malons-Marvelous-Misadventures/Index"
      // base href is "/Pages-TestV2/", so route is "Malons-Marvelous-Misadventures/Index"
      if (path.startsWith('/Pages-TestV2/')) {
        const route = path.substring('/Pages-TestV2/'.length);
        
        // Get router and navigate to the route
        const router = appRef.injector.get(Router);
        router.navigateByUrl(route).then(() => {
          // Update the browser URL to match after navigation completes
          const fullUrl = '/Pages-TestV2/' + route + 
            (originalUrl.includes('?') ? originalUrl.substring(originalUrl.indexOf('?')) : '');
          window.history.replaceState(null, '', fullUrl);
        }).catch(err => {
          console.error('Navigation failed:', err);
        });
      }
    }
  }
}).catch((err) => console.error(err));
