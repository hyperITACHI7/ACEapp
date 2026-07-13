# Folio Color Palette

This document registers the color palette used in the **Folio Portfolio Builder** landing page. The design uses a luxury dark-mode theme with high-contrast neutral foundations and vibrant, section-specific gradient accents.

---

## 1. Neutral Foundations (Base & Typography)

These colors form the seed and backbone of the UI, establishing the editorial, high-end feel.

| Token | CSS Variable / Tailwind | Hex Value | Sample | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Ink** | `bg-ink` | `#0a0a0b` | `■` | Main page background, dark sections, scrollbar track |
| **Cream** | `text-cream`, `bg-cream` | `#f5f2ec` | `■` | Main headings, call-to-actions, highlight borders |
| **Muted Cream** | `text-cream/60` | `rgba(245, 242, 236, 0.6)` | `■` | Body copy, secondary text, and inactive details |
| **Dark Border** | `border-white/10` | `rgba(255, 255, 255, 0.1)` | `■` | Card borders, divider lines, and panel grid dividers |

---

## 2. Gradient Accents (Section-Specific)

Accents are defined as two-stop gradients to make individual features pop visually as the viewer scrolls.

### 01 · Design
- **Tailwind class**: `from-[#ff8c78] to-[#ff5f9e]`
- **Colors**: Coral Peach (`#ff8c78`) &rarr; Deep Pink (`#ff5f9e`)
- **Usage**: Design section visual features, template explore button

### 02 · Publish
- **Tailwind class**: `from-[#22d3ee] to-[#3b82f6]`
- **Colors**: Cyan (`#22d3ee`) &rarr; Blue (`#3b82f6`)
- **Usage**: Publish section graphics, wave canvas accent

### 03 · Showcase
- **Tailwind class**: `from-[#f7b267] to-[#f4845f]`
- **Colors**: Warm Gold (`#f7b267`) &rarr; Terracotta Orange (`#f4845f`)
- **Usage**: Showcase section graphics, 3D glass panel gradients

### 04 · Grow
- **Tailwind class**: `from-[#34d399] to-[#10b981]`
- **Colors**: Emerald Mint (`#34d399`) &rarr; Forest Emerald (`#10b981`)
- **Usage**: Grow section analytics charts, line-graph pulse dots

### 05 · AI
- **Tailwind class**: `from-[#a78bfa] to-[#ec4899]`
- **Colors**: Soft Lavender (`#a78bfa`) &rarr; Magenta Rose (`#ec4899`)
- **Usage**: AI section sparkling stars, magic layout previews
