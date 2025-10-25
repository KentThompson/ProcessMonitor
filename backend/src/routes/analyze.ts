import express from "express";
import axios from "axios";
import prisma from "../prisma";

const router = express.Router();

type Body = {
  action?: string;
  guideline?: string;
};

router.post("/", async (req, res) => {
  const { action, guideline } = req.body as Body;

  if (!action || !guideline) {
    return res.status(400).json({ error: "Both action and guideline are required" });
  }

  const inputString = `Action: '${action}', Guideline: '${guideline}'.`;
  const candidate_labels = [
    "This action follows the guideline.",
    "This action does not follow the guideline.",
    "It is unclear whether this action follows the guideline."
  ];

  const hfInput = {
    inputs: inputString,
    parameters: { candidate_labels }
  };

  const record = await prisma.classification.create({
    data: {
      action,
      guideline,
      hfInput
    }
  });

  try {
    const hfResponse = await axios.post(
      `https://api-inference.huggingface.co/models/${process.env.HF_MODEL ?? "facebook/bart-large-mnli"}`,
      hfInput,
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 60_000
      }
    );

    const data = hfResponse.data;
    const label = Array.isArray(data.labels) ? data.labels[0] : null;
    const score = Array.isArray(data.scores) ? data.scores[0] : null;

    await prisma.classification.update({
      where: { id: record.id },
      data: {
        hfResponse: data,
        label,
        score: score ?? undefined,
        status: "success"
      }
    });

    return res.json({ id: record.id, label, score, raw: data });
  } catch (err: any) {
    const errPayload = { message: err.message, status: err.response?.status, data: err.response?.data };
    await prisma.classification.update({
      where: { id: record.id },
      data: { hfResponse: errPayload, status: "error" }
    });
    return res.status(500).json({ error: "Classification failed", details: errPayload });
  }
});

export default router;
