import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createOllamaClient } from './client';

describe('createOllamaClient', () => {
  const baseUrl = 'http://localhost:11434';

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('isAvailable', () => {
    it('returns true when server responds with 200', async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
      });

      const client = createOllamaClient(baseUrl);
      const result = await client.isAvailable();

      expect(result).toBe(true);
      expect(fetch).toHaveBeenCalledWith(baseUrl, expect.objectContaining({
        signal: expect.any(AbortSignal),
      }));
    });

    it('returns false when server responds with non-200', async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: false,
      });

      const client = createOllamaClient(baseUrl);
      const result = await client.isAvailable();

      expect(result).toBe(false);
    });

    it('returns false when fetch throws (connection refused)', async () => {
      (fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('ECONNREFUSED'));

      const client = createOllamaClient(baseUrl);
      const result = await client.isAvailable();

      expect(result).toBe(false);
    });

    it('returns false when request is aborted (timeout)', async () => {
      (fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new DOMException('Aborted', 'AbortError'));

      const client = createOllamaClient(baseUrl);
      const result = await client.isAvailable();

      expect(result).toBe(false);
    });
  });

  describe('generate', () => {
    it('yields response tokens from streaming JSON lines', async () => {
      const lines = [
        JSON.stringify({ response: 'Hello', done: false }) + '\n',
        JSON.stringify({ response: ' world', done: false }) + '\n',
        JSON.stringify({ response: '!', done: true }) + '\n',
      ];

      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          for (const line of lines) {
            controller.enqueue(encoder.encode(line));
          }
          controller.close();
        },
      });

      (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        body: stream,
      });

      const client = createOllamaClient(baseUrl);
      const chunks: string[] = [];

      for await (const chunk of client.generate('test prompt')) {
        chunks.push(chunk);
      }

      expect(chunks).toEqual(['Hello', ' world', '!']);
      expect(fetch).toHaveBeenCalledWith(`${baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'llama3', prompt: 'test prompt', stream: true }),
      });
    });

    it('uses specified model when provided', async () => {
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(
            JSON.stringify({ response: 'ok', done: true }) + '\n'
          ));
          controller.close();
        },
      });

      (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        body: stream,
      });

      const client = createOllamaClient(baseUrl);
      const chunks: string[] = [];
      for await (const chunk of client.generate('test', 'mistral')) {
        chunks.push(chunk);
      }

      expect(fetch).toHaveBeenCalledWith(`${baseUrl}/api/generate`, expect.objectContaining({
        body: JSON.stringify({ model: 'mistral', prompt: 'test', stream: true }),
      }));
    });

    it('yields nothing when response is not ok', async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: false,
        body: null,
      });

      const client = createOllamaClient(baseUrl);
      const chunks: string[] = [];

      for await (const chunk of client.generate('test')) {
        chunks.push(chunk);
      }

      expect(chunks).toEqual([]);
    });

    it('yields nothing when fetch throws', async () => {
      (fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'));

      const client = createOllamaClient(baseUrl);
      const chunks: string[] = [];

      for await (const chunk of client.generate('test')) {
        chunks.push(chunk);
      }

      expect(chunks).toEqual([]);
    });

    it('handles chunked data split across reads', async () => {
      const encoder = new TextEncoder();
      const fullLine = JSON.stringify({ response: 'split', done: true }) + '\n';
      const part1 = fullLine.slice(0, 10);
      const part2 = fullLine.slice(10);

      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(part1));
          controller.enqueue(encoder.encode(part2));
          controller.close();
        },
      });

      (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        body: stream,
      });

      const client = createOllamaClient(baseUrl);
      const chunks: string[] = [];

      for await (const chunk of client.generate('test')) {
        chunks.push(chunk);
      }

      expect(chunks).toEqual(['split']);
    });
  });
});
