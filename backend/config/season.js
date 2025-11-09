// Helper to generate a season identifier. We keep seasons daily with a year suffix.
export function getCurrentSeason() {
  const today = new Date();
  const dateStr = today.toISOString().split("T")[0]; // e.g. 2025-11-07
  const suffix = "S" + (today.getFullYear() % 100); // e.g. S25
  return `${dateStr}-${suffix}`;
}

// Export the current season as a constant (evaluated at import time)
export const CURRENT_SEASON = getCurrentSeason();
