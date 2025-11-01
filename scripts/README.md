# Scripts

This directory contains utility scripts for the project.

## generate-manifest.js

**Purpose:** Automatically generates `manifest.json` from your markdown files.

**What it does:**
- Scans `src/assets/Malon's Marvelous Misadventures/` directory
- Recursively processes all folders and `.md` files
- Extracts frontmatter metadata (like icons)
- Generates a tree structure for navigation
- Outputs to `manifest.json` (5,000+ lines)

### Manual Usage

```bash
npm run generate:manifest
```

### Automatic Usage

The manifest is **automatically generated** in these scenarios:

1. **Before every build** - `npm run build` or `npm start`
2. **On GitHub push** - Via GitHub Actions when you push `.md` file changes
3. **Manual trigger** - Via GitHub Actions "Run workflow" button

### When You Need It

Run this whenever you:
- ✅ Add new markdown files
- ✅ Delete markdown files
- ✅ Rename files or folders
- ✅ Rearrange folder structure
- ✅ Add/change frontmatter (like icons)

### Frontmatter Support

You can add metadata to your markdown files:

```markdown
---
icon: book
---

# My Note Title

Content goes here...
```

The `icon` field will be included in the manifest and can be used by the UI.

### Output Format

```json
{
  "version": "1.0",
  "rootPath": "assets/Malon's Marvelous Misadventures",
  "tree": [
    {
      "name": "Folder Name",
      "children": [...],
      "expanded": false
    },
    {
      "id": "Note Title",
      "title": "Note Title",
      "path": "Folder/Note Title.md",
      "fileName": "Note Title.md",
      "icon": "book"
    }
  ]
}
```

### Important Notes

- **DO NOT manually edit `manifest.json`** - It will be overwritten
- The script skips hidden files (starting with `.`)
- Empty folders are automatically excluded
- Files are sorted: folders first, then files, alphabetically

### Troubleshooting

**Q: Manifest is outdated after adding files**  
A: Run `npm run generate:manifest` manually

**Q: New file not appearing in the app**  
A: Make sure you regenerated the manifest and restarted the dev server

**Q: Icon not showing**  
A: Check that the frontmatter is formatted correctly with `---` delimiters

