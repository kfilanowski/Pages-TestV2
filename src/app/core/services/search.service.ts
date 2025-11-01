import { Injectable, inject } from '@angular/core';
import {
  BehaviorSubject,
  firstValueFrom,
  filter,
  take,
} from 'rxjs';
import Fuse, { FuseResultMatch } from 'fuse.js';
import { MarkdownService } from './markdown.service';
import { Note, SearchIndexEntry } from '../interfaces';

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
 * Extended search entry with note reference for results
 */
interface SearchableEntry extends SearchIndexEntry {
  note?: Note; // Populated from notesMap for results
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
  private readonly markdownService = inject(MarkdownService);

  // Searchable entries from pre-built index
  private searchableEntries: SearchableEntry[] = [];
  private searchIndexLoaded = false;

  // Current search query
  private readonly searchQuerySubject = new BehaviorSubject<string>('');
  public readonly searchQuery$ = this.searchQuerySubject.asObservable();

  // Search results
  private readonly searchResultsSubject = new BehaviorSubject<SearchResult[]>(
    []
  );
  public readonly searchResults$ = this.searchResultsSubject.asObservable();

  // Fuse.js instance
  private fuse?: Fuse<SearchableEntry>;

  constructor() {
    // Don't load search index immediately - load only when user actually searches
    // This improves initial page load performance
  }

  /**
   * Initialize the search by loading the pre-built search index
   * Much faster than loading individual markdown files
   */
  private async initializeSearch(): Promise<void> {
    if (this.searchIndexLoaded) {
      return; // Already initialized
    }

    console.log('Loading search index...');

    // Wait for manifest to load
    await firstValueFrom(
      this.markdownService.manifestLoaded$.pipe(
        filter((loaded) => loaded === true),
        take(1)
      )
    );

    // Load pre-built search index
    const searchIndex = await firstValueFrom(
      this.markdownService.loadSearchIndex()
    );

    if (!searchIndex) {
      console.error('Failed to load search index');
      this.searchIndexLoaded = true;
      return;
    }

    // Get notes map for linking search entries to note metadata
    const notesMap = this.markdownService.getNotesMap();

    // Build searchable entries with note references
    this.searchableEntries = searchIndex.entries.map((entry) => ({
      ...entry,
      note: notesMap.get(entry.id),
    }));

    this.searchIndexLoaded = true;

    // Initialize Fuse.js
    this.initializeFuse();
    console.log(`Search ready with ${this.searchableEntries.length} entries`);
  }

  /**
   * Ensures search is initialized when user starts searching
   */
  private async ensureSearchInitialized(): Promise<void> {
    if (!this.searchIndexLoaded) {
      await this.initializeSearch();
    }
  }


  /**
   * Initializes Fuse.js with the loaded search entries
   */
  private initializeFuse(): void {
    this.fuse = new Fuse(this.searchableEntries, {
      keys: [
        {
          name: 'title',
          weight: 3, // Title matches are most important
        },
        {
          name: 'aliases',
          weight: 2, // Alias matches are also important
        },
        {
          name: 'content',
          weight: 1, // Content matches have lower priority
        },
      ],
      includeScore: true,
      includeMatches: true,
      threshold: 0.1, // Slightly relaxed for better results with aliases
      minMatchCharLength: 2,
      ignoreLocation: true, // Search entire content, not just beginning
    });
  }

  /**
   * Performs a fuzzy search on notes
   */
  public async search(query: string): Promise<void> {
    this.searchQuerySubject.next(query);

    if (!query.trim()) {
      this.searchResultsSubject.next([]);
      return;
    }

    // Ensure search is initialized if user is searching
    await this.ensureSearchInitialized();

    if (!this.fuse) {
      console.warn('Search index not ready yet');
      this.searchResultsSubject.next([]);
      return;
    }

    const fuseResults = this.fuse.search(query);

    const searchResults: SearchResult[] = fuseResults
      .filter((result) => result.item.note) // Only include entries with valid notes
      .map((result) => {
        const entry = result.item;
        const note = entry.note!; // Safe because we filtered above
        const matches = result.matches || [];

        // Find title and content matches
        const titleMatch = matches.find((m) => m.key === 'title');
        const contentMatch = matches.find((m) => m.key === 'content');

        // Extract a snippet of the matched content
        let matchedText: string | undefined;
        if (
          contentMatch &&
          contentMatch.indices &&
          contentMatch.indices.length > 0
        ) {
          const firstMatch = contentMatch.indices[0];
          const content = entry.content || '';

          // Get context around the match
          const matchStart = firstMatch[0];
          const matchEnd = firstMatch[1] + 1;
          const contextBefore = 50;
          const contextAfter = 50;

          const startIdx = Math.max(0, matchStart - contextBefore);
          const endIdx = Math.min(content.length, matchEnd + contextAfter);

          let snippet = content.substring(startIdx, endIdx).trim();

          // Normalize whitespace
          snippet = snippet.replace(/\s+/g, ' ').trim();

          // Highlight the matched text
          const matchedWord = content.substring(matchStart, matchEnd);
          const escapedWord = matchedWord.replace(
            /[.*+?^${}()|[\]\\]/g,
            '\\$&'
          );
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
