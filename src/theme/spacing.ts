// Glowera Spacing & Effects - "Golden Hour Sanctuary"
// Soft, organic shapes with warm atmospheric shadows

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

// Border radius - organic, soft curves
export const borderRadius = {
  xs: 6,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 28,
  xxl: 36,
  card: 24,        // Standard card radius
  button: 16,      // Button radius
  pill: 9999,      // Pill shape
  full: 9999,
};

// Warm-tinted shadows - like sunlight filtering through
export const shadows = {
  // Subtle lift
  sm: {
    shadowColor: '#D4A3B3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  // Standard elevation
  md: {
    shadowColor: '#D4A3B3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  // Prominent float
  lg: {
    shadowColor: '#D4A3B3',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  // Dramatic lift
  xl: {
    shadowColor: '#D4A3B3',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 32,
    elevation: 12,
  },
  // Soft glow effect (for buttons, highlights)
  glow: {
    shadowColor: '#FF99B5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  // Peachy glow
  warmGlow: {
    shadowColor: '#FFB199',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 4,
  },
  // Inner shadow simulation (for pressed states)
  inner: {
    shadowColor: '#3D3535',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
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

// Card-specific styles
export const cardStyles = {
  floating: {
    borderRadius: borderRadius.card,
    ...shadows.md,
  },
  elevated: {
    borderRadius: borderRadius.card,
    ...shadows.lg,
  },
  subtle: {
    borderRadius: borderRadius.card,
    ...shadows.sm,
  },
  flat: {
    borderRadius: borderRadius.card,
    ...shadows.none,
  },
};
