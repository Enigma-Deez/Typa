const app = express();
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import scoreRoutes from "./routes/scoreRoutes.js";
app.use("/api/scores", scoreRoutes);


// ✅ Connect to MongoDB
connectDB();

// ✅ Define allowed origins for CORS
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5500",
  "http://127.0.0.1:5500",
  "https://typa-iota.vercel.app",
  "https://typa-zalo.onrender.com"
];

// ✅ Setup CORS middleware
// ✅ Universal CORS fix (safe for public leaderboard APIs)
import cors from "cors";

app.use(
  cors({
    origin: "*", // allow all origins
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);



// ✅ Middleware
app.use(express.json());

// ✅ Routes
app.use("/api/scores", scoreRoutes);

// ✅ Health check route
app.get("/", (req, res) => {
  res.send("Typing Speed API is running 🚀");
});

// ✅ Global error handler (for CORS or others)
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.message);
  res.status(500).json({ message: err.message || "Server Error" });
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
