export const COLORS = {
  // Backgrounds
  bgPrimary: '#0A0E17',
  bgSecondary: '#121826',
  bgCard: 'rgba(23, 31, 48, 0.75)',
  bgCardHover: 'rgba(32, 43, 67, 0.85)',
  bgElevated: '#1D263B',
  bgGlass: 'rgba(255, 255, 255, 0.05)',
  bgGlassBorder: 'rgba(255, 255, 255, 0.12)',

  // Neons & Accents
  cyan: '#00F0FF',
  cyanGlow: 'rgba(0, 240, 255, 0.35)',
  magenta: '#FF007A',
  magentaGlow: 'rgba(255, 0, 122, 0.35)',
  lime: '#10B981',
  limeGlow: 'rgba(16, 185, 129, 0.35)',
  amber: '#F59E0B',
  amberGlow: 'rgba(245, 158, 11, 0.35)',
  purple: '#8B5CF6',
  purpleGlow: 'rgba(139, 92, 246, 0.35)',
  rose: '#F43F5E',
  blue: '#3B82F6',

  // Neutrals & Text
  textPrimary: '#FFFFFF',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textDisabled: '#475569',
  border: 'rgba(255, 255, 255, 0.08)',
  borderActive: 'rgba(0, 240, 255, 0.5)',

  // Gradients
  gradientCyanPurple: ['#00F0FF', '#8B5CF6'],
  gradientMagentaAmber: ['#FF007A', '#F59E0B'],
  gradientGreenCyan: ['#10B981', '#00F0FF'],
  gradientDarkCard: ['rgba(23, 31, 48, 0.9)', 'rgba(15, 20, 32, 0.95)'],
  gradientHero: ['#1A2238', '#0E131F', '#080B12'],
};

export const FONTS = {
  display: 'System',
  body: 'System',
  mono: 'monospace',
};

export const SHADOWS = {
  glowCyan: {
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  glowMagenta: {
    shadowColor: '#FF007A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 6,
  },
};
