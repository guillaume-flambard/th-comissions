# Trackly Brand Guidelines

## Overview
Trackly is a B2B commission tracking platform designed for Thailand's tourism sector. Our brand reflects trust, simplicity, and modern technology.

## Name
**Trackly** (แทร็คลี่ in Thai)

## Taglines
- **English**: "Track smarter, earn more"
- **Thai**: "ติดตามคอมมิชชั่นอัตโนมัติ" (Automatic commission tracking)

## Value Proposition
- **For commission payers** (dive shops, kite schools): "Never lose track of who sent you customers"
- **For commission receivers** (hostels): "Get paid for every referral you make"

## Color Palette

### Primary Colors
- **Blue**: `#2563EB` (RGB: 37, 99, 235)
  - Usage: Primary actions, logos, links
  - Represents: Trust, professionalism, technology

### Secondary Colors
- **Slate**: `#1E293B` (RGB: 30, 41, 59)
  - Usage: Text, headings

- **Orange**: `#F59E0B` (RGB: 245, 158, 11)
  - Usage: Highlights, CTAs, success states
  - Represents: Energy, tourism, sunshine

### Neutral Colors
- **White**: `#FFFFFF`
- **Gray 50**: `#F8FAFC`
- **Gray 100**: `#F1F5F9`
- **Gray 900**: `#0F172A`

## Typography

### Primary Font
**System fonts** (for speed and compatibility):
- `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`

### Thai Font
- **Sarabun** or **Noto Sans Thai** for optimal Thai language rendering

### Font Sizes
- **Headings**: 24px - 48px, Bold (600-700)
- **Body**: 16px, Regular (400)
- **Small**: 14px, Regular (400)

## Logo Usage

### Files
- `public/images/brand/logo.svg` - Full logo with text
- `public/images/brand/logo-icon.svg` - Icon only (for favicons, app icons)

### Logo Variations
1. **Full color** - Default usage
2. **White** - For dark backgrounds
3. **Icon only** - For small spaces (mobile nav, favicons)

### Clear Space
Maintain minimum clear space of 20px around the logo

### Don'ts
- Don't rotate the logo
- Don't change colors outside brand palette
- Don't add effects (shadows, gradients)
- Don't stretch or distort

## Voice & Tone

### Brand Voice
- **Simple**: Clear, jargon-free language
- **Helpful**: Educational, supportive
- **Trustworthy**: Transparent, honest
- **Friendly**: Approachable but professional

### Writing Guidelines
- Use short sentences
- Active voice
- Bilingual (Thai primary, English secondary in Thai market)
- Avoid technical jargon
- Numbers and data should be clear (e.g., "Save 10 hours/month" not "Improve efficiency")

## Imagery Style

### Photography
- **Tourism context**: Beach scenes, diving, kite surfing, hostel environments
- **People**: Real business owners, authentic not stock photos
- **Lighting**: Bright, sunny (reflects Thailand)
- **Composition**: Clean, not cluttered

### Icons
- **Style**: Line icons (consistent stroke width)
- **Color**: Primary blue or slate
- **Size**: 20px - 48px typical

## UI Components

### Buttons
- **Primary**: Blue background, white text, rounded corners (8px)
- **Secondary**: White background, blue border, blue text
- **Sizes**: Small (32px), Medium (40px), Large (48px)

### Cards
- White background
- Subtle shadow: `0 1px 3px rgba(0,0,0,0.1)`
- Rounded corners: 12px
- Padding: 16px - 24px

### Forms
- Input height: 40px
- Border: 1px solid gray-200
- Focus state: Blue border
- Error state: Red border with error message below

## Applications

### Website
- Mobile-first responsive design
- Fast loading (<3 seconds)
- Progressive Web App (PWA) capabilities

### Marketing Materials
- QR codes featured prominently
- Bilingual (Thai/English)
- Clear call-to-action
- Include pricing/value props

### Social Media
- Square profile images: 1200x1200px
- Cover images: 1500x500px
- Maintain brand colors
- Include Thai language in posts for local market

## Target Audience

### Primary
- **Thai tourism SME owners** (age 25-45)
- **Dive shops, kite schools** in tourist destinations
- **Hostels, budget hotels**

### Characteristics
- Mobile-first users
- Mix of Thai and expat ownership
- Tech-friendly but not highly technical
- Value time savings and accuracy

## Competitors (to differentiate from)

### Global Platforms
- Tapfiliate, PartnerStack (too expensive, not localized)
- **Our advantage**: Affordable, Thai-focused, tourism-specific

### Manual Methods
- Excel, WhatsApp, notebooks
- **Our advantage**: Automated, accurate, scalable

## File Structure
```
public/images/brand/
├── logo.svg (full logo)
├── logo-icon.svg (icon only)
├── favicon.ico (generated from icon)
└── apple-touch-icon.png (iOS icon)
```

## Notes for Developers
- Use Tailwind CSS color classes: `bg-blue-600`, `text-slate-900`
- Maintain consistent spacing: 4px, 8px, 16px, 24px, 32px
- Mobile breakpoints: sm (640px), md (768px), lg (1024px)
- Always test Thai language rendering

---

**Version**: 1.0
**Last Updated**: October 18, 2025
**Contact**: hello@trackly.io
