// Type definitions for Cloudflare Workers AI

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface Ai {
  run(
    model: string,
    options: {
      messages: ChatMessage[];
      max_tokens?: number;
      temperature?: number;
    }
  ): Promise<{
    response: string;
  }>;
}

