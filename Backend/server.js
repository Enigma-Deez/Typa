import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import connectDB from "./Config/db.js";
import scoreRoutes from "./Routes/scoreRoutes.js";

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/scores", scoreRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
