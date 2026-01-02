# Project Plan: Adding Afterburner Layout to keybr.com

## Goal

Add the **Afterburner** keyboard layout to keybr.com for local practice, including a custom learning order that prioritizes home row keys.

---

## What is Afterburner?

Afterburner is a keyboard layout designed by Simon ([@xsznix](https://github.com/xsznix)) that minimizes same-finger usage through two special "magic" keys.

**Blog post:** https://blog.simn.me/posts/2025/afterburner/

### Base Alpha Layout

```
  J B G V X   ' W O U ,
Q H N S T M   ⟨#⟩ ⟨$⟩ A E I
  P Y F D K   Z C / ; .
        R L   ␣
```

- `R` and `L` are on the left thumb cluster
- `Space` is on the right thumb
- `⟨#⟩` is the **Magic Key** (not a regular character - will not be included in keybr)
- `⟨$⟩` is the **Skip Magic Key** (not a regular character - will not be included in keybr)

---

## Understanding keybr.com's Architecture

### Key Files

| Package | File | Purpose |
|---------|------|---------|
| `keybr-keyboard` | `lib/language.ts` | Defines languages with alphabet |
| `keybr-keyboard` | `lib/layout.ts` | Registers layouts with id, name, family |
| `keybr-keyboard` | `lib/layout/*.ts` | Generated layout key mappings |
| `keybr-generators` | `layouts/*.json` | Source layout definitions |
| `keybr-phonetic-model` | `lib/letter.ts` | Letter class with frequency ordering |
| `keybr-lesson` | `lib/guided.ts` | Lesson progression logic |

### How Layouts Work

1. **Layout JSON** defines physical key → character mappings
2. **Generator script** converts JSON to TypeScript
3. **Layout.ts** registers the layout with metadata
4. **Phonetic model** determines letter frequency for unlock order

### How Keys Are Unlocked

By default, keybr uses **letter frequency order** from the phonetic model:
- Most frequent letters are introduced first
- For English: `e`, `t`, `a`, `o`, `i`, `n`, `s`, `h`, `r`...

There's also a **keyboard order** option that weights by physical key position.

---

## Implementation Plan

### Phase 1: Create Afterburner Layout Definition

**Create:** `packages/keybr-generators/layouts/en_afterburner.json`


**Notes:**
- Magic keys (`⟨#⟩` and `⟨$⟩`) are NOT included - they're special behaviors, not characters

### Phase 2: Generate Layout TypeScript

Run the generator:

```bash
cd packages/keybr-generators
npm run generate-layouts
```

This creates: `packages/keybr-keyboard/lib/layout/en_afterburner.ts`

### Phase 3: Register the Layout

**Edit:** `packages/keybr-keyboard/lib/layout.ts`

Add after other English layouts:

```typescript
static readonly EN_AFTERBURNER = new Layout(
  /* id= */ "en-afterburner",
  /* xid= */ 0xb1,  // Next available xid after existing layouts
  /* name= */ "Afterburner",
  /* family= */ "afterburner",
  /* language= */ Language.EN,
  /* emulate= */ true,
  /* geometries= */ new Enum(
    Geometry.MATRIX,  // Afterburner is designed for matrix keyboards
    Geometry.ANSI_101,
    Geometry.ANSI_101_FULL,
    Geometry.ISO_102,
    Geometry.ISO_102_FULL,
  ),
);
```

Add to `Layout.ALL` enum (alphabetically with other EN layouts).

### Phase 4: Consider Custom Learning Order (Optional)

The default keybr frequency order for English is:
`e, t, a, o, i, n, s, h, r, d, l, c, u, m, w, f, g, y, p, b, v, k, j, x, q, z`

For Afterburner, a custom order based on home row could be:
`h, n, s, t, a, e, i, r, l, m, o, u, d, f, c, w, g, y, b, p, v, k, j, x, q, z`

**Home row first:** H, N, S, T (left) + A, E, I (right) + R, L (left thumb/home)

This would require either:
1. Creating a custom phonetic model with reordered frequencies
2. Using the "keyboard order" setting which weights by position
3. Modifying the lesson logic to accept a custom order

**Recommendation:** Start with default frequency order - it's still effective for learning.

---

## Detailed Steps

### Step 1: Create Layout JSON File

```bash
# Create the layout definition
touch packages/keybr-generators/layouts/en_afterburner.json
# Edit with the JSON content from Phase 1
```

### Step 2: Run Generator

```bash
cd packages/keybr-generators
npm run generate-layouts
```

Verify output: `packages/keybr-keyboard/lib/layout/en_afterburner.ts`

### Step 3: Edit layout.ts

Add the `EN_AFTERBURNER` static layout definition and add it to `Layout.ALL`.

### Step 4: Rebuild

```bash
npm run compile
npm run build-dev
```

### Step 5: Test Locally

```bash
eval "$(fnm env)" && fnm use 24 && npm start
```

```bash
eval "$(fnm env)" && fnm use 24 && npm run watch
```

---

## Suggested Learning Order for Afterburner

Based on Afterburner's design philosophy and key positions:

### Tier 1: Home Row (First 8 keys)
1. **H** - left home, left pinky
2. **N** - left home, left ring
3. **S** - left home, left middle
4. **T** - left home, left index
5. **A** - right home, right middle
6. **E** - right home, right ring
7. **I** - right home, right pinky
8. **R** - left thumb
9. **L** - left thumb

### Tier 2: Top Row
10. **O** - right top, right middle
11. **U** - right top, right ring  
12. **W** - right top, right index
13. **G** - left top, left middle
14. **B** - left top, left ring
15. **J** - left top, left pinky

### Tier 3: Bottom Row + Common Letters
16. **D** - left bottom, left index
17. **F** - left bottom, left middle
18. **C** - right bottom, right index
19. **M** - right home, right index
20. **Y** - left bottom, left pinky

### Tier 4: Less Common Letters
21. **P** - left bottom, left ring
22. **V** - left top, left index
23. **K** - left bottom, left index
24. **X** - left top, left index
25. **Z** - right bottom, right index
26. **Q** - left home, left pinky

---


## Resources

- **Afterburner Blog Post:** https://blog.simn.me/posts/2025/afterburner/
- **keybr.com Source:** https://github.com/aradzie/keybr.com
- **keybr Custom Keyboard Docs:** `docs/custom_keyboard.md`
- **keybr Custom Language Docs:** `docs/custom_language.md`


