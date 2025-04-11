# 🧁 Premium Bakery App

A premium-grade web application for an artisanal bakery brand, built using **React + Vite + Tailwind CSS v4**. This app focuses on delivering an elegant, luxurious user experience that reflects the handcrafted nature of the bakery’s offerings.

---

## 🚀 Tech Stack

- **React + Vite** for fast, modern frontend development
- **Tailwind CSS v4 (JIT)** for utility-first, scalable styling
- **Google Fonts** (Playfair Display + Inter)
- **PostCSS + CSS Modules (optional)** for additional flexibility

---

## 🎨 Design System & Guidelines

The visual and user experience of this application follows a tightly defined design system. Below is a full breakdown:

---

### 1. 🧁 Aesthetic & Brand Identity

- **Tone & Mood:** Elegant, handcrafted, welcoming, luxurious
- **Experience Goals:** High trust, high delight, artisanal quality

---

### 2. 🎨 Color Palette

| Name              | Variable              | Hex        | Usage |
|-------------------|------------------------|------------|-------|
| Creamy Vanilla    | `--color-cream`        | `#F7EFE5`  | Base backgrounds |
| Warm Caramel      | `--color-caramel`      | `#CBA47F`  | Buttons, CTAs |
| Chocolate Brown   | `--color-chocolate`    | `#5A3E36`  | Headlines, borders |
| Soft Rose         | `--color-rose`         | `#F2D7D9`  | Secondary UI |
| Blush Pink        | `--color-blush`        | `#FFDADA`  | Decorative |
| White             | `--color-white`        | `#FFFFFF`  | Neutral base |
| Charcoal Gray     | `--color-charcoal`     | `#2E2E2E`  | Text |

Defined in `index.css` via `:root` for easy Tailwind compatibility.

---

### 3. 🔠 Typography

| Use              | Font                    | Source                |
|------------------|--------------------------|------------------------|
| Headings         | Playfair Display (Serif) | Google Fonts          |
| Body Text        | Inter (Sans-serif)       | Google Fonts          |
| Optional Accent  | Great Vibes (Script)     | (Optional)            |

**Responsive sizing and hierarchy enforced using Tailwind utilities.**

---

### 4. 🧱 Layout & Spacing

- **Max Container Width:** `1440px`, centered
- **Grid System:** 12-column layout for desktop
- **Section Padding:** Use `py-12`, `py-16`, `py-24` for rhythm
- **Consistent Gutters:** `gap-6`, `gap-8`, `gap-12` between components

---

### 5. 🧩 Components & UI Elements

#### Buttons
- `.btn` base class: Shared padding, rounding, font weight
- `.btn-primary`: Warm Caramel, white text, hover dark
- `.btn-secondary`: Rose background, chocolate text
- `.btn-outline`: Transparent, caramel border

#### Cards
- `rounded-2xl`, `shadow-md`, `bg-white`, `p-6`
- Lift on hover (`hover:translate-y-[-4px]`)

#### Header
- Sticky, transparent by default
- Logo left-aligned, navigation right-aligned
- Mobile-friendly (hamburger menu on `md:` down)

#### Sections
- Use `.section-padding` for vertical rhythm
- Use `.section-title` for headings

---

### 6. ✨ Microinteractions & Animations

- **Transitions:** Smooth (`transition duration-300`)
- **Fade-ins:** `.fade-in` with custom `@keyframes`
- **Skeleton Loaders:** Placeholder elements during async fetches
- **Feedback States:** Clear hover/focus/active/disabled visuals

---

### 7. ♿ Accessibility Guidelines

- Semantic HTML (`<header>`, `<main>`, `<nav>`, `<footer>`)
- Minimum 4.5:1 color contrast ratio
- Fully keyboard-navigable menus
- Use `aria-*` roles/labels for custom UI widgets
- Focus indicators on all interactive elements

---

### 8. 🌐 Responsive & Device Compatibility

| Breakpoint | Tailwind Prefix | Typical Usage         |
|------------|------------------|------------------------|
| Mobile     | `sm:`            | Stack elements         |
| Tablet     | `md:`            | Inline nav, image text |
| Desktop    | `lg:`/`xl:`      | Full layout grid       |

All layouts and components should adapt fluidly across devices.

---

### 9. 📦 Design Tokens & Utility Classes

**Color Tokens:** Defined in `index.css` using `:root` and usable with Tailwind `bg-[var(--color-cream)]`, etc.

**Typography Utilities:**

```css
.text-heading {
  @apply text-3xl md:text-4xl font-bold text-[var(--color-chocolate)];
}
.text-body {
  @apply text-base leading-relaxed text-[var(--color-charcoal)];
}
