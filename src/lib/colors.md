# RentFlow360 Color System Guide


### Primary Brand Colors
- **Blue-500**: Primary brand color (#3B82F6)
- **Cyan-500**: Secondary accent color (#06B6D4)
- **Gradient**: Blue-500 → Cyan-500 (for CTAs)

### Background Colors
```css
/* Light backgrounds */
bg-white                    /* Main light background */

/* Dark backgrounds */  
bg-neutral-900             /* Hero sections, dark areas */

/* Glass effects */
bg-white/10 backdrop-blur-sm   /* Subtle glass */
bg-white/15 backdrop-blur-md   /* Medium glass */
bg-white/20 backdrop-blur-xl   /* Heavy glass */


## TEXT COLORS

/* On dark backgrounds */
text-white                  /* Primary text */
text-white/80               /* Secondary text */
text-white/60               /* Muted text */

/* On light backgrounds */
text-neutral-900            /* Primary text */
text-neutral-700            /* Secondary text */
text-neutral-500            /* Muted text */

/* Brand text */
text-blue-500               /* Primary brand */
text-gradient-primary       /* Gradient text */


// BUTTON COLORS

/* Primary CTA */
bg-gradient-primary text-white

/* Secondary button */
bg-white/10 text-white border-white/30

/* Ghost button (light background) */
text-neutral-700 hover:text-blue-600

/* Ghost button (dark background) */
text-white hover:text-white hover:bg-white/20



Blue-500	Primary brand	bg-blue-500
Blue-600	Hover states	bg-blue-600
Blue-400	Light variants	bg-blue-400
Cyan-500	Secondary accent	bg-cyan-500
Cyan-400	Gradient accents	bg-cyan-400