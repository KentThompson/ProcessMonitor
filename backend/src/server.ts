import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import analyzeRouter from "./routes/analyze";
import prisma from "./prisma";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "200kb" }));

app.post("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok" });
  } catch (e) {
    res.status(500).json({ status: "error", error: String(e) });
  }
});

app.use("/analyze", analyzeRouter);

const port = Number(process.env.PORT ?? 3001);
app.listen(port, () => {
  console.log(`ProcessMonitor backend listening on ${port}`);
});
