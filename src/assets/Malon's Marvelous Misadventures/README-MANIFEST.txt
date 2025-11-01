⚠️  IMPORTANT: Do NOT manually edit manifest.json ⚠️

The manifest.json file is automatically generated from your markdown files.

HOW TO UPDATE THE MANIFEST:
===========================

1. Add/remove/rename your .md files as needed
2. Run: npm run generate:manifest
3. Done! The manifest is updated automatically.

The manifest is also auto-generated:
- Before every build (npm run build, npm start)
- On GitHub push (via GitHub Actions)
- You can also manually trigger it via GitHub Actions

WHAT THE MANIFEST DOES:
========================

- Scans all folders and .md files in this directory
- Creates a tree structure for navigation
- Extracts frontmatter metadata (like icons)
- Generates the 5,000+ line manifest.json file

ADDING ICONS TO NOTES:
======================

Add frontmatter to your .md files:

---
icon: book
---

# Your Note Title

Content here...

NEED HELP?
==========

See: scripts/README.md for full documentation

