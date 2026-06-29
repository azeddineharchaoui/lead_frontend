/**
 * Widget theming utilities for CSS variables injection
 */

export interface WidgetTheme {
  primary: string
  primaryHover: string
  primaryLight: string
}

/**
 * Generate a complete theme object from a primary hex color
 */
export function generateWidgetTheme(primaryHex: string): WidgetTheme {
  // Ensure valid hex format
  const hex = primaryHex.startsWith('#') ? primaryHex : `#${primaryHex}`

  // Calculate hover (darken by 10%)
  const hoverHex = darkenColor(hex, 10)
  const lightHex = lightenColor(hex, 20)

  return {
    primary: hex,
    primaryHover: hoverHex,
    primaryLight: lightHex,
  }
}

/**
 * Darken a hex color by percentage
 */
function darkenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = Math.max(0, (num >> 16) - amt)
  const G = Math.max(0, (num >> 8 & 0x00FF) - amt)
  const B = Math.max(0, (num & 0x0000FF) - amt)

  return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)
}

/**
 * Lighten a hex color by percentage
 */
function lightenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = Math.min(255, (num >> 16) + amt)
  const G = Math.min(255, (num >> 8 & 0x00FF) + amt)
  const B = Math.min(255, (num & 0x0000FF) + amt)

  return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)
}

/**
 * Apply theme to DOM element by setting CSS variables
 */
export function applyWidgetTheme(element: HTMLElement, theme: WidgetTheme): void {
  element.style.setProperty('--widget-primary', theme.primary)
  element.style.setProperty('--widget-primary-hover', theme.primaryHover)
  element.style.setProperty('--widget-primary-light', theme.primaryLight)
}

/**
 * Create a CSS string for theme variables
 */
export function getWidgetThemeCss(theme: WidgetTheme): string {
  return `
    --widget-primary: ${theme.primary};
    --widget-primary-hover: ${theme.primaryHover};
    --widget-primary-light: ${theme.primaryLight};
  `
}
