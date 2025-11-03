# Icon Usage Guide for Content Writers

This guide shows you how to add beautiful icons to your markdown notes - both in the navigation sidebar and inside your content!

## 🎯 Quick Start: Adding Icons to Note Titles

Want an icon to appear next to your note in the sidebar? It's easy!

### Step 1: Add Icon to Your Note's Frontmatter

At the very top of your `.md` file, add a special section called "frontmatter" with an `icon` line:

```markdown
---
icon: GiDragonHead
---

# Dragon Lore

Dragons are powerful creatures...
```

The `---` lines are important - they tell the system where the frontmatter starts and ends.

### Step 2: Save and Commit

After you save your file:
1. Commit and push your changes to GitHub
2. The system automatically updates (GitHub Actions does this for you!)
3. Wait a minute for the deployment, then refresh your browser

### Step 3: Enjoy Your Icon!

The icon will now appear:
- ✨ Next to your note title in the left sidebar
- ✨ In the page header when viewing the note
- ✨ In any wiki-links that point to that note

---

## 📝 Using Icons Inside Your Content

You can also use icons directly in your note content! Any time you create a wiki-link to another note, if that note has an icon, it will automatically appear next to the link.

### Example:

```markdown
Check out the [[Dragon Lore]] page for more information.
```

If "Dragon Lore" has `icon: GiDragonHead` in its frontmatter, the dragon icon will appear automatically next to the link! No extra work needed.

---

## 🔍 Where to Find Icons

You have access to **over 200,000 icons** from 150+ icon libraries! Here are the best places to browse:

### 🎮 **Game Icons** (Best for D&D/RPG content!)
**4,000+ fantasy, medieval, and gaming icons** - this is your go-to for RPG content!

- **Browse all Game Icons:** [https://game-icons.net/](https://game-icons.net/)
- **Search on Iconify:** [https://icon-sets.iconify.design/game-icons/](https://icon-sets.iconify.design/game-icons/)

Examples: Dragons, swords, spells, dice, shields, potions, scrolls, monsters

### ✨ **Lucide Icons** (Best for simple concepts)
**Clean, modern icons** - great for abstract ideas and UI elements

- **Browse Lucide:** [https://lucide.dev/icons/](https://lucide.dev/icons/)
- **Search on Iconify:** [https://icon-sets.iconify.design/lucide/](https://icon-sets.iconify.design/lucide/)

Examples: Heart, brain, eye, sparkles, clock, target

### 🔷 **Font Awesome** (General purpose)
**Huge variety** - good for common objects and concepts

- **Browse Font Awesome:** [https://fontawesome.com/icons](https://fontawesome.com/icons)
- **Search on Iconify:** [https://icon-sets.iconify.design/fa6-solid/](https://icon-sets.iconify.design/fa6-solid/)

### 🔎 **Search ALL Icons**
Not sure which library to use? Search everything at once:

**Main Search:** [https://icon-sets.iconify.design/](https://icon-sets.iconify.design/)

Just type what you're looking for (like "dragon" or "sword") and browse the results!

---

## 📝 How to Write Icon Names

Icon names have two parts: a **prefix** (which library) + the **icon name**.

### The Magic Formula

```
Prefix + IconName (in PascalCase)
```

**PascalCase** means: CapitalizeTheFirstLetterOfEachWord

### Common Prefixes (What You'll Use Most)

| Prefix | Library | Use For |
|--------|---------|---------|
| `Gi` | Game Icons | **⭐ RPG/D&D stuff (use this most!)** |
| `Lu` | Lucide | Simple concepts (heart, brain, eye) |
| `Fa` | Font Awesome | General items |
| `Hi` | Heroicons | Modern UI icons |

**There are 20+ more libraries available** - but these four cover 95% of what you'll need!

### 🎯 Converting Icon Names (The Easy Way)

When you find an icon on a website, the name usually has hyphens (like `dragon-head`). Here's how to convert it:

**Step 1:** Look at which library it's from
- Game Icons → Use `Gi`
- Lucide → Use `Lu`
- Font Awesome → Use `Fa`

**Step 2:** Convert the icon name to PascalCase
- Remove all hyphens and spaces
- Capitalize the first letter of each word

**Examples:**

| Website Shows | You Write |
|---------------|-----------|
| `game-icons:dragon-head` | `GiDragonHead` |
| `game-icons:broadsword` | `GiBroadsword` |
| `lucide:shield` | `LuShield` |
| `lucide:sparkles` | `LuSparkles` |
| `fa6-solid:dragon` | `FaDragon` |
| `game-icons:magic-swirl` | `GiMagicSwirl` |
| `game-icons:rolling-dices` | `GiRollingDices` |

### 💡 Pro Tip: The System is Smart!

Don't worry too much about getting the prefix exactly right - the system automatically tries multiple icon libraries if it can't find your icon in the first one. So if you write `IbTarget` but that icon doesn't exist in Ionicons, it'll automatically try Game Icons, Lucide, Font Awesome, and others until it finds a match!

Just focus on getting the icon name close, and the system will help you out.

---

## 📖 Complete Example

Here's a complete note with an icon and wiki-links:

```markdown
---
aliases:
  - Fireball
icon: GiFireball
---

# Fireball Spell

Fireball is a powerful [[Evocation]] spell that deals [[Fire Damage]] to all creatures in an area.

**Casting Time:** 1 action  
**Range:** 150 feet  
**Components:** Verbal, Somatic  
**Duration:** Instantaneous

## Description
A bright streak flashes from your pointing finger to a point you choose within range...

For rules on [[Spell Casting]], see the main rules page.
```

**What happens:**
- 🔥 The fireball icon appears in the sidebar next to "Fireball Spell"
- 🔥 The icon shows in the page header when you view this note
- 🔥 Any wiki-links to this note will show the icon automatically
- If "Evocation", "Fire Damage", and "Spell Casting" have their own icons, those will appear next to their links too!

---

## ❓ Troubleshooting

### My Icon Isn't Showing - Help!

**Most Common Issues:**

**1. Check your frontmatter format**
```markdown
❌ WRONG - Missing the --- lines:
icon: GiDragonHead

# My Note

✅ CORRECT - Has the --- wrapper:
---
icon: GiDragonHead
---

# My Note
```

**2. Check your icon name**
```markdown
❌ icon: dragonhead           # Missing the Gi prefix
❌ icon: Gidragonhead         # Not capitalized correctly
❌ icon: GiDragon_Head        # No underscores - use GiDragonHead
✅ icon: GiDragonHead         # Perfect! ✨
```

**3. Does the icon actually exist?**
- Go to [https://icon-sets.iconify.design/](https://icon-sets.iconify.design/)
- Search for your icon name
- If you can't find it, try a different search term or similar icon

**4. Did you commit and push your changes?**
- After adding icons, commit and push to GitHub
- GitHub Actions automatically updates the system
- Wait a minute for deployment, then refresh your browser (Ctrl + F5)

### Still Not Working?

Try these steps:
1. Make sure you committed and pushed your changes to GitHub
2. Check that GitHub Actions completed successfully (green checkmark)
3. Wait a minute or two for the deployment to finish
4. Do a hard refresh: Ctrl + F5 (Windows) or Cmd + Shift + R (Mac)
5. If still not working, check the browser console for error messages (F12 → Console tab)

The system will automatically try different icon libraries if the first one doesn't work, so don't worry too much about getting the prefix perfect!

---

## 🌟 Icon Cheat Sheet for D&D/RPG Content

Copy and paste these directly into your notes!

### ⚔️ Character Classes
```markdown
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

### 📊 Ability Scores
```markdown
icon: GiMuscleUp        # Strength (STR)
icon: GiQuickSlash      # Dexterity (DEX)
icon: LuHeart           # Constitution (CON)
icon: LuBrain           # Intelligence (INT)
icon: LuEye             # Wisdom (WIS)
icon: LuSparkles        # Charisma (CHA)
```

### 💥 Damage Types
```markdown
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

### 🎒 Equipment Categories
```markdown
icon: GiBroadsword      # Weapons
icon: GiChestArmor      # Armor
icon: GiHealthPotion    # Potions & Consumables
icon: GiSpellBook       # Spell scrolls & books
icon: GiRing            # Magic items & jewelry
icon: GiBackpack        # Adventuring gear
icon: GiTreasureMap     # Maps & documents
icon: GiDiamondRing     # Valuable items
```

### 🎲 Game Mechanics
```markdown
icon: GiRollingDices    # Dice rolls
icon: GiTarget          # Attack rolls / Accuracy
icon: GiHealing         # Healing
icon: GiFluffySwirl     # Status effects (debuffs)
icon: GiShield          # Defense / Armor Class
icon: GiRunningShoe     # Movement / Speed
icon: LuClock           # Time / Duration
icon: GiLevelFour       # Character level
```

### 🐉 Creature Types
```markdown
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

## 💡 Quick Tips

### Finding the Perfect Icon
1. **Start with Game Icons** - Browse at [https://game-icons.net/](https://game-icons.net/)
2. **Can't find it?** Search all libraries at [https://icon-sets.iconify.design/](https://icon-sets.iconify.design/)
3. **Use descriptive names** - `GiFireball` is better than `GiBall`
4. **Don't stress** - The system automatically tries multiple libraries if one doesn't work!

### Best Practices
- Use icons consistently across related notes
- Preview your icon before committing - some look different than their name suggests
- When in doubt, use a Game Icons (`Gi`) icon - they have the best RPG coverage
- Icons should enhance your content, not distract from it

---

## 🔗 Useful Links

- **Search ALL Icons:** [https://icon-sets.iconify.design/](https://icon-sets.iconify.design/)
- **Game Icons (RPG-focused):** [https://game-icons.net/](https://game-icons.net/)
- **Lucide Icons (Simple/Modern):** [https://lucide.dev/icons/](https://lucide.dev/icons/)
- **Font Awesome (General):** [https://fontawesome.com/icons](https://fontawesome.com/icons)

---

## 🎉 You're All Set!

You now know everything you need to add beautiful icons to your notes. Remember:

1. Add `icon: GiIconName` to your frontmatter
2. Save, commit, and push to GitHub
3. Wait a minute for automatic deployment
4. Refresh the page and enjoy your icons!

The system handles everything automatically - no need to bother anyone! ✨

Happy writing! 🎨
