import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import scoreRoutes from "./routes/scoreRoutes.js";

dotenv.config();
const app = express();

// ✅ Connect to MongoDB
connectDB();

// ✅ Define allowed frontend origins
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5500",
  "http://127.0.0.1:5500",
  "https://typa-iota.vercel.app",
  "https://typa-zalo.onrender.com"
];

// ✅ Enable CORS for these origins
app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like Postman or server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = `❌ The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  })
);

// ✅ Parse JSON requests
app.use(express.json());

// ✅ API Routes
app.use("/api/scores", scoreRoutes);

// ✅ Health check
app.get("/", (req, res) => {
  res.send("Typing Speed API is running 🚀");
});

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.message);
  res.status(500).json({ message: err.message || "Server Error" });
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
