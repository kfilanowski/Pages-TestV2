import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MarkdownService, SearchService } from '../../../../core/services';
import { WikiLinkDirective } from '../wiki-link.directive';
import { toSignal } from '@angular/core/rxjs-interop';
import { NgIconComponent } from '@ng-icons/core';

/**
 * Component for displaying markdown note content
 *
 * Design decisions:
 * - Listens to route parameters to load the correct note
 * - Renders HTML directly, bypassing sanitizer for trusted markdown content
 * - WikiLinkDirective handles hover previews and click navigation
 * - Handles note loading states
 * - Implements fade-in/fade-out transitions between notes
 * - Uses DomSanitizer.bypassSecurityTrustHtml to preserve data-* attributes needed for wiki-links
 */
@Component({
  selector: 'app-note-viewer',
  imports: [CommonModule, WikiLinkDirective, NgIconComponent],
  templateUrl: './note-viewer.component.html',
  styleUrl: './note-viewer.component.scss',
})
export class NoteViewerComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly markdownService = inject(MarkdownService);
  private readonly searchService = inject(SearchService);
  private readonly sanitizer = inject(DomSanitizer);

  protected readonly rawContent = signal<string>('');
  protected readonly error = signal<string | null>(null);
  protected readonly contentVisible = signal<boolean>(false);
  protected readonly noteTitle = signal<string>('');
  protected readonly noteIcon = signal<string | undefined>(undefined);

  private currentNoteId: string | null = null;

  /**
   * Converts frontmatter icon names (e.g., "FiTarget", "LuSword") to ng-icons format
   * Maps common prefixes to their ng-icons equivalents
   * Returns null if the prefix is not recognized (preventing fallback icons)
   */
  protected readonly convertedIconName = computed(() => {
    const icon = this.noteIcon();
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
      console.warn(`Unknown icon prefix "${prefix}" in icon "${icon}". Icon will not be displayed.`);
      return null;
    }

    return `${mappedPrefix}${iconName}`;
  });

  // Track search query
  protected readonly searchQuery = toSignal(this.searchService.searchQuery$, {
    initialValue: '',
  });

  // Computed content with highlighting applied
  protected readonly noteContent = computed(() => {
    const content = this.rawContent();
    const query = this.searchQuery();

    if (!query.trim() || !content) {
      return this.sanitizer.bypassSecurityTrustHtml(content);
    }

    // Apply highlighting to the content
    const highlighted = this.highlightSearchTerms(content, query);
    return this.sanitizer.bypassSecurityTrustHtml(highlighted);
  });

  ngOnInit(): void {
    // Listen to route parameter changes to load the correct note
    this.route.paramMap.subscribe((params) => {
      const noteId = params.get('id');
      if (noteId) {
        this.loadNote(noteId);
      } else {
        this.error.set('No note ID provided');
        this.contentVisible.set(false);
      }
    });
  }

  /**
   * Loads a note by its ID with smooth fade-out/fade-in transition
   * Creates a seamless transition through the background color
   */
  private loadNote(noteId: string): void {
    this.currentNoteId = noteId;

    // Fade out current content
    this.contentVisible.set(false);

    // Wait for fade-out animation to complete before loading new content
    setTimeout(() => {
      this.error.set(null);

      // Get note metadata for title and icon
      const note = this.markdownService.getNoteById(noteId);
      if (note) {
        this.noteTitle.set(note.title);
        this.noteIcon.set(note.icon);
      } else {
        this.noteTitle.set(noteId);
        this.noteIcon.set(undefined);
      }

      this.markdownService.loadNoteById(noteId).subscribe({
        next: (html) => {
          // Store raw content for highlighting
          this.rawContent.set(html);

          // Brief delay to ensure DOM is updated, then fade in
          setTimeout(() => {
            this.contentVisible.set(true);
          }, 50);
        },
        error: (err) => {
          this.error.set(`Failed to load note: ${err.message}`);
          this.contentVisible.set(false);
        },
      });
    }, 125); // Match fade-out duration
  }

  /**
   * Retries loading the current note
   */
  protected retry(): void {
    if (this.currentNoteId) {
      this.loadNote(this.currentNoteId);
    }
  }

  /**
   * Highlights search terms in HTML content
   * Avoids highlighting inside HTML tags
   */
  private highlightSearchTerms(html: string, query: string): string {
    if (!query.trim()) {
      return html;
    }

    // Create a temporary div to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    // Recursively highlight text nodes
    this.highlightTextNodes(tempDiv, query);

    return tempDiv.innerHTML;
  }

  /**
   * Recursively highlights text nodes in an element
   */
  private highlightTextNodes(element: HTMLElement, query: string): void {
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null
    );

    const nodesToReplace: { node: Node; parent: Node; highlighted: Node }[] =
      [];

    let node: Node | null;
    while ((node = walker.nextNode())) {
      const text = node.textContent || '';

      // Skip if parent is a script, style, or already highlighted
      const parent = node.parentNode;
      if (
        !parent ||
        parent.nodeName === 'SCRIPT' ||
        parent.nodeName === 'STYLE' ||
        (parent as HTMLElement).classList?.contains('search-highlight')
      ) {
        continue;
      }

      // Create regex for case-insensitive matching
      // Split query into words and match each independently
      const queryWords = query.trim().split(/\s+/);
      let highlightedText = text;
      let hasMatch = false;

      for (const word of queryWords) {
        if (word.length < 2) continue;

        // Escape special regex characters
        const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        // Case-insensitive match
        const regex = new RegExp(`(${escapedWord})`, 'gi');

        if (regex.test(highlightedText)) {
          hasMatch = true;
          highlightedText = highlightedText.replace(
            regex,
            '<mark class="search-highlight">$1</mark>'
          );
        }
      }

      if (hasMatch) {
        const span = document.createElement('span');
        span.innerHTML = highlightedText;
        nodesToReplace.push({ node, parent, highlighted: span });
      }
    }

    // Replace nodes after walking to avoid modifying the tree during traversal
    for (const { node, parent, highlighted } of nodesToReplace) {
      parent.replaceChild(highlighted, node);
    }
  }
}
