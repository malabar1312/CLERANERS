---
name: Modern Minimalist SaaS
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#4c4546'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f1f1f1'
  outline: '#7e7576'
  outline-variant: '#cfc4c5'
  surface-tint: '#5e5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1b1b1b'
  on-primary-container: '#848484'
  inverse-primary: '#c6c6c6'
  secondary: '#0050cc'
  on-secondary: '#ffffff'
  secondary-container: '#0266ff'
  on-secondary-container: '#f9f7ff'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#1b1b1b'
  on-tertiary-container: '#848484'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2e2e2'
  primary-fixed-dim: '#c6c6c6'
  on-primary-fixed: '#1b1b1b'
  on-primary-fixed-variant: '#474747'
  secondary-fixed: '#dae1ff'
  secondary-fixed-dim: '#b3c5ff'
  on-secondary-fixed: '#001849'
  on-secondary-fixed-variant: '#003fa4'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c6'
  on-tertiary-fixed: '#1b1b1b'
  on-tertiary-fixed-variant: '#474747'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
typography:
  display-xl:
    fontFamily: Geist
    fontSize: 72px
    fontWeight: '700'
    lineHeight: 80px
    letterSpacing: -0.04em
  display-xl-mobile:
    fontFamily: Geist
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '600'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 32px
  margin-desktop: 64px
  margin-mobile: 24px
  section-gap: 120px
---

## Brand & Style
The brand personality is authoritative yet invisible, embodying the "quiet luxury" of modern high-end software. It targets sophisticated service providers and high-net-worth clients who value efficiency and aesthetic clarity. The UI must evoke a sense of focused calm and institutional trust.

The design style is **Hyper-Minimalist Editorial**. It leverages expansive white space to create a "gallery" feel, ensuring that every piece of content feels curated. Drawing from the precision of developer tools and the warmth of premium hospitality apps, this design system utilizes subtle depth markers—glassmorphism and soft shadows—to organize information without visual clutter. The goal is a 2026-ready interface that feels both futuristic and grounded.

## Colors
The palette is rooted in a monochromatic spectrum to maintain an editorial, high-trust atmosphere. 

- **Base:** Pure White (#FFFFFF) and Off-White (#F9F9F9) create the primary canvas.
- **Ink:** Deep Black (#000000) and Slate Gray (#4B5563) provide high-contrast legibility for typography.
- **Trust Accent:** A single, vibrant "Electric Blue" (#0066FF) is used sparingly for primary actions, notifications, and verification states. 
- **Subtle Surface:** Low-opacity grays are used for dividers and background layering to prevent visual heaviness.

## Typography
The typography system uses a pairing of **Geist** for technical precision in headings and labels, and **Inter** for optimized legibility in long-form body text.

Headlines should be "aggressive"—tightly tracked and significantly larger than body content to establish a clear hierarchy. For the `display-xl` tier, ensure a slight negative letter-spacing to achieve a high-fashion, editorial look. On mobile, headlines must scale down aggressively to prevent awkward wrapping, maintaining the impact without breaking the grid. Body text uses a generous line height (1.5x) to ensure a comfortable reading experience amidst the minimalist layout.

## Layout & Spacing
The design system employs a **Fixed Grid** philosophy for desktop to maintain the editorial "centered" feel, transitioning to a fluid layout for mobile. 

- **Desktop:** 12-column grid with 32px gutters. Large 64px margins on the edges allow the content to breathe.
- **Sectioning:** Use aggressive vertical spacing (`120px` or more) between major landing page sections to reinforce the premium, "un-crowded" brand feeling.
- **Internal Spacing:** Follow a strict 8px base unit. Component padding should lean towards the generous side (e.g., 24px padding for cards) to support the minimalist aesthetic.

## Elevation & Depth
Depth is achieved through **Soft Tonal Layering** and **Subtle Glassmorphism** rather than traditional heavy shadows.

- **Surfaces:** Main content sits on a pure white background. Modals and floating navigation elements use a backdrop blur (20px) with a 70% white opacity.
- **Shadows:** Use "Ambient Shadows"—extremely diffused, low-opacity (4-8%) black shadows with a large blur radius (30px+) and a slight vertical offset (10px). This makes elements feel like they are softly hovering rather than casting a sharp silhouette.
- **Outlines:** Use 1px borders in a very light gray (#E5E7EB) to define boundaries without adding visual weight. In dark modes or high-contrast areas, use hair-line borders for a "Retina-sharp" look.

## Shapes
The shape language is defined by **Rounded 2XL corners**. 

Standard components (inputs, buttons) use a base 8px radius. However, container-level elements like cards, feature blocks, and modals must use `rounded-xl` (16px) or `rounded-2xl` (24px) to create a friendly, modern tech silhouette. This "squircle" influence softens the aggressive typography and high-contrast palette, ensuring the marketplace feels approachable despite its premium positioning.

## Components
- **Buttons:** Primary buttons are solid Black with White text. Secondary buttons use a subtle gray-wash background. All buttons have a slight scale-down animation on press.
- **Inputs:** Minimalist fields with only a bottom border or a very light 1px stroke. Focus states should use the Trust Accent color for the border.
- **Cards:** Cards are pure white with a 1px border and an ambient shadow. Avoid using background fills for cards; let the white space define the grouping.
- **Chips/Badges:** Small, uppercase labels with high letter-spacing. Use the Trust Accent for "Verified" or "Premium" status.
- **Navigation:** A floating, glassmorphic top navigation bar that remains persistent. Use minimal icons and Geist-medium typography for links.
- **Service Listings:** High-resolution imagery with a 16px corner radius, paired with aggressive Geist headlines for pricing and service names.