// config/season.js
export function getCurrentSeason() {
  const today = new Date();

  const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
  const pastDays = Math.floor((today - firstDayOfYear) / 86400000);
  const weekNumber = Math.ceil((pastDays + firstDayOfYear.getDay() + 1) / 7);

  const year = today.getFullYear();
  return `${year}-W${String(weekNumber).padStart(2, "0")}`;
}

export const CURRENT_SEASON = getCurrentSeason();
