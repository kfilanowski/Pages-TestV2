import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, Router, ActivationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';

// Layout components (using barrel export for cleaner imports)
import {
  // HeaderComponent, // Hidden - buttons moved to sidebars
  FooterComponent,
  SidebarLeftComponent,
  SidebarRightComponent,
} from './layout';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

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
    // HeaderComponent, // Hidden - buttons moved to sidebars
    FooterComponent,
    SidebarLeftComponent,
    SidebarRightComponent,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly themeService = inject(ThemeService);
  private routerSubscription?: Subscription;

  protected readonly title = 'Malon\'s Marvelous Misadventures';

  // Reactive state for sidebar visibility using Angular signals
  protected readonly leftSidebarOpen = signal(true);
  protected readonly rightSidebarOpen = signal(true);

  // Track current note ID for sidebar reference display
  protected readonly currentNoteId = signal<string | null>(null);

  // Expose theme state from ThemeService
  protected readonly isDarkMode = this.themeService.isDarkMode;

  ngOnInit(): void {
    // Listen to all navigation events and extract note ID from activated routes
    this.routerSubscription = this.router.events
      .pipe(
        filter((event) => event instanceof ActivationEnd),
      )
      .subscribe((event) => {
        const activationEnd = event as ActivationEnd;
        // Extract the 'id' param from the route
        const noteId = activationEnd.snapshot.params['id'];
        if (noteId !== undefined) {
          // Decode any URL-encoded characters
          const decodedNoteId = decodeURIComponent(noteId);
          this.currentNoteId.set(decodedNoteId);
        } else {
          // If no id parameter, we're not on a note route
          this.currentNoteId.set(null);
        }
      });

    // Set initial note ID
    const noteId = this.extractNoteIdFromRoute();
    this.currentNoteId.set(noteId);
  }

  ngOnDestroy(): void {
    // Clean up subscription
    this.routerSubscription?.unsubscribe();
  }

  /**
   * Extracts the note ID from the current route
   * Returns null if not on a notes route
   * Properly handles URL encoding and query parameters
   */
  private extractNoteIdFromRoute(): string | null {
    // Get the URL without query parameters or fragments
    const url = this.router.url.split('?')[0].split('#')[0];
    const urlSegments = url.split('/');
    
    // Check if we're on a /Malons-Marvelous-Misadventures/:id route
    if (
      urlSegments.length >= 3 &&
      urlSegments[1] === 'Malons-Marvelous-Misadventures'
    ) {
      // Decode URL-encoded characters (e.g., %20 -> space)
      const encodedNoteId = urlSegments[2];
      return decodeURIComponent(encodedNoteId);
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
