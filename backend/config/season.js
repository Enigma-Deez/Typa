// ✅ GET /api/scores/seasons
router.get("/seasons", async (req, res) => {
  try {
    const seasons = await Score.distinct("season");
    if (!seasons || seasons.length === 0) return res.json([]);

    const sorted = seasons.sort().reverse();
    const formatted = sorted.map(seasonId => ({
      id: seasonId,
      displayName: `Season ${seasonId.split("-W")[1] || "?"}`,
      date: seasonId.split("-W")[0],
    }));

    res.json(formatted);
  } catch (err) {
    console.error("❌ Failed to fetch seasons:", err);
    res.status(500).json({ error: "Failed to fetch seasons" });
  }
});
