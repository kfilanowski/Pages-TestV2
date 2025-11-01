import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

/**
 * Application configuration
 * 
 * Design decisions:
 * - HttpClient with fetch API for better performance and SSR compatibility
 * - Client hydration for improved initial page load
 * - Event replay for better user experience during hydration
 * - Iconify for comprehensive icon support (200,000+ icons from 150+ libraries)
 *   with zero configuration - icons load automatically based on frontmatter
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withFetch()),
    provideClientHydration(withEventReplay()),
  ]
};
