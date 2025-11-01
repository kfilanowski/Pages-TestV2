import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  BehaviorSubject,
  Observable,
  combineLatest,
  map,
  firstValueFrom,
} from 'rxjs';
import Fuse, { FuseResultMatch } from 'fuse.js';
import { MarkdownService } from './markdown.service';
import { Note, NoteTreeNode, isNote, isFolder } from '../interfaces';

/**
 * Result of a search operation containing the note and match details
 */
export interface SearchResult {
  note: Note;
  titleMatch?: FuseResultMatch;
  contentMatch?: FuseResultMatch;
  matchedText?: string;
  score: number;
}

/**
 * Extended Note interface with content for searching
 */
interface SearchableNote extends Note {
  rawContent?: string;
}

/**
 * Service responsible for fuzzy searching notes by title and content
 *
 * Design decisions:
 * - Uses Fuse.js for fuzzy search algorithm
 * - Searches both note titles and content
 * - Maintains reactive search state
 * - Returns results with match highlighting information
 * - Follows Single Responsibility Principle
 */
@Injectable({
  providedIn: 'root',
})
export class SearchService {
  private readonly http = inject(HttpClient);
  private readonly markdownService = inject(MarkdownService);

  // Cache of notes with their content loaded
  private searchableNotes: SearchableNote[] = [];
  private notesLoadingComplete = false;

  // Current search query
  private readonly searchQuerySubject = new BehaviorSubject<string>('');
  public readonly searchQuery$ = this.searchQuerySubject.asObservable();

  // Search results
  private readonly searchResultsSubject = new BehaviorSubject<SearchResult[]>(
    []
  );
  public readonly searchResults$ = this.searchResultsSubject.asObservable();

  // Fuse.js instance
  private fuse?: Fuse<SearchableNote>;

  constructor() {
    // Don't load all notes immediately - wait until search is first used or after initial page load
    // This prevents blocking the initial page render
    if (typeof window !== 'undefined') {
      // Delay initialization until after initial page load
      setTimeout(() => {
        this.initializeSearch();
      }, 3000); // Initialize search 3 seconds after page load
    }
  }

  /**
   * Initialize the search by loading all notes and their content
   * Can be called manually to initialize earlier if needed
   */
  private initializeSearch(): void {
    if (this.notesLoadingComplete) {
      return; // Already initialized
    }

    // Wait for manifest to load, then load all note contents
    combineLatest([
      this.markdownService.notesTree$,
      this.markdownService.manifestLoaded$,
    ])
      .pipe(
        map(([tree, loaded]) => {
          if (!loaded || this.notesLoadingComplete) {
            return [];
          }

          // Extract all notes from tree
          const notes: Note[] = [];
          this.extractNotes(tree, notes);
          return notes;
        })
      )
      .subscribe((notes) => {
        if (notes.length === 0 || this.notesLoadingComplete) {
          return;
        }

        // Load content for all notes
        this.loadNoteContents(notes);
      });
  }

  /**
   * Ensures search is initialized when user starts searching
   */
  private ensureSearchInitialized(): void {
    if (!this.notesLoadingComplete && !this.fuse) {
      // Initialize immediately if user is searching
      this.initializeSearch();
    }
  }

  /**
   * Recursively extracts all notes from the tree structure
   */
  private extractNotes(nodes: NoteTreeNode[], output: Note[]): void {
    for (const node of nodes) {
      if (isNote(node)) {
        output.push(node);
      } else if (isFolder(node)) {
        this.extractNotes(node.children, output);
      }
    }
  }

  /**
   * Loads raw content for all notes to enable content searching
   */
  private loadNoteContents(notes: Note[]): void {
    this.notesLoadingComplete = true;
    const loadPromises = notes.map((note) => this.loadNoteRawContent(note));

    Promise.all(loadPromises).then(() => {
      this.initializeFuse();
    });
  }

  /**
   * Loads raw markdown content for a single note
   */
  private async loadNoteRawContent(note: Note): Promise<void> {
    const notePath = `assets/Malon's Marvelous Misadventures/${note.path}`;

    try {
      const content = await firstValueFrom(
        this.http.get(notePath, { responseType: 'text' })
      );
      this.searchableNotes.push({
        ...note,
        rawContent: content,
      });
    } catch (error) {
      console.warn(`Failed to load content for ${note.id}:`, error);
      // Still add the note without content so it can be searched by title
      this.searchableNotes.push({
        ...note,
        rawContent: '',
      });
    }
  }

  /**
   * Initializes Fuse.js with the loaded notes
   */
  private initializeFuse(): void {
    this.fuse = new Fuse(this.searchableNotes, {
      keys: [
        {
          name: 'title',
          weight: 2, // Title matches are more important
        },
        {
          name: 'rawContent',
          weight: 1,
        },
      ],
      includeScore: true,
      includeMatches: true,
      threshold: 0.2, // 0 = perfect match, 1 = match anything (reduced for stricter matching)
      minMatchCharLength: 2,
      ignoreLocation: true, // Search entire content, not just beginning
    });
  }

  /**
   * Performs a fuzzy search on notes
   */
  public search(query: string): void {
    this.searchQuerySubject.next(query);

    // Ensure search is initialized if user is searching
    this.ensureSearchInitialized();

    if (!query.trim() || !this.fuse) {
      // If fuse isn't ready yet, show message or wait for initialization
      if (query.trim() && !this.fuse) {
        // Search is still loading, try again in a moment
        setTimeout(() => {
          if (this.fuse) {
            this.search(query);
          } else {
            this.searchResultsSubject.next([]);
          }
        }, 100);
      } else {
        this.searchResultsSubject.next([]);
      }
      return;
    }

    const fuseResults = this.fuse.search(query);

    const searchResults: SearchResult[] = fuseResults.map((result) => {
      const note = result.item;
      const matches = result.matches || [];

      // Find title and content matches
      const titleMatch = matches.find((m) => m.key === 'title');
      const contentMatch = matches.find((m) => m.key === 'rawContent');

      // Extract a snippet of the matched content
      let matchedText: string | undefined;
      if (
        contentMatch &&
        contentMatch.indices &&
        contentMatch.indices.length > 0
      ) {
        const firstMatch = contentMatch.indices[0];
        const content = note.rawContent || '';

        // Get more context around the match
        const matchStart = firstMatch[0];
        const matchEnd = firstMatch[1] + 1;
        const contextBefore = 50;
        const contextAfter = 50;

        const startIdx = Math.max(0, matchStart - contextBefore);
        const endIdx = Math.min(content.length, matchEnd + contextAfter);

        let snippet = content.substring(startIdx, endIdx).trim();

        // Clean up markdown formatting for display
        snippet = snippet
          .replace(/^#+\s/gm, '') // Remove headers
          .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold
          .replace(/\*(.+?)\*/g, '$1') // Remove italic
          .replace(/\[\[(.+?)\]\]/g, '$1') // Remove wiki-links
          .replace(/\n+/g, ' ') // Replace newlines with spaces
          .replace(/\s+/g, ' ') // Normalize whitespace
          .trim();

        // Highlight the actual matched text within the snippet
        const matchedWord = content.substring(matchStart, matchEnd);
        const escapedWord = matchedWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${escapedWord})`, 'gi');
        snippet = snippet.replace(regex, '★$1★');

        if (startIdx > 0) {
          snippet = '...' + snippet;
        }
        if (endIdx < content.length) {
          snippet = snippet + '...';
        }

        matchedText = snippet;
      }

      return {
        note,
        titleMatch,
        contentMatch,
        matchedText,
        score: result.score || 0,
      };
    });

    this.searchResultsSubject.next(searchResults);
  }

  /**
   * Clears the current search
   */
  public clearSearch(): void {
    this.searchQuerySubject.next('');
    this.searchResultsSubject.next([]);
  }

  /**
   * Gets the current search query
   */
  public getCurrentQuery(): string {
    return this.searchQuerySubject.value;
  }

  /**
   * Checks if there is an active search
   */
  public hasActiveSearch(): boolean {
    return this.searchQuerySubject.value.trim().length > 0;
  }
}
