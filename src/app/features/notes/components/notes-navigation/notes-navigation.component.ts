import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { filter } from 'rxjs';
import { MarkdownService, SearchService } from '../../../../core/services';
import {
  NoteTreeNode,
  NoteFolder,
  isFolder,
  isNote,
  Note,
} from '../../../../core/interfaces';
import { MatIcon } from '@angular/material/icon';
import { SearchResult } from '../../../../core/services/search.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { HighlightMatchPipe } from '../../../../shared/pipes/highlight-match.pipe';

/**
 * Navigation tree component for displaying notes hierarchy
 *
 * Design decisions:
 * - Uses Angular signals for reactive state management
 * - Recursive template for rendering nested folder structure
 * - Auto-expands folders when navigating to a note
 * - Material-inspired tree UI without direct Material dependency
 * - Single Responsibility: handles only navigation tree display and interaction
 */
@Component({
  selector: 'app-notes-navigation',
  imports: [
    CommonModule,
    RouterModule,
    MatIcon,
    FormsModule,
    HighlightMatchPipe,
  ],
  templateUrl: './notes-navigation.component.html',
  styleUrl: './notes-navigation.component.scss',
})
export class NotesNavigationComponent implements OnInit {
  private readonly markdownService = inject(MarkdownService);
  private readonly searchService = inject(SearchService);
  private readonly router = inject(Router);

  // Reactive state for tree nodes
  private readonly allTreeNodes = signal<NoteTreeNode[]>([]);

  // Search state
  protected readonly searchQuery = signal<string>('');
  protected readonly searchResults = toSignal(
    this.searchService.searchResults$,
    {
      initialValue: [],
    }
  );

  // Computed filtered tree based on search
  protected readonly treeNodes = computed(() => {
    const query = this.searchQuery();
    const results = this.searchResults();

    if (!query.trim() || results.length === 0) {
      return this.allTreeNodes();
    }

    // Build a filtered tree showing only matched notes and their parent folders
    return this.buildFilteredTree(this.allTreeNodes(), results);
  });

  // Type guards exposed to template
  protected readonly isFolder = isFolder;
  protected readonly isNote = isNote;

  constructor() {
    // Subscribe to notes tree changes
    this.markdownService.notesTree$.subscribe((tree) => {
      this.allTreeNodes.set(tree);
      // Expand to current route after tree is loaded
      this.expandToCurrentRoute();
    });
  }

  ngOnInit(): void {
    // Listen to route changes to expand the tree
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.expandToCurrentRoute();
      });
  }

  /**
   * Handles search input changes
   */
  protected onSearchChange(query: string): void {
    this.searchQuery.set(query);
    this.searchService.search(query);

    // Auto-expand all folders when searching
    if (query.trim()) {
      this.expandAllFolders(this.allTreeNodes());
      this.allTreeNodes.set([...this.allTreeNodes()]);
    }
  }

  /**
   * Clears the search
   */
  protected clearSearch(): void {
    this.searchQuery.set('');
    this.searchService.clearSearch();
  }

  /**
   * Toggles a folder's expanded state
   */
  protected toggleFolder(folder: NoteTreeNode): void {
    if (isFolder(folder)) {
      folder.expanded = !folder.expanded;
      // Trigger change detection by creating new array reference
      this.allTreeNodes.set([...this.allTreeNodes()]);
    }
  }

  /**
   * Gets the search result for a specific note
   */
  protected getSearchResult(noteId: string): SearchResult | undefined {
    return this.searchResults().find((r) => r.note.id === noteId);
  }

  /**
   * Expands all folders in the tree (used when searching)
   */
  private expandAllFolders(nodes: NoteTreeNode[]): void {
    for (const node of nodes) {
      if (isFolder(node)) {
        node.expanded = true;
        this.expandAllFolders(node.children);
      }
    }
  }

  /**
   * Builds a filtered tree showing only matched notes and their parent folders
   */
  private buildFilteredTree(
    nodes: NoteTreeNode[],
    results: SearchResult[]
  ): NoteTreeNode[] {
    const matchedNoteIds = new Set(results.map((r) => r.note.id));
    const filteredNodes: NoteTreeNode[] = [];

    for (const node of nodes) {
      if (isNote(node)) {
        // Include only matched notes
        if (matchedNoteIds.has(node.id)) {
          filteredNodes.push(node);
        }
      } else if (isFolder(node)) {
        // Recursively filter children
        const filteredChildren = this.buildFilteredTree(node.children, results);

        // Include folder only if it has matched children
        if (filteredChildren.length > 0) {
          filteredNodes.push({
            ...node,
            children: filteredChildren,
            expanded: true, // Auto-expand when filtering
          });
        }
      }
    }

    return filteredNodes;
  }

  /**
   * Track by function for ngFor performance optimization
   */
  protected trackNode(index: number, node: NoteTreeNode): string {
    return isNote(node) ? node.id : `folder-${index}`;
  }

  /**
   * Expands folders to show the currently active note
   */
  private expandToCurrentRoute(): void {
    // Get current route
    const url = this.router.url;
    const match = url.match(/\/Malons-Marvelous-Misadventures\/(.+)/);

    if (!match) return;

    const noteId = match[1];
    const tree = this.allTreeNodes();

    // Find and expand the path to this note
    if (this.expandPathToNote(tree, noteId)) {
      // Trigger change detection
      this.allTreeNodes.set([...tree]);
    }
  }

  /**
   * Recursively searches for a note and expands all parent folders
   * Returns true if the note was found
   */
  private expandPathToNote(
    nodes: NoteTreeNode[],
    targetNoteId: string
  ): boolean {
    for (const node of nodes) {
      if (isNote(node) && node.id === targetNoteId) {
        return true;
      }

      if (isFolder(node)) {
        // Recursively check children
        if (this.expandPathToNote(node.children, targetNoteId)) {
          // If found in children, expand this folder
          node.expanded = true;
          return true;
        }
      }
    }

    return false;
  }
}
