import { Component, signal, inject, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

// Layout components (using barrel export for cleaner imports)
import {
  HeaderComponent,
  FooterComponent,
  SidebarLeftComponent,
  SidebarRightComponent,
} from './layout';

// Core services
import { ThemeService } from './core/services';

/**
 * Root application component implementing a responsive layout with:
 * - Collapsible left and right sidebars
 * - Fixed header and footer
 * - Main content area with routing
 * - Theme management (light/dark mode)
 *
 * Design decisions:
 * - Uses Angular signals for reactive state management
 * - Delegates presentation to child layout components
 * - Orchestrates layout state (Container pattern)
 * - Separation of concerns: state management vs presentation
 * - Tracks current route to pass note ID to sidebar
 * - Integrates ThemeService for global theme state
 */
@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    SidebarLeftComponent,
    SidebarRightComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  private readonly router = inject(Router);
  private readonly themeService = inject(ThemeService);

  protected readonly title = 'MMM';

  // Reactive state for sidebar visibility using Angular signals
  protected readonly leftSidebarOpen = signal(true);
  protected readonly rightSidebarOpen = signal(true);

  // Track current note ID for sidebar reference display
  protected readonly currentNoteId = signal<string | null>(null);

  // Expose theme state from ThemeService
  protected readonly isDarkMode = this.themeService.isDarkMode;

  ngOnInit(): void {
    // Listen to route changes and extract note ID
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        const noteId = this.extractNoteIdFromRoute();
        this.currentNoteId.set(noteId);
      });

    // Set initial note ID
    const noteId = this.extractNoteIdFromRoute();
    this.currentNoteId.set(noteId);
  }

  /**
   * Extracts the note ID from the current route
   * Returns null if not on a notes route
   */
  private extractNoteIdFromRoute(): string | null {
    const urlSegments = this.router.url.split('/');
    // Check if we're on a /Malons-Marvelous-Misadventures/:id route
    if (
      urlSegments.length >= 3 &&
      urlSegments[1] === 'Malons-Marvelous-Misadventures'
    ) {
      return urlSegments[2];
    }
    return null;
  }

  /**
   * Toggles the left sidebar visibility state
   */
  protected toggleLeftSidebar(): void {
    this.leftSidebarOpen.update((value) => !value);
  }

  /**
   * Toggles the right sidebar visibility state
   */
  protected toggleRightSidebar(): void {
    this.rightSidebarOpen.update((value) => !value);
  }

  /**
   * Toggles between light and dark theme
   * Delegates to ThemeService
   */
  protected toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
