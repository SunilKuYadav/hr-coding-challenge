/**
 * Ollama client for communicating with the local AI model server.
 *
 * The client connects to Ollama at the provided base URL and exposes:
 * - `isAvailable()`: health check returning true if the server responds with 200
 * - `generate()`: async generator that streams response tokens from Ollama
 *
 * Requirements: 6.1, 6.4
 */

export interface OllamaClient {
  isAvailable(): Promise<boolean>;
  generate(prompt: string, model?: string): AsyncGenerator<string>;
}

/**
 * Creates an OllamaClient connected to the given base URL.
 *
 * @param baseUrl - The Ollama server URL (e.g., "http://localhost:11434")
 */
export function createOllamaClient(baseUrl: string): OllamaClient {
  return {
    async isAvailable(): Promise<boolean> {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(baseUrl, {
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        return response.ok;
      } catch {
        return false;
      }
    },

    async *generate(prompt: string, model: string = 'llama3'): AsyncGenerator<string> {
      try {
        const response = await fetch(`${baseUrl}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ model, prompt, stream: true }),
        });

        if (!response.ok || !response.body) {
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          // Keep the last partial line in the buffer
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const parsed = JSON.parse(line) as { response?: string; done?: boolean };
              if (parsed.response) {
                yield parsed.response;
              }
              if (parsed.done) {
                return;
              }
            } catch {
              // Skip malformed JSON lines
            }
          }
        }

        // Process any remaining buffer content
        if (buffer.trim()) {
          try {
            const parsed = JSON.parse(buffer) as { response?: string };
            if (parsed.response) {
              yield parsed.response;
            }
          } catch {
            // Skip malformed trailing content
          }
        }
      } catch {
        // Connection error — yield nothing
        return;
      }
    },
  };
}
