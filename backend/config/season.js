// ✅ config/season.js
export function getCurrentSeason() {
  const today = new Date();

  // Get ISO week number
  const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
  const pastDays = Math.floor((today - firstDayOfYear) / 86400000);
  const weekNumber = Math.ceil((pastDays + firstDayOfYear.getDay() + 1) / 7);

  // Format: "2025-W45"
  const year = today.getFullYear();
  const season = `${year}-W${String(weekNumber).padStart(2, "0")}`;

  return season;
}

export const CURRENT_SEASON = getCurrentSeason();
