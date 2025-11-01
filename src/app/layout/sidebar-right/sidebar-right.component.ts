import { Component, input, output, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { MarkdownService } from '../../core/services';
import { Note } from '../../core/interfaces';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgIconComponent } from '@ng-icons/core';

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
 * - Now includes sidebar header with close button
 */
@Component({
  selector: 'app-sidebar-right',
  imports: [RouterLink, MatIconModule, MatButtonModule, MatTooltipModule, NgIconComponent],
  templateUrl: './sidebar-right.component.html',
  styleUrl: './sidebar-right.component.scss',
})
export class SidebarRightComponent {
  private readonly markdownService = inject(MarkdownService);

  // Inputs
  readonly isOpen = input.required<boolean>();
  readonly currentNoteId = input<string | null>(null);

  // Outputs
  readonly toggleSidebar = output<void>();

  /**
   * Handles sidebar close button click
   */
  protected onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }

  /**
   * Converts frontmatter icon names (e.g., "FiTarget", "LuSword") to ng-icons format
   * Maps common prefixes to their ng-icons equivalents
   * Returns null if the prefix is not recognized or icon is undefined
   */
  protected convertIconName(icon: string | undefined): string | null {
    if (!icon) return null;

    // Map of frontmatter icon prefixes to ng-icons library prefixes
    const prefixMap: Record<string, string> = {
      'Fi': 'lucide',    // Feather Icons -> Lucide (closest match)
      'Fa': 'lucide',    // Font Awesome -> Lucide (for compatibility)
      'Bs': 'bootstrap', // Bootstrap Icons
      'Hi': 'hero',      // Heroicons
      'Lu': 'lucide',    // Lucide
      'Tb': 'tabler',    // Tabler Icons
      'Ra': 'radix',     // Radix Icons
      'Gi': 'game',      // Game Icons
    };

    // Extract prefix (first 2 chars) and icon name
    const prefix = icon.substring(0, 2);
    const iconName = icon.substring(2);

    // Only return icon name if prefix is recognized
    const mappedPrefix = prefixMap[prefix];
    if (!mappedPrefix) {
      return null;
    }

    return `${mappedPrefix}${iconName}`;
  }

  // Track if reference graph is ready
  protected readonly referenceGraphReady = toSignal(
    this.markdownService.referenceGraphReady$,
    { initialValue: false }
  );

  // Computed properties for outgoing and incoming links
  // Outgoing links can be shown immediately from cached content or after graph builds
  // Incoming links require the full reference graph to be built
  protected readonly outgoingLinks = computed<Note[]>(() => {
    const noteId = this.currentNoteId();
    const isReady = this.referenceGraphReady(); // Track graph readiness for re-evaluation
    
    if (!noteId || !noteId.trim()) {
      return [];
    }
    
    // Wait for reference graph to be ready before showing links
    if (!isReady) {
      return [];
    }
    
    // Can work immediately from cached note content, but will improve after graph builds
    return this.markdownService.getOutgoingLinks(noteId);
  });

  protected readonly incomingLinks = computed<Note[]>(() => {
    const noteId = this.currentNoteId();
    const isReady = this.referenceGraphReady();

    if (!noteId || !noteId.trim()) {
      return [];
    }

    // Wait for reference graph to be ready before showing links
    if (!isReady) {
      return [];
    }

    // Call getIncomingLinks to retrieve backlinks from the pre-built reference graph
    // The computed signal will re-evaluate whenever currentNoteId or referenceGraphReady changes
    return this.markdownService.getIncomingLinks(noteId);
  });
}
