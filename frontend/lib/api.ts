import axios from "axios";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

export type ClassifyRequest = { action: string; guideline: string };
export type ClassifyResponse = { id: string; label?: string | null; score?: number | null; raw?: any };

const client = axios.create({
  baseURL: BASE,
  headers: { "Content-Type": "application/json" },
  timeout: 30_000
});

export async function classify(payload: ClassifyRequest): Promise<ClassifyResponse> {
  const res = await client.post("/classify", payload);
  return res.data;
}

export async function getClassification(id: string): Promise<any> {
  const res = await client.get(`/classifications/${id}`);
  return res.data;
}

export async function listRecent(limit = 10): Promise<any[]> {
  const res = await client.get(`/classifications?limit=${limit}`);
  return res.data;
}
