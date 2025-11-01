import { Routes } from '@angular/router';

/**
 * Application routes configuration
 *
 * Uses lazy loading for better performance and code splitting.
 * Each route loads its component only when accessed.
 */
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'Malons-Marvelous-Misadventures/Index',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./pages/home/home.component').then((m) => m.HomeComponent),
    title: 'Home - MMM',
  },
  {
    path: 'Malons-Marvelous-Misadventures/:id',
    loadComponent: () =>
      import(
        './features/notes/components/note-viewer/note-viewer.component'
      ).then((m) => m.NoteViewerComponent),
    title: 'Notes - MMM',
  },
  {
    path: '**',
    redirectTo: 'Malons-Marvelous-Misadventures/Index',
  },
];
