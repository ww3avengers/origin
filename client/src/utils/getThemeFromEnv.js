/**
 * Loads theme configuration from environment variables
 * @returns {import('@librechat/client').IThemeRGB | undefined}
 */
export function getThemeFromEnv() {
  // Access env via Vite. Only whitelisted prefixes are exposed by Vite (see vite.config.ts envPrefix)
  const env = import.meta.env || {};
  // Check if any theme environment variables are set (supports VITE_THEME_* and REACT_APP_THEME_)
  const hasThemeEnvVars = Object.keys(env).some(
    (key) => key.startsWith('VITE_THEME_') || key.startsWith('REACT_APP_THEME_'),
  );

  if (!hasThemeEnvVars) {
    return undefined; // Use default themes
  }

  // Build theme object from environment variables
  const theme = {};

  // Helper: read VITE_ first, then REACT_APP_ (backward compatibility)
  const getEnv = (key) => env[`VITE_THEME_${key}`] ?? env[`REACT_APP_THEME_${key}`];

  // Text colors
  if (getEnv('TEXT_PRIMARY')) theme['rgb-text-primary'] = getEnv('TEXT_PRIMARY');
  if (getEnv('TEXT_SECONDARY')) theme['rgb-text-secondary'] = getEnv('TEXT_SECONDARY');
  if (getEnv('TEXT_TERTIARY')) theme['rgb-text-tertiary'] = getEnv('TEXT_TERTIARY');
  if (getEnv('TEXT_WARNING')) theme['rgb-text-warning'] = getEnv('TEXT_WARNING');

  // Surface colors
  if (getEnv('SURFACE_PRIMARY')) theme['rgb-surface-primary'] = getEnv('SURFACE_PRIMARY');
  if (getEnv('SURFACE_SECONDARY')) theme['rgb-surface-secondary'] = getEnv('SURFACE_SECONDARY');
  if (getEnv('SURFACE_TERTIARY')) theme['rgb-surface-tertiary'] = getEnv('SURFACE_TERTIARY');
  if (getEnv('SURFACE_SUBMIT')) theme['rgb-surface-submit'] = getEnv('SURFACE_SUBMIT');
  if (getEnv('SURFACE_SUBMIT_HOVER'))
    theme['rgb-surface-submit-hover'] = getEnv('SURFACE_SUBMIT_HOVER');
  if (getEnv('SURFACE_DESTRUCTIVE'))
    theme['rgb-surface-destructive'] = getEnv('SURFACE_DESTRUCTIVE');
  if (getEnv('SURFACE_DESTRUCTIVE_HOVER'))
    theme['rgb-surface-destructive-hover'] = getEnv('SURFACE_DESTRUCTIVE_HOVER');
  if (getEnv('SURFACE_DIALOG')) theme['rgb-surface-dialog'] = getEnv('SURFACE_DIALOG');
  if (getEnv('SURFACE_CHAT')) theme['rgb-surface-chat'] = getEnv('SURFACE_CHAT');

  // Border colors
  if (getEnv('BORDER_LIGHT')) theme['rgb-border-light'] = getEnv('BORDER_LIGHT');
  if (getEnv('BORDER_MEDIUM')) theme['rgb-border-medium'] = getEnv('BORDER_MEDIUM');
  if (getEnv('BORDER_HEAVY')) theme['rgb-border-heavy'] = getEnv('BORDER_HEAVY');
  if (getEnv('BORDER_XHEAVY')) theme['rgb-border-xheavy'] = getEnv('BORDER_XHEAVY');

  // Brand colors
  if (getEnv('BRAND_PURPLE')) theme['rgb-brand-purple'] = getEnv('BRAND_PURPLE');

  // Header colors
  if (getEnv('HEADER_PRIMARY')) theme['rgb-header-primary'] = getEnv('HEADER_PRIMARY');
  if (getEnv('HEADER_HOVER')) theme['rgb-header-hover'] = getEnv('HEADER_HOVER');

  // Presentation
  if (getEnv('PRESENTATION')) theme['rgb-presentation'] = getEnv('PRESENTATION');

  return Object.keys(theme).length > 0 ? theme : undefined;
}
