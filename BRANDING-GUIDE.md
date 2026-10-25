# Branding Customization Guide

This guide explains how to customize the branding and visual identity of the Learning Tracker application.

## Table of Contents

1. [Logo/Favicon](#logofavicon)
2. [App Name & Tagline](#app-name--tagline)
3. [Color Scheme](#color-scheme)
4. [Typography](#typography)
5. [Email Branding](#email-branding)
6. [Quick Reference](#quick-reference)

---

## Logo/Favicon

### Current Logo
- **Location**: `public/favicon.webp`
- **Format**: WebP image (1482 bytes)
- **Referenced in**: `app/features/page/components/landing/brand.tsx:16`

### How to Replace

1. **Prepare your logo**:
   - Recommended format: WebP for best compression (or PNG/SVG)
   - Recommended size: 64x64 or 128x128 pixels for favicon
   - For the landing page brand logo, larger sizes work (512x512 or higher)

2. **Replace the file**:
   ```bash
   # Replace the favicon
   cp your-logo.webp public/favicon.webp

   # Or use a different format (update the reference accordingly)
   cp your-logo.png public/favicon.png
   ```

3. **If using a different format or filename**, update the reference in:
   - `app/features/page/components/landing/brand.tsx` (around line 16)
   - Search for: `src="/favicon.webp"`
   - Replace with your new path

4. **Additional favicon formats** (optional but recommended):
   - `public/favicon.ico` - For older browsers (16x16, 32x32, 48x48 sizes)
   - `public/apple-touch-icon.png` - For iOS devices (180x180)
   - `public/icon-192.png` and `public/icon-512.png` - For PWA/Android

---

## App Name & Tagline

### Current Values
- **App Name**: "Learning Tracker"
- **Tagline**: "Track Your Progress"

### Files to Update

#### 1. English Messages (`messages/en.json`)
```json
{
  "landing_brand_name": "Learning Tracker",
  "landing_brand_endorsement": "Track Your Progress",
  "landing_meta_title": "Learning Tracker - Turn learning goals into real progress",

  "auth_brand_name": "Learning Tracker",
  "auth_brand_byline": "Track Your Progress",
  "auth_brand_home_label": "Learning Tracker home",
  "auth_benefits_label": "What you can do with Learning Tracker",
  "auth_explore_home": "Explore Learning Tracker",
  "login_meta_title": "Sign in - Learning Tracker"
}
```

#### 2. Indonesian Messages (`messages/id.json`)
```json
{
  "landing_brand_name": "Learning Tracker",
  "landing_brand_endorsement": "Lacak Progres Anda",
  "landing_meta_title": "Learning Tracker - Ubah target belajar menjadi progres nyata",

  "auth_brand_name": "Learning Tracker",
  "auth_brand_byline": "Lacak Progres Anda",
  "auth_brand_home_label": "Beranda Learning Tracker",
  "auth_benefits_label": "Yang dapat Anda lakukan dengan Learning Tracker",
  "auth_explore_home": "Jelajahi Learning Tracker",
  "login_meta_title": "Masuk - Learning Tracker"
}
```

#### 3. Admin Panel Config (`app/features/admin/config.ts:10`)
```typescript
export const Config: AdminConfig = {
  title: 'Learning Tracker',
  // ...
}
```

#### 4. Track App Config (`app/features/track-app/config.ts:5-6`)
```typescript
export const Config: AdminConfig = {
  title: 'Learning Tracker',
  subTitle: 'Track Your Progress',
  // ...
}
```

#### 5. Default Header Config (`app/features/admin/constants/default-admin-config.ts:16-18`)
```typescript
export const defaultHeaderConfig: SidebarHeader = {
  appName: 'Learning Tracker',
  appInitial: 'LT',  // 2-letter abbreviation
  subtitle: 'Admin Dashboard',
}
```

### After Making Changes

After updating the message files, regenerate the i18n files:
```bash
pnpm paraglide-js compile
```

---

## Color Scheme

### Current Color Palette
- **Primary Colors**:
  - Brand Indigo: `#2f39a9`
  - Brand Blue: `#2e6fa0`
  - Brand Cyan: `#49a4bb`
  - Brand Mint: `#15d8b3`

### Where to Update: `app/app.css`

#### 1. Brand Color Variables (lines 26-29)
```css
/* Brand-specific colors */
--color-brand-indigo: #2f39a9;
--color-brand-blue: #2e6fa0;
--color-brand-cyan: #49a4bb;
--color-brand-mint: #15d8b3;
```

**Change these to match your brand colors.**

#### 2. Light Mode Colors (lines 64-98)
Key variables to customize:
```css
:root {
  --background: #f8fbfc;      /* Page background */
  --foreground: #101b2d;      /* Text color */
  --primary: #2f39a9;         /* Primary brand color (buttons, links) */
  --primary-foreground: #f8fbfc; /* Text on primary color */
  --secondary: #2e6fa0;       /* Secondary accent color */
  --ring: #15d8b3;            /* Focus ring color */
  /* ... */
}
```

#### 3. Dark Mode Colors (lines 100-133)
```css
.dark {
  --background: #07131f;      /* Dark background */
  --foreground: #eef8fa;      /* Light text */
  --primary: #49a4bb;         /* Primary in dark mode */
  --secondary: #2e6fa0;       /* Secondary in dark mode */
  /* ... */
}
```

### Color Customization Tips

1. **Maintain Contrast**: Ensure text is readable on backgrounds (WCAG AA minimum: 4.5:1 ratio)
2. **Test Both Modes**: Verify colors work in both light and dark themes
3. **Use Tools**:
   - [Coolors.co](https://coolors.co) - Color palette generator
   - [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) - Accessibility testing

---

## Typography

### Current Fonts
- **Primary**: "Plus Jakarta Sans" (weights: 400, 500, 600, 700, 800)
- **Fallback**: "Inter" (weights: 100-900)

### How to Change Fonts

#### 1. Update CSS Variable (`app/app.css:7-9`)
```css
/* Font family definitions */
--font-sans: "Plus Jakarta Sans", "Inter", ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
```

**Example with different font**:
```css
--font-sans: "Your Font Name", "Fallback Font", ui-sans-serif, system-ui, sans-serif;
```

#### 2. Update Google Fonts Import (`app/root.tsx:57-60`)
Current:
```typescript
{
  rel: 'stylesheet',
  href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap',
}
```

**To use a different font**:
1. Go to [Google Fonts](https://fonts.google.com)
2. Select your font and weights
3. Copy the CSS import URL
4. Replace the `href` value in `app/root.tsx`

**Example**:
```typescript
{
  rel: 'stylesheet',
  href: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap',
}
```

Then update the CSS variable:
```css
--font-sans: "Roboto", ui-sans-serif, system-ui, sans-serif;
```

### Using Self-Hosted Fonts

If you prefer to self-host fonts:

1. **Add font files** to `public/fonts/`:
   ```
   public/fonts/
   ├── your-font-regular.woff2
   ├── your-font-bold.woff2
   └── ...
   ```

2. **Add @font-face rules** to `app/app.css`:
   ```css
   @font-face {
     font-family: 'Your Font Name';
     src: url('/fonts/your-font-regular.woff2') format('woff2');
     font-weight: 400;
     font-style: normal;
     font-display: swap;
   }

   @font-face {
     font-family: 'Your Font Name';
     src: url('/fonts/your-font-bold.woff2') format('woff2');
     font-weight: 700;
     font-style: normal;
     font-display: swap;
   }
   ```

3. **Update the CSS variable**:
   ```css
   --font-sans: "Your Font Name", ui-sans-serif, system-ui, sans-serif;
   ```

4. **Remove the Google Fonts link** from `app/root.tsx`

---

## Email Branding

Configure email branding through environment variables.

### Environment Variables (`.env`)

```env
# Email branding
EMAIL_APP_NAME=Learning Tracker
EMAIL_FROM_NAME=Learning Tracker
EMAIL_FROM=no-reply@learningtracker.com
EMAIL_REPLY_TO=support@learningtracker.com
EMAIL_SUPPORT_ADDRESS=support@learningtracker.com

# Optional: URL to your logo for emails
EMAIL_LOGO_URL=https://yourdomain.com/email-logo.png
```

### Configuration Details

These values are validated in `app/env.ts` (lines 186-191):
```typescript
EMAIL_FROM_NAME: z.string().min(1).default('Learning Tracker'),
EMAIL_APP_NAME: z.string().min(1).default('Learning Tracker'),
EMAIL_LOGO_URL: optionalUrl,
```

### Email Logo Specifications

If you set `EMAIL_LOGO_URL`:
- **Format**: PNG or JPEG (avoid WebP for email compatibility)
- **Size**: 200-400px wide recommended
- **Background**: Transparent PNG or appropriate solid color
- **Host**: Must be publicly accessible URL (not localhost)

---

## Quick Reference

### Files That Need Updates for Full Rebranding

| Purpose | File | Lines | Action |
|---------|------|-------|--------|
| **App Name** |
| English messages | `messages/en.json` | 640-641, 73-78 | Update brand name/tagline |
| Indonesian messages | `messages/id.json` | 640-641, 73-78 | Update brand name/tagline |
| Admin config | `app/features/admin/config.ts` | 10 | Update title |
| Track app config | `app/features/track-app/config.ts` | 5-6 | Update title/subtitle |
| Default header | `app/features/admin/constants/default-admin-config.ts` | 16-18 | Update name/initial |
| **Visual Identity** |
| Logo file | `public/favicon.webp` | - | Replace image |
| Brand colors | `app/app.css` | 26-29 | Update color vars |
| Light mode | `app/app.css` | 72-73, 81 | Update theme colors |
| Dark mode | `app/app.css` | 107-110 | Update theme colors |
| Font variable | `app/app.css` | 7-9 | Update font family |
| Font import | `app/root.tsx` | 59 | Update Google Fonts URL |
| **Email** |
| Environment | `.env` | - | Set EMAIL_* variables |

### Post-Change Commands

After making branding changes, run these commands in order:

```bash
# 1. Regenerate i18n (if you changed message files)
pnpm paraglide-js compile

# 2. Type check
pnpm typecheck

# 3. Lint check
pnpm check

# 4. Build test
pnpm build

# 5. Run dev server to preview
pnpm dev
```

---

## Tips for Consistent Branding

1. **Create a Brand Kit**: Document your colors, fonts, and logo usage guidelines
2. **Update Meta Tags**: Search for any additional brand references in meta tags
3. **Favicon Generator**: Use tools like [RealFaviconGenerator](https://realfavicongenerator.net/) for multi-platform icons
4. **Test Accessibility**: Verify color contrast meets WCAG standards
5. **Version Control**: Commit branding changes as a single atomic update
6. **Documentation**: Update this guide if you add new branding touchpoints

---

## Need Help?

- For color palette inspiration: [Coolors.co](https://coolors.co)
- For font pairing: [FontPair](https://www.fontpair.co/)
- For accessibility: [WebAIM](https://webaim.org/)
- For favicon generation: [Favicon.io](https://favicon.io/)
