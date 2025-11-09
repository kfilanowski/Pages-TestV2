const fs = require("fs");
const path = require("path");

/**
 * Comprehensive build script that generates all data files needed for the static site:
 * 1. manifest.json - Tree structure with frontmatter metadata
 * 2. search-index.json - Pre-processed content for fast client-side search
 * 3. reference-graph.json - Pre-computed wiki-links and backlinks
 *
 * Design principles:
 * - Single build pass through all files for efficiency
 * - Separation of concerns: each output file has a specific purpose
 * - Clean architecture: clear data structures and interfaces
 */

const NOTES_DIR = path.join(
  __dirname,
  "..",
  "src",
  "assets"
);

const OUTPUT_MANIFEST = path.join(NOTES_DIR, "manifest.json");
const OUTPUT_SEARCH_INDEX = path.join(NOTES_DIR, "search-index.json");
const OUTPUT_REFERENCE_GRAPH = path.join(NOTES_DIR, "reference-graph.json");

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Checks if a path is a directory
 */
function isDirectory(filePath) {
  return fs.statSync(filePath).isDirectory();
}

/**
 * Checks if a file is a markdown file
 */
function isMarkdownFile(fileName) {
  return fileName.endsWith(".md");
}

/**
 * Generates a unique ID from a file name (removes .md extension)
 */
function generateId(name) {
  return name.replace(/\.md$/, "");
}

/**
 * Extracts frontmatter from markdown content
 * Handles various YAML frontmatter formats including arrays
 * Returns an object with frontmatter properties or null if no frontmatter
 */
function extractFrontmatter(content) {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return null;
  }

  const frontmatterContent = match[1];
  const frontmatter = {};

  const lines = frontmatterContent.split("\n");
  let currentKey = null;
  let currentArray = null;

  for (const line of lines) {
    // Check if this is an array item (starts with "  - ")
    if (line.match(/^\s+-\s+/)) {
      if (currentArray) {
        const value = line.replace(/^\s+-\s+/, "").trim();
        currentArray.push(value);
      }
      continue;
    }

    // Check if this is a key-value pair
    const colonIndex = line.indexOf(":");
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim();
      const value = line.substring(colonIndex + 1).trim();

      currentKey = key;

      // If value is empty, next lines might be an array
      if (!value) {
        currentArray = [];
        frontmatter[key] = currentArray;
      } else {
        frontmatter[key] = value;
        currentArray = null;
      }
    }
  }

  return frontmatter;
}

/**
 * Strips markdown formatting and returns plain text
 * Removes headers, bold, italic, wiki-links, code blocks, etc.
 */
function stripMarkdown(markdown) {
  // Remove YAML frontmatter
  let content = markdown.replace(/^---\s*\n[\s\S]*?\n---\s*\n/, "");

  // Remove code blocks
  content = content.replace(/```[\s\S]*?```/g, "");
  content = content.replace(/`[^`]+`/g, "");

  // Remove headers
  content = content.replace(/^#+\s/gm, "");

  // Remove bold and italic
  content = content.replace(/\*\*(.+?)\*\*/g, "$1");
  content = content.replace(/\*(.+?)\*/g, "$1");
  content = content.replace(/__(.+?)__/g, "$1");
  content = content.replace(/_(.+?)_/g, "$1");

  // Remove wiki-links but keep the text - [[link]] or [[link|display text]]
  content = content.replace(/\[\[([^\]|]+)(\|([^\]]+))?\]\]/g, (match, link, _, displayText) => {
    return displayText ? displayText : link;
  });

  // Remove wiki-links in markdown format but keep the text - [text](wiki:link)
  content = content.replace(/\[([^\]]+)\]\(wiki:[^)]+\)/g, "$1");

  // Remove regular markdown links but keep the text
  content = content.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

  // Remove images
  content = content.replace(/!\[([^\]]*)\]\([^)]+\)/g, "");

  // Remove custom color syntax
  content = content.replace(/~=\{[^}]+\}(.+?)=~/g, "$1");

  // Remove custom icon syntax
  content = content.replace(/:icon:[a-z0-9-]+(?:\|\d+)?(?:\|[a-z#0-9]+)?:/gi, "");

  // Remove HTML tags
  content = content.replace(/<[^>]+>/g, "");

  // Normalize whitespace
  content = content.replace(/\n+/g, " ");
  content = content.replace(/\s+/g, " ");

  return content.trim();
}

/**
 * Extracts wiki-links from markdown content
 * Returns an array of note IDs that are referenced
 * Supports both [[link]] and [text](wiki:link) formats
 */
function extractWikiLinks(markdown) {
  const links = [];
  
  // Extract [[link]] or [[link|display text]] format
  const doubleBracketRegex = /\[\[([^\]|]+)(\|([^\]]+))?\]\]/g;
  let match;

  while ((match = doubleBracketRegex.exec(markdown)) !== null) {
    const noteId = match[1].trim();
    if (noteId) {
      links.push(noteId);
    }
  }

  // Extract [text](wiki:link) format
  const markdownWikiRegex = /\[([^\]]+)\]\(wiki:([^)]+)\)/g;
  while ((match = markdownWikiRegex.exec(markdown)) !== null) {
    const noteId = match[2].trim();
    if (noteId) {
      links.push(noteId);
    }
  }

  // Return unique links
  return [...new Set(links)];
}

// ============================================================================
// Data Collection
// ============================================================================

// Storage for all data we'll collect
const allNotes = new Map(); // noteId -> { id, title, path, frontmatter }
const searchEntries = []; // Array of { id, title, content, path }
const outgoingLinks = new Map(); // noteId -> [targetNoteIds]

/**
 * Recursively builds the tree structure and collects data
 */
function buildTreeAndCollectData(dirPath, relativePath = "") {
  const items = fs.readdirSync(dirPath);
  const tree = [];

  // Sort items: folders first, then files, alphabetically
  const sortedItems = items.sort((a, b) => {
    const aPath = path.join(dirPath, a);
    const bPath = path.join(dirPath, b);
    const aIsDir = isDirectory(aPath);
    const bIsDir = isDirectory(bPath);

    if (aIsDir && !bIsDir) return -1;
    if (!aIsDir && bIsDir) return 1;
    return a.localeCompare(b);
  });

  for (const item of sortedItems) {
    const itemPath = path.join(dirPath, item);
    const itemRelativePath = relativePath ? `${relativePath}/${item}` : item;

    // Skip generated files and hidden files
    if (
      item === "manifest.json" ||
      item === "search-index.json" ||
      item === "reference-graph.json" ||
      item.startsWith(".")
    ) {
      continue;
    }

    if (isDirectory(itemPath)) {
      // Recursively process folder
      const children = buildTreeAndCollectData(itemPath, itemRelativePath);

      if (children.length > 0) {
        tree.push({
          name: item,
          children: children,
          expanded: false,
        });
      }
    } else if (isMarkdownFile(item)) {
      const id = generateId(item);
      
      try {
        const content = fs.readFileSync(itemPath, "utf-8");
        const frontmatter = extractFrontmatter(content);
        const plainContent = stripMarkdown(content);
        const wikiLinks = extractWikiLinks(content);

        // Create note data for manifest
        const noteData = {
          id: id,
          title: id,
          path: itemRelativePath,
          fileName: item,
        };

        // Add frontmatter fields if they exist
        if (frontmatter) {
          if (frontmatter.icon) {
            noteData.icon = frontmatter.icon;
          }
          if (frontmatter.aliases) {
            noteData.aliases = Array.isArray(frontmatter.aliases)
              ? frontmatter.aliases
              : [frontmatter.aliases];
          }
          if (frontmatter.tags) {
            noteData.tags = Array.isArray(frontmatter.tags)
              ? frontmatter.tags
              : [frontmatter.tags];
          }
        }

        // Store note data
        allNotes.set(id, noteData);

        // Add to search index
        searchEntries.push({
          id: id,
          title: id,
          content: plainContent,
          path: itemRelativePath,
          aliases: noteData.aliases || [],
        });

        // Store outgoing links
        if (wikiLinks.length > 0) {
          outgoingLinks.set(id, wikiLinks);
        }

        // Add to tree
        tree.push(noteData);
      } catch (error) {
        console.warn(`Error processing file ${item}:`, error.message);
        
        // Add minimal note data even if processing fails
        const noteData = {
          id: id,
          title: id,
          path: itemRelativePath,
          fileName: item,
        };
        
        allNotes.set(id, noteData);
        tree.push(noteData);
      }
    }
  }

  return tree;
}

/**
 * Builds the incoming links map (backlinks) from outgoing links
 */
function buildIncomingLinks() {
  const incomingLinks = new Map();

  // Initialize empty sets for all notes
  for (const noteId of allNotes.keys()) {
    incomingLinks.set(noteId, []);
  }

  // Build backlinks from outgoing links
  for (const [sourceId, targetIds] of outgoingLinks.entries()) {
    for (const targetId of targetIds) {
      if (!incomingLinks.has(targetId)) {
        incomingLinks.set(targetId, []);
      }
      incomingLinks.get(targetId).push(sourceId);
    }
  }

  // Sort each array and remove duplicates
  for (const [noteId, links] of incomingLinks.entries()) {
    const uniqueLinks = [...new Set(links)].sort();
    incomingLinks.set(noteId, uniqueLinks);
  }

  return incomingLinks;
}

// ============================================================================
// File Generation
// ============================================================================

/**
 * Generates manifest.json with tree structure and metadata
 */
function generateManifest(tree) {
  const manifest = {
    version: "1.0",
    rootPath: "assets",
    tree: tree,
  };

  fs.writeFileSync(OUTPUT_MANIFEST, JSON.stringify(manifest, null, 2));
  console.log("✓ Generated manifest.json");
  console.log(`  - ${allNotes.size} notes`);
}

/**
 * Generates search-index.json with pre-processed content
 */
function generateSearchIndex() {
  const searchIndex = {
    version: "1.0",
    entries: searchEntries,
  };

  fs.writeFileSync(OUTPUT_SEARCH_INDEX, JSON.stringify(searchIndex, null, 2));
  console.log("✓ Generated search-index.json");
  console.log(`  - ${searchEntries.length} searchable entries`);
  
  // Calculate approximate size
  const sizeKB = (JSON.stringify(searchIndex).length / 1024).toFixed(2);
  console.log(`  - Approximate size: ${sizeKB} KB`);
}

/**
 * Generates reference-graph.json with wiki-links and backlinks
 */
function generateReferenceGraph() {
  const incomingLinks = buildIncomingLinks();

  // Convert Maps to plain objects for JSON serialization
  const outgoingLinksObj = {};
  for (const [noteId, links] of outgoingLinks.entries()) {
    // Sort and deduplicate
    outgoingLinksObj[noteId] = [...new Set(links)].sort();
  }

  const incomingLinksObj = {};
  for (const [noteId, links] of incomingLinks.entries()) {
    // Only include if there are actual backlinks
    if (links.length > 0) {
      incomingLinksObj[noteId] = links;
    }
  }

  const referenceGraph = {
    version: "1.0",
    outgoingLinks: outgoingLinksObj,
    incomingLinks: incomingLinksObj,
  };

  fs.writeFileSync(
    OUTPUT_REFERENCE_GRAPH,
    JSON.stringify(referenceGraph, null, 2)
  );
  console.log("✓ Generated reference-graph.json");
  console.log(`  - ${Object.keys(outgoingLinksObj).length} notes with outgoing links`);
  console.log(`  - ${Object.keys(incomingLinksObj).length} notes with incoming links`);
}

// ============================================================================
// Main Execution
// ============================================================================

function main() {
  console.log("========================================");
  console.log("Generating data files...");
  console.log("========================================");
  console.log();

  if (!fs.existsSync(NOTES_DIR)) {
    console.error("❌ Notes directory does not exist:", NOTES_DIR);
    process.exit(1);
  }

  console.log("📁 Scanning directory:", NOTES_DIR);
  console.log();

  // Build tree and collect all data in one pass
  const tree = buildTreeAndCollectData(NOTES_DIR);

  // Generate all output files
  generateManifest(tree);
  generateSearchIndex();
  generateReferenceGraph();

  console.log();
  console.log("========================================");
  console.log("✨ All data files generated successfully!");
  console.log("========================================");
}

// Run the script
try {
  main();
} catch (error) {
  console.error("❌ Error generating data files:", error);
  process.exit(1);
}

