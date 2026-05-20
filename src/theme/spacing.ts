// Glowera Spacing & Effects - "Clean Warmth"
// Crisp, subtle shadows with clear visual hierarchy

// Spacing scale - generous and breathable
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// Border radius - distinct per card type
export const borderRadius = {
  xs: 6,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 28,
  xxl: 36,
  card: 12,        // Standard card (was 24 - now tighter)
  hero: 20,        // Hero card (featured/daily progress)
  button: 12,      // Button radius
  pill: 9999,      // Pill shape
  full: 9999,
};

// Clean neutral shadows - no more colored tint
export const shadows = {
  // Subtle lift - Standard cards
  sm: {
    shadowColor: 'rgba(100, 45, 35, 1)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.13,
    shadowRadius: 4,
    elevation: 1,
  },
  // Medium elevation - Hero cards
  md: {
    shadowColor: 'rgba(100, 45, 35, 1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 8,
    elevation: 3,
  },
  // Prominent float
  lg: {
    shadowColor: 'rgba(100, 45, 35, 1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.13,
    shadowRadius: 16,
    elevation: 6,
  },
  // Dramatic lift
  xl: {
    shadowColor: 'rgba(100, 45, 35, 1)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  // CTA button glow (keep warm tint for buttons only)
  glow: {
    shadowColor: '#F2B4CC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  // Warm glow for active states
  warmGlow: {
    shadowColor: '#F2B4CC',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  // Inner shadow simulation (for pressed states)
  inner: {
    shadowColor: 'rgba(100, 45, 35, 1)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 0,
  },
  // No shadow
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
};

// Card-specific styles matching the hierarchy
export const cardStyles = {
  // Hero: Daily progress, featured content
  hero: {
    borderRadius: borderRadius.hero,
    ...shadows.md,
  },
  // Standard: Habit/supplement items
  standard: {
    borderRadius: borderRadius.card,
    ...shadows.sm,
  },
  // Outlined: Empty states, add CTAs
  outlined: {
    borderRadius: borderRadius.card,
    ...shadows.none,
  },
  // Flat: List items within sections
  flat: {
    borderRadius: 0,
    ...shadows.none,
  },
  // Legacy aliases
  floating: {
    borderRadius: borderRadius.hero,
    ...shadows.md,
  },
  elevated: {
    borderRadius: borderRadius.hero,
    ...shadows.lg,
  },
  subtle: {
    borderRadius: borderRadius.card,
    ...shadows.sm,
  },
};
