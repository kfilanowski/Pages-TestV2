import { Component, input, output } from '@angular/core';
import { NotesNavigationComponent } from '../../features/notes/components';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

/**
 * Left Sidebar Component
 *
 * Displays the notes navigation tree in the left sidebar with header controls
 *
 * Design decisions:
 * - Delegates notes navigation to NotesNavigationComponent
 * - Visibility controlled by parent component
 * - Single Responsibility: Container for notes navigation
 * - Now includes sidebar header with close and theme toggle buttons
 */
@Component({
  selector: 'app-sidebar-left',
  imports: [NotesNavigationComponent, MatIconModule, MatButtonModule, MatTooltipModule],
  templateUrl: './sidebar-left.component.html',
  styleUrl: './sidebar-left.component.scss',
})
export class SidebarLeftComponent {
  // Inputs
  readonly isOpen = input.required<boolean>();
  readonly isDarkMode = input.required<boolean>();

  // Outputs
  readonly toggleSidebar = output<void>();
  readonly toggleTheme = output<void>();

  /**
   * Handles sidebar close button click
   */
  protected onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }

  /**
   * Handles theme toggle button click
   */
  protected onToggleTheme(): void {
    this.toggleTheme.emit();
  }
}

