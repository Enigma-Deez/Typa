// ✅ Auto-rotating season (daily)
export const CURRENT_SEASON = (() => {
  const today = new Date();
  const dateStr = today.toISOString().split("T")[0];
  const suffix = "S" + (today.getFullYear() % 100);
  return `${dateStr}-${suffix}`;
})();
