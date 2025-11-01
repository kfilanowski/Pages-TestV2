/**
 * Represents a single note (markdown file) in the system
 */
export interface Note {
  id: string;
  title: string;
  path: string;
  fileName: string;
  content?: string;
  icon?: string; // Material icon name from frontmatter
}

/**
 * Represents a folder node in the navigation tree
 */
export interface NoteFolder {
  name: string;
  path: string;
  expanded?: boolean;
  children: NoteTreeNode[];
}

/**
 * Union type for tree nodes - can be either a folder or a note
 */
export type NoteTreeNode = Note | NoteFolder;

/**
 * Type guard to check if a node is a folder
 */
export function isFolder(node: NoteTreeNode): node is NoteFolder {
  return 'children' in node;
}

/**
 * Type guard to check if a node is a note
 */
export function isNote(node: NoteTreeNode): node is Note {
  return 'fileName' in node;
}

/**
 * Configuration for the notes manifest
 * This describes the entire structure of your notes directory
 */
export interface NotesManifest {
  version: string;
  rootPath: string;
  tree: NoteTreeNode[];
}
