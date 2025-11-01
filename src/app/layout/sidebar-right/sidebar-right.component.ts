import { Component, input, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { MarkdownService } from '../../core/services';
import { Note } from '../../core/interfaces';

/**
 * Right Sidebar Component
 *
 * Displays the information sidebar with:
 * - Pages referenced by the current page (outgoing links)
 * - Pages referencing the current page (backlinks/incoming links)
 *
 * Design decisions:
 * - Reactive component using Angular signals
 * - Uses MarkdownService to get link relationships
 * - Single Responsibility: Display page relationships
 * - Follows Dependency Injection principle
 * - Waits for reference graph to be ready before computing links
 */
@Component({
  selector: 'app-sidebar-right',
  imports: [RouterLink],
  templateUrl: './sidebar-right.component.html',
  styleUrl: './sidebar-right.component.scss',
})
export class SidebarRightComponent {
  private readonly markdownService = inject(MarkdownService);

  // Input for controlling visibility
  readonly isOpen = input.required<boolean>();

  // Input for the current note ID
  readonly currentNoteId = input<string | null>(null);

  // Track if reference graph is ready
  protected readonly referenceGraphReady = toSignal(
    this.markdownService.referenceGraphReady$,
    { initialValue: false }
  );

  // Computed properties for outgoing and incoming links
  // Only compute when reference graph is ready
  protected readonly outgoingLinks = computed<Note[]>(() => {
    const noteId = this.currentNoteId();
    const isReady = this.referenceGraphReady();

    if (!noteId || !isReady) {
      return [];
    }

    return this.markdownService.getOutgoingLinks(noteId);
  });

  protected readonly incomingLinks = computed<Note[]>(() => {
    const noteId = this.currentNoteId();
    const isReady = this.referenceGraphReady();

    if (!noteId || !isReady) {
      return [];
    }

    return this.markdownService.getIncomingLinks(noteId);
  });
}
