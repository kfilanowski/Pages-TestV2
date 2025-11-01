# Icon Usage Guide

This guide shows you how to add icons to your markdown notes!

## 🎯 Quick Start: Adding Icons to Notes

### Step 1: Add Icon to Frontmatter

At the top of any `.md` file, add frontmatter with an `icon` field:

```markdown
---
icon: GiDragonHead
---

# Your Note Title

Your content here...
```

### Step 2: Regenerate Manifest

After adding or changing icons, run:
```bash
npm run generate:data
```
(or `npm run generate:manifest` - they're the same)

### Step 3: Reload Page

The icon will appear:
- Next to the note title in the navigation sidebar
- In the note header when viewing the note
- In wiki-links to that note (if configured)

---

## 🌐 Available Icons (Iconify - 150+ Libraries!)

This project uses **Iconify**, which provides access to **over 200,000 icons** from **150+ icon libraries**. You can use almost any icon without pre-registration!

Browse all available icons at: **https://icon-sets.iconify.design/**

### Most Useful Icon Libraries for D&D/RPG Content:

#### 🎮 **Game Icons** (`Gi`)
**Best for RPG/D&D content** - 4,000+ fantasy, medieval, and gaming icons
- Website: https://game-icons.net/
- Example: `GiDragonHead`, `GiBroadsword`, `GiSpellBook`

#### ✨ **Lucide** (`Lu`)
**Clean, modern icons** - Great for UI elements and simple concepts
- Website: https://lucide.dev/icons/
- Example: `LuSword`, `LuShield`, `LuSparkles`

#### 🎨 **Heroicons** (`Hi`)
**Beautiful, consistent icons** - Good for general UI
- Website: https://heroicons.com/
- Example: `HiSparkles`, `HiShield`, `HiFire`

#### 🔷 **Font Awesome** (`Fa`, `Fas`, `Far`)
**Industry standard** - Huge variety of general-purpose icons
- Website: https://fontawesome.com/icons
- Example: `FaDragon`, `FaScroll`, `FaDiceD20`

#### 📦 **Material Design Icons** (`Md`, `Mi`)
**Google's icon set** - Professional, widely recognized
- Example: `MdCastle`, `MdSecurity`, `MiSword`

---

## 📝 Icon Name Format

Icons use a **prefix + PascalCase name** format:

### Supported Prefixes

The system supports **22 icon prefixes** registered in `icon.service.ts`:

| Prefix | Library | Iconify Collection | Best For |
|--------|---------|-------------------|----------|
| `Gi` | Game Icons | `game-icons` | **RPG/D&D content (HIGHLY recommended!)** |
| `Lu` | Lucide Icons | `lucide` | Clean, modern UI elements |
| `Tb` | Tabler Icons | `tabler` | Consistent, beautiful UI icons |
| `Hi` | Heroicons | `heroicons` | Modern web UI |
| `Bs` | Bootstrap Icons | `bi` | Web UI elements |
| `Fa`, `Fas` | Font Awesome 6 Solid | `fa6-solid` | General-purpose icons |
| `Far` | Font Awesome 6 Regular | `fa6-regular` | Outlined versions |
| `Md` | Material Design Icons | `mdi` | Material Design |
| `Mi` | Material Symbols | `material-symbols` | Google's newer icon set |
| `Ri` | Remix Icons | `ri` | Open-source UI icons |
| `Io` | Ionicons | `ion` | Mobile-friendly icons |
| `Ai` | Ant Design Icons | `ant-design` | Enterprise UI |
| `Si` | Simple Icons | `simple-icons` | Brand/logo icons |
| `Bi` | BoxIcons | `bx` | General web icons |
| `Ra` | Radix Icons | `radix-icons` | Modern UI primitives |
| `Ci` | Cryptocurrency Icons | `cryptocurrency` | Crypto/blockchain |
| `Di` | Devicons | `devicon` | Development tools |
| `Vi` | VSCode Icons | `vscode-icons` | File type icons |
| `Wi` | Weather Icons | `wi` | Weather symbols |
| `Fi` | Feather Icons* | `lucide` | Use `Lu` instead |

*Note: Feather is deprecated; Lucide (`Lu`) is its successor.

### ✨ Auto-Corrected Prefixes

These "incorrect" prefixes **automatically work** through prefix aliases in `IconService`:

| You Write | Auto-Corrects To | Result |
|-----------|-----------------|--------|
| `LiHeart` | `LuHeart` | ✅ Works! (Lucide) |
| `TiRun` | `TbRun` | ✅ Works! (Tabler) |
| `IbTarget` | `IoTarget` | ✅ Works! (Ionicons) |
| `BoBxSwim` | `BiBxSwim` | ✅ Works! (BoxIcons) |
| `CoWaterDrop` | `GiWaterDrop` | ✅ Works! (Game Icons) |

**You don't need to fix these!** The system automatically maps them to the correct prefixes. 

However, it's still better to use the correct prefix from the start for clarity.

### Converting Icon Names to PascalCase

**Website Format → Your Format:**
- Website shows: `"dragon-head"` → Use: `GiDragonHead`
- Website shows: `"shield-alert"` → Use: `LuShieldAlert`
- Website shows: `"magic-swirl"` → Use: `GiMagicSwirl`

**PascalCase Rules:**
1. Capitalize the first letter of each word
2. Remove all spaces and hyphens
3. Add the correct prefix (Gi, Lu, etc.)

Examples:
- `"bow arrow"` → `GiBowArrow`
- `"skull-crossed-bones"` → `GiSkullCrossedBones`
- `"lightning-trio"` → `GiLightningTrio`

### Alternative: Direct Iconify Format

You can also use Iconify's native format directly:
```yaml
icon: game-icons:dragon-head    # Same as GiDragonHead
icon: lucide:sword              # Same as LuSword
icon: heroicons:sparkles        # Same as HiSparkles
```

---

## 🔍 How to Find Icons

### Step 1: Browse Iconify
Go to **https://icon-sets.iconify.design/** and search for what you need.

Example searches:
- "dragon" → Find dragon-related icons
- "sword" → Find weapon icons
- "spell" → Find magic-related icons

### Step 2: Find the Icon Set
Look at the icon's collection name:
- If it's from **"game-icons"** → Use `Gi` prefix
- If it's from **"lucide"** → Use `Lu` prefix  
- If it's from **"heroicons"** → Use `Hi` prefix
- etc.

### Step 3: Convert the Name
- Icon shown as: `game-icons:dragon-head`
- You use: `GiDragonHead`

That's it! No registration needed - if it exists on Iconify, it works!

---

## 📖 Complete Example

Here's a complete markdown file with an icon:

```markdown
---
aliases:
  - DC
  - Target Number
icon: LuTarget
---

# Difficulty Class

**Difficulty Class (DC)** is the target number that a [[Roll]] must reach to be considered a success.

A higher DC means the task is more difficult.

## Common DCs

| Difficulty | DC |
|------------|-----|
| Very Easy | 5 |
| Easy | 10 |
| Medium | 15 |
| Hard | 20 |
```

The `LuTarget` icon will appear:
- In the navigation sidebar next to "Difficulty Class"
- In the page header when viewing this note
- In wiki-links that reference this note

---

## ❓ Troubleshooting

### Icon Not Showing?

Most common issues are **auto-corrected** now! But if you still have problems:

**1. Check the icon name format**
```yaml
❌ icon: dragonhead           # Missing prefix
❌ icon: Gidragonhead         # Not PascalCase
❌ icon: GiDragon_Head        # Underscores not allowed
✅ icon: GiDragonHead         # Correct!
✅ icon: LiDragonHead         # Also works! (auto-corrects to Lu)
✅ icon: game-icons:dragon-head  # Iconify format (also works)
```

**2. Verify the icon exists on Iconify**
- Go to https://icon-sets.iconify.design/
- Search for your icon
- Make sure the icon name matches (case-insensitive, use hyphens)

**3. Check your frontmatter syntax**
```yaml
---
icon: GiDragonHead    # ✅ Correct
---
```
- Must have `---` before and after
- Use `icon:` (lowercase)
- No quotes needed around the icon name
- Icon name must be in PascalCase (or kebab-case for direct Iconify format)

**4. Regenerate the manifest**
```bash
npm run generate:data
```
The manifest file must be regenerated whenever you add or change icons in frontmatter.

**5. Hard refresh the page**
- Windows/Linux: `Ctrl + F5` or `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

### Common Issues

**Issue: "Icon shows as a box or doesn't load"**
- The icon name might not exist in that library
- Check the browser console for the actual Iconify name it's trying to load
- Search for the icon on https://icon-sets.iconify.design/
- Try a similar icon from Game Icons (`Gi` prefix) instead

**Issue: "Changes not appearing"**
- Did you regenerate the manifest? (`npm run generate:data`)
- Did you hard refresh the page?
- Check that the frontmatter is correctly formatted with `---` delimiters

**Issue: "Console shows 'Unknown icon prefix'"**
- Check if the prefix is in the supported list (see table above)
- If it's a common mistake (`Li`, `Ti`, `Bo`, `Ib`, `Co`), it should auto-correct
- If it's a new unsupported prefix, add it to `iconReplacements` in `icon.service.ts`

---

## 🌟 Recommended Icons for Common D&D/RPG Content

### Character Classes
```yaml
icon: GiSwordman        # Fighter/Warrior
icon: GiWizardFace      # Wizard/Mage  
icon: GiBowArrow        # Ranger/Archer
icon: GiDaggerRose      # Rogue/Assassin
icon: GiCrossedBones    # Cleric/Priest
icon: GiMagicSwirl      # Sorcerer
icon: GiMonkFace        # Monk
icon: GiBarbarianHelm   # Barbarian
icon: GiDruidStaff      # Druid
icon: GiGuitar          # Bard
```

### Ability Scores
```yaml
icon: GiMuscleUp        # Strength (STR)
icon: GiQuickSlash      # Dexterity (DEX)
icon: LuHeart           # Constitution (CON)
icon: LuBrain           # Intelligence (INT)
icon: LuEye             # Wisdom (WIS)
icon: LuSparkles        # Charisma (CHA)
```

### Damage Types
```yaml
icon: GiFireBowl        # Fire damage
icon: GiIceBolt         # Cold/Ice damage
icon: GiLightningTrio   # Lightning damage
icon: GiAcid            # Acid damage
icon: GiPoisonGas       # Poison damage
icon: GiDeathSkull      # Necrotic damage
icon: LuSparkles        # Radiant damage
icon: GiPsychicWaves    # Psychic damage
icon: GiSoundWaves      # Thunder damage
icon: LuWind            # Force damage
```

### Equipment Categories
```yaml
icon: GiBroadsword      # Weapons
icon: GiChestArmor      # Armor
icon: GiHealthPotion    # Potions & Consumables
icon: GiSpellBook       # Spell scrolls & books
icon: GiRing            # Magic items & jewelry
icon: GiBackpack        # Adventuring gear
icon: GiTreasureMap     # Maps & documents
icon: GiDiamondRing     # Valuable items
```

### Game Mechanics
```yaml
icon: GiRollingDices    # Dice rolls
icon: LuTarget          # Attack rolls / AC
icon: GiHealing         # Healing
icon: GiPoisonGas       # Status effects (negative)
icon: GiShield          # Defense / Protection
icon: GiRunningShoe     # Movement / Speed
icon: LuClock           # Time / Duration
icon: GiLevelFour       # Character level
```

### Creature Types
```yaml
icon: GiDragonHead      # Dragons
icon: GiGoblin          # Goblins & small humanoids
icon: GiOrcHead         # Orcs & large humanoids
icon: GiZombie          # Undead
icon: GiEvilBat         # Flying creatures
icon: GiSpiderFace      # Monstrosities
icon: GiSpiritHorse     # Celestials/Spirits
icon: GiImperialCrown   # Royalty/Leaders
```

---

## 💡 Pro Tips

### Icon Selection Strategy
1. **Start with Game Icons (`Gi`)** - They have the most RPG-specific content
2. **Use Lucide (`Lu`) for concepts** - Great for abstract ideas (intelligence, wisdom, etc.)
3. **Font Awesome (`Fa`) for general items** - Good for common objects
4. **Search before browsing** - Iconify's search is powerful - try multiple keywords

### Best Practices
- **Be consistent** - Use similar styles for related content (all abilities from one library)
- **Test your icons** - Some icons look different than their name suggests
- **Fallback gracefully** - If no perfect icon exists, use a related one
- **Icons enhance, don't replace** - Good note titles matter more than perfect icons

### Performance Note
Iconify loads icons on-demand, so using many different icon libraries won't slow down your site. Feel free to mix and match!

---

## 🆘 Still Need Help?

### Useful Resources
- **Iconify Icon Sets**: https://icon-sets.iconify.design/ (main search)
- **Game Icons**: https://game-icons.net/ (RPG-focused)
- **Lucide**: https://lucide.dev/icons/ (clean modern icons)
- **Icon Service Code**: `src/app/core/services/icon.service.ts` (see supported prefixes)

### Technical Details
- Icons are stored in frontmatter and extracted during manifest generation
- The `IconService` converts prefix format to Iconify format automatically
- Icons appear in navigation, note headers, and wiki-links
- Manifest must be regenerated after adding/changing icons

**Need an icon from a library not listed?** Check if it's on Iconify - most major icon libraries are supported!

---

## 🔧 How Icon Auto-Correction Works

The `IconService` automatically corrects common prefix mistakes:

### Prefix Aliases
When you use an unsupported prefix like `Li`, it automatically maps to the correct one (`Lu`):
```typescript
// In your markdown:
icon: LiDroplet

// Automatically becomes:
icon: LuDroplet → lucide:droplet ✅
```

### Specific Icon Replacements
Some icons don't exist in certain libraries, so they're automatically replaced:
```typescript
// In your markdown:
icon: RaHood

// Automatically becomes:
icon: GiHood → game-icons:hood ✅
```

**This means you DON'T need to fix old markdown files!** They'll work automatically. But using correct prefixes from the start makes debugging easier.

### Adding New Mappings

If you discover a new problematic icon prefix, you can add it to `icon.service.ts`:

**For prefix mappings:** Edit `prefixAliases`
```typescript
private readonly prefixAliases: Record<string, string> = {
  'Li': 'Lu',  // Li → Lu (Lucide)
  'YourPrefix': 'CorrectPrefix',
};
```

**For specific icons:** Edit `iconReplacements`
```typescript
private readonly iconReplacements: Record<string, string> = {
  'RaHood': 'GiHood',  // Radix hood → Game Icons hood
  'YourIcon': 'ReplacementIcon',
};
```
