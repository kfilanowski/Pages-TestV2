import { Component, input } from '@angular/core';
import { NotesNavigationComponent } from '../../features/notes/components';

/**
 * Left Sidebar Component
 *
 * Displays the notes navigation tree in the left sidebar
 *
 * Design decisions:
 * - Delegates notes navigation to NotesNavigationComponent
 * - Visibility controlled by parent component
 * - Single Responsibility: Container for notes navigation
 */
@Component({
  selector: 'app-sidebar-left',
  imports: [NotesNavigationComponent],
  templateUrl: './sidebar-left.component.html',
  styleUrl: './sidebar-left.component.scss',
})
export class SidebarLeftComponent {
  // Input for controlling visibility
  readonly isOpen = input.required<boolean>();
}

