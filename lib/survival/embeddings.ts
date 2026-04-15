import OpenAI from "openai";

let cachedClient: OpenAI | null | undefined;

function getEmbeddingClient() {
  if (cachedClient !== undefined) {
    return cachedClient;
  }

  if (!process.env.OPENAI_API_KEY) {
    cachedClient = null;
    return cachedClient;
  }

  cachedClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL || undefined,
  });

  return cachedClient;
}

export function hasEmbeddingConfig() {
  return Boolean(getEmbeddingClient());
}

export async function embedText(text: string) {
  const client = getEmbeddingClient();

  if (!client) {
    return null;
  }

  try {
    const response = await client.embeddings.create({
      model: process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small",
      input: text,
    });

    return response.data[0]?.embedding ?? null;
  } catch (error) {
    console.error("[survival/embeddings] Failed to embed text:", error);
    return null;
  }
}

export function cosineSimilarity(left: number[], right: number[]) {
  if (!left.length || left.length !== right.length) {
    return 0;
  }

  let dot = 0;
  let leftNorm = 0;
  let rightNorm = 0;

  for (let index = 0; index < left.length; index += 1) {
    dot += left[index] * right[index];
    leftNorm += left[index] ** 2;
    rightNorm += right[index] ** 2;
  }

  if (!leftNorm || !rightNorm) {
    return 0;
  }

  return dot / (Math.sqrt(leftNorm) * Math.sqrt(rightNorm));
}
