/**
 * Format large numbers to compact notation (e.g., 6846370 → "6.8M")
 */
export function formatCompactNumber(value: number): string {
  if (value >= 1_000_000) {
    return (value / 1_000_000).toFixed(1) + 'M';
  } else if (value >= 1_000) {
    return (value / 1_000).toFixed(1) + 'K';
  }
  return value.toLocaleString();
}

/**
 * Format number with thousand separators (e.g., 6846370 → "6,846,370")
 */
export function formatNumber(value: number): string {
  return value.toLocaleString();
}

/**
 * Format ratio to percentage with one decimal (e.g., 0.961097 → "96.1%")
 */
export function formatPercentage(ratio: number | null): string {
  if (ratio === null || ratio === undefined) {
    return 'N/A';
  }
  return (ratio * 100).toFixed(1) + '%';
}
