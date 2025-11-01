import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * Server-side routing configuration
 *
 * Design decisions:
 * - Notes routes use client-side rendering due to dynamic parameters
 * - Other routes can be prerendered for better performance
 * - Compatible with GitHub Pages static hosting
 */
export const serverRoutes: ServerRoute[] = [
  {
    path: 'Malons-Marvelous-Misadventures/**',
    renderMode: RenderMode.Client,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
