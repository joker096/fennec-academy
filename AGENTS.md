# Project Design Guidelines

## Perk Cards (Compact Colored Style)
The Perk cards in `src/pages/Perks.tsx` use a specific "Compact Colored" layout that must be preserved.

### 1. Grid Layout
- **Responsiveness:** `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6`.
- Avoid making cards larger or adding complex hover animations that change the layout flow.

### 2. Stat-Based Themes
Every perk card must use the `getStatTheme(stat)` helper to apply a specific color palette based on its S.P.E.C.I.A.L. attribute:
- **Strength:** Rose (`rose-500`)
- **Perception:** Orange (`orange-500`)
- **Endurance:** Green (`green-500`)
- **Charisma:** Pink (`pink-500`)
- **Intelligence:** Blue (`blue-500`)
- **Agility:** Emerald (`emerald-500`)
- **Luck:** Amber (`amber-500`)

### 3. Component Structure
- **Header:** Height `h-10`, rounded-t, colored background (subtle if not equipped, primary color if equipped).
- **Image:** `aspect-square`, rounded-xl, grayscale-0 with 80% opacity by default (100% when equipped or hovered).
- **Borders:** `border-2`. If not equipped, use a subtle accent border (`theme.accent`). If equipped, use the solid primary color border (`theme.border`).
- **Icons:** Use `lucide-react` icons (Coins for cost, Zap for equip action, Check for equipped).

### 4. Constraints
- **NO VECTOR ICONS:** Only perks with actual photo/raster images (`/perks/*.jpg`) are allowed in the database.
- **Card Sizing:** Maintain the `p-3` internal padding for the content area to keep it compact.
