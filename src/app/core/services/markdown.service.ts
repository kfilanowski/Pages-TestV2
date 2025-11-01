import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  Observable,
  of,
  BehaviorSubject,
  map,
  tap,
  catchError,
  take,
  switchMap,
  filter,
  forkJoin,
} from 'rxjs';
import { marked } from 'marked';
import {
  Note,
  NoteFolder,
  NoteTreeNode,
  NotesManifest,
  isNote,
  isFolder,
} from '../interfaces';

/**
 * Service responsible for loading, parsing, and managing Obsidian markdown notes.
 *
 * Design decisions:
 * - Uses marked library for markdown parsing with custom renderer for wiki-links
 * - Caches loaded notes to minimize HTTP requests
 * - Provides reactive state management using BehaviorSubject
 * - Follows Single Responsibility Principle (SRP): handles only markdown/notes operations
 */
@Injectable({
  providedIn: 'root',
})
export class MarkdownService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  // Cache for loaded notes to avoid redundant HTTP requests
  private readonly notesCache = new Map<string, string>();

  // Reactive state for the notes tree structure
  private readonly notesTreeSubject = new BehaviorSubject<NoteTreeNode[]>([]);
  public readonly notesTree$ = this.notesTreeSubject.asObservable();

  // Flat map of all notes for quick lookup (used for wiki-links)
  private readonly notesMap = new Map<string, Note>();

  // Track references between notes (noteId -> Set of noteIds it references)
  private readonly outgoingLinks = new Map<string, Set<string>>();
  // Track backlinks (noteId -> Set of noteIds that reference it)
  private readonly incomingLinks = new Map<string, Set<string>>();

  // Track if manifest is loaded
  private readonly manifestLoadedSubject = new BehaviorSubject<boolean>(false);
  public readonly manifestLoaded$ = this.manifestLoadedSubject.asObservable();

  // Track if reference graph is built
  private readonly referenceGraphReadySubject = new BehaviorSubject<boolean>(
    false
  );
  public readonly referenceGraphReady$ =
    this.referenceGraphReadySubject.asObservable();

  constructor() {
    this.configureMarked();
    // Only load manifest in browser to avoid SSR issues
    if (this.isBrowser) {
      this.loadManifest();
      // Delay reference graph building until after initial page load
      // This prevents blocking the first note from loading
      setTimeout(() => {
        this.buildReferencesGraph();
      }, 2000); // Build graph 2 seconds after page load
    }
  }

  /**
   * Configures the marked library with custom renderers for Obsidian syntax
   */
  private configureMarked(): void {
    const renderer = new marked.Renderer();

    // Override link renderer to handle wiki-links [[link]]
    const originalLink = renderer.link;
    renderer.link = function (token: any): string {
      const href = token.href;
      const title = token.title;
      const text = token.text;

      // Check if this is a wiki-link (will be processed before this in preprocessing)
      if (href && href.startsWith('wiki:')) {
        const noteId = href.substring(5); // Remove 'wiki:' prefix
        const displayText = text || noteId;

        // Note: data-note-id is preserved by Angular's sanitizer, but data-preview-enabled would be stripped
        return `<a href="/Malons-Marvelous-Misadventures/${noteId}" class="wiki-link" data-note-id="${noteId}">${displayText}</a>`;
      }

      // Use original renderer for normal links
      return originalLink.call(this, token);
    };

    marked.setOptions({
      renderer,
      gfm: true, // GitHub Flavored Markdown
      breaks: true, // Convert \n to <br>
    });
  }

  /**
   * Loads the notes manifest file which describes the folder structure
   */
  private loadManifest(): void {
    this.http
      .get<NotesManifest>(
        "assets/Malon's Marvelous Misadventures/manifest.json"
      )
      .pipe(
        tap((manifest) => {
          this.notesTreeSubject.next(manifest.tree);
          this.buildNotesMap(manifest.tree);
          this.manifestLoadedSubject.next(true);
        }),
        catchError((error) => {
          console.error('Failed to load notes manifest:', error);
          this.manifestLoadedSubject.next(true); // Mark as loaded even on error
          return of({
            version: '1.0',
            rootPath: "assets/Malon's Marvelous Misadventures",
            tree: [],
          } as NotesManifest);
        })
      )
      .subscribe();
  }

  /**
   * Builds a flat map of all notes for quick lookup by ID
   * Used for resolving wiki-links and generating previews
   */
  private buildNotesMap(nodes: NoteTreeNode[]): void {
    for (const node of nodes) {
      if (isNote(node)) {
        this.notesMap.set(node.id, node);
      } else if (isFolder(node)) {
        this.buildNotesMap(node.children);
      }
    }
  }

  /**
   * Loads a note's content by its ID
   * Uses caching to avoid redundant HTTP requests
   * Waits for manifest to load before attempting to find the note
   */
  public loadNoteById(noteId: string): Observable<string> {
    // Wait for manifest to load, then find and load the note
    return this.manifestLoaded$.pipe(
      // Wait until manifest is actually loaded (skip initial false)
      filter((loaded) => loaded === true),
      // Take only the first true value
      take(1),
      // Switch to the note loading logic
      switchMap(() => {
        const note = this.notesMap.get(noteId);

        if (!note) {
          console.warn(`Note not found in manifest: ${noteId}`);
          console.log('Available notes:', Array.from(this.notesMap.keys()));
          return of(
            this.parseMarkdown(
              `# Note Not Found\n\nThe note "${noteId}" could not be found.`
            )
          );
        }

        return this.loadNoteContent(note);
      })
    );
  }

  /**
   * Loads and parses a note's content, converting markdown to HTML
   */
  public loadNoteContent(note: Note): Observable<string> {
    // Check cache first
    if (this.notesCache.has(note.id)) {
      return of(this.notesCache.get(note.id)!);
    }

    const notePath = `assets/Malon's Marvelous Misadventures/${note.path}`;

    return this.http.get(notePath, { responseType: 'text' }).pipe(
      map((markdownContent) => this.parseMarkdown(markdownContent)),
      tap((html) => this.notesCache.set(note.id, html)),
      catchError((error) => {
        console.error(`Failed to load note: ${note.path}`, error);
        return of(
          `<h1>Error Loading Note</h1><p>Failed to load "${note.title}"</p>`
        );
      })
    );
  }

  /**
   * Parses markdown content to HTML, handling Obsidian wiki-links
   */
  private parseMarkdown(markdown: string): string {
    // Strip YAML frontmatter (content between --- delimiters at the start)
    const frontmatterRegex = /^---\s*\n[\s\S]*?\n---\s*\n/;
    const contentWithoutFrontmatter = markdown.replace(frontmatterRegex, '');

    // Pre-process wiki-links: [[link]] or [[link|display text]]
    const wikiLinkRegex = /\[\[([^\]|]+)(\|([^\]]+))?\]\]/g;

    const processedMarkdown = contentWithoutFrontmatter.replace(
      wikiLinkRegex,
      (match, link, _, displayText) => {
        const noteId = link.trim();
        const text = displayText ? displayText.trim() : noteId;

        // Convert to a special format that marked will recognize
        return `[${text}](wiki:${noteId})`;
      }
    );

    // Parse markdown to HTML
    return marked.parse(processedMarkdown) as string;
  }

  /**
   * Gets a note by its ID (for preview generation)
   */
  public getNoteById(noteId: string): Note | undefined {
    return this.notesMap.get(noteId);
  }

  /**
   * Generates a preview of a note (first 200 characters of content)
   */
  public generatePreview(noteId: string): Observable<string> {
    const note = this.notesMap.get(noteId);

    if (!note) {
      return of('Note not found');
    }

    const notePath = `assets/Malon's Marvelous Misadventures/${note.path}`;

    return this.http.get(notePath, { responseType: 'text' }).pipe(
      map((content) => {
        // Strip YAML frontmatter first
        const frontmatterRegex = /^---\s*\n[\s\S]*?\n---\s*\n/;
        const contentWithoutFrontmatter = content.replace(frontmatterRegex, '');

        // Remove markdown formatting for preview
        let preview = contentWithoutFrontmatter
          .replace(/^#+\s/gm, '') // Remove headers
          .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold
          .replace(/\*(.+?)\*/g, '$1') // Remove italic
          .replace(/\[\[(.+?)\]\]/g, '$1') // Remove wiki-links
          .replace(/```[\s\S]*?```/g, '') // Remove code blocks
          .trim();

        // Truncate to 200 characters
        if (preview.length > 200) {
          preview = preview.substring(0, 200) + '...';
        }

        return preview;
      }),
      catchError(() => of('Preview unavailable'))
    );
  }

  /**
   * Generates a styled HTML preview of a note showing the full content
   * Returns parsed markdown HTML for better formatting in tooltips
   */
  public generateHtmlPreview(noteId: string): Observable<string> {
    const note = this.notesMap.get(noteId);

    if (!note) {
      return of('<p>Note not found</p>');
    }

    const notePath = `assets/Malon's Marvelous Misadventures/${note.path}`;

    return this.http.get(notePath, { responseType: 'text' }).pipe(
      map((content) => {
        // Parse the full markdown content to HTML
        return this.parseMarkdown(content);
      }),
      catchError(() => of('<p>Preview unavailable</p>'))
    );
  }

  /**
   * Extracts wiki-links from markdown content
   * Returns an array of note IDs that are referenced in the content
   */
  private extractWikiLinks(markdown: string): string[] {
    const wikiLinkRegex = /\[\[([^\]|]+)(\|([^\]]+))?\]\]/g;
    const links: string[] = [];
    let match;

    while ((match = wikiLinkRegex.exec(markdown)) !== null) {
      const noteId = match[1].trim();
      if (noteId) {
        links.push(noteId);
      }
    }

    return links;
  }

  /**
   * Builds the reference graph by loading all notes and extracting their links
   * This creates bidirectional mapping: outgoing links and incoming links (backlinks)
   */
  private buildReferencesGraph(): void {
    this.manifestLoaded$
      .pipe(
        filter((loaded) => loaded === true),
        take(1),
        switchMap(() => {
          // Load all notes and extract their links
          const loadTasks: Observable<void>[] = [];

          for (const [noteId, note] of this.notesMap.entries()) {
            const notePath = `assets/Malon's Marvelous Misadventures/${note.path}`;
            const task = this.http.get(notePath, { responseType: 'text' }).pipe(
              map((content) => {
                // Extract all wiki-links from this note
                const links = this.extractWikiLinks(content);

                // Store outgoing links
                if (links.length > 0) {
                  this.outgoingLinks.set(noteId, new Set(links));

                  // Update incoming links (backlinks)
                  for (const targetNoteId of links) {
                    if (!this.incomingLinks.has(targetNoteId)) {
                      this.incomingLinks.set(targetNoteId, new Set());
                    }
                    this.incomingLinks.get(targetNoteId)!.add(noteId);
                  }
                }
              }),
              catchError((error) => {
                console.warn(
                  `Failed to load note for reference graph: ${note.path}`,
                  error
                );
                return of(void 0);
              })
            );

            loadTasks.push(task);
          }

          // Execute all loading tasks in parallel using forkJoin
          return loadTasks.length > 0 ? forkJoin(loadTasks) : of([]);
        }),
        tap(() => {
          // Mark reference graph as ready
          this.referenceGraphReadySubject.next(true);
          console.log('Reference graph built successfully');
        }),
        catchError((error) => {
          console.error('Error building reference graph:', error);
          this.referenceGraphReadySubject.next(true); // Still mark as done to prevent blocking
          return of([]);
        })
      )
      .subscribe();
  }

  /**
   * Gets all notes that the specified note references (outgoing links)
   * If the reference graph isn't built yet, extracts links from the cached note content
   */
  public getOutgoingLinks(noteId: string): Note[] {
    // If reference graph is ready, use it
    if (this.referenceGraphReadySubject.value) {
      const linkIds = this.outgoingLinks.get(noteId);
      if (!linkIds) {
        return [];
      }

      const notes: Note[] = [];
      for (const linkId of linkIds) {
        const note = this.notesMap.get(linkId);
        if (note) {
          notes.push(note);
        }
      }

      return notes.sort((a, b) => a.title.localeCompare(b.title));
    }

    // Otherwise, extract links from cached note content if available
    const cachedContent = this.notesCache.get(noteId);
    if (cachedContent) {
      // Try to extract links from HTML (wiki-links are converted to <a> tags)
      const linkMatches = cachedContent.match(/data-note-id="([^"]+)"/g);
      if (linkMatches) {
        // Extract unique note IDs
        const uniqueLinkIds = new Set(
          linkMatches
            .map((match) => match.replace('data-note-id="', '').replace('"', ''))
            .filter((id) => this.notesMap.has(id))
        );
        
        const notes: Note[] = [];
        for (const linkId of uniqueLinkIds) {
          const note = this.notesMap.get(linkId);
          if (note) {
            notes.push(note);
          }
        }

        return notes.sort((a, b) => a.title.localeCompare(b.title));
      }
    }

    return [];
  }

  /**
   * Gets all notes that reference the specified note (incoming links/backlinks)
   * Returns empty array if reference graph isn't built yet (backlinks require full graph)
   */
  public getIncomingLinks(noteId: string): Note[] {
    // Backlinks require the full reference graph to be built
    if (!this.referenceGraphReadySubject.value) {
      return [];
    }

    const linkIds = this.incomingLinks.get(noteId);
    if (!linkIds) {
      return [];
    }

    const notes: Note[] = [];
    for (const linkId of linkIds) {
      const note = this.notesMap.get(linkId);
      if (note) {
        notes.push(note);
      }
    }

    return notes.sort((a, b) => a.title.localeCompare(b.title));
  }
}
