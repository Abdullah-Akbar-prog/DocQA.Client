import type { DocumentDto, Source } from './types';

const API_URL = import.meta.env.VITE_API_URL ?? '';

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, init);
  if (!res.ok) throw new ApiError(res.status, await readError(res));
  return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
}

// Turns an ASP.NET ProblemDetails / validation response into a readable message.
async function readError(res: Response): Promise<string> {
  try {
    const problem = await res.json();
    if (problem.errors) return Object.values<string[]>(problem.errors).flat().join(' ');
    return problem.title ?? res.statusText;
  } catch {
    return res.statusText;
  }
}

export const documentsApi = {
  list: () => request<DocumentDto[]>('/api/documents'),
  get: (id: string) => request<DocumentDto>(`/api/documents/${id}`),
  upload: (file: File) => {
    const form = new FormData();
    form.append('file', file); // must match the API parameter name "file"
    return request<DocumentDto>('/api/documents', { method: 'POST', body: form });
  },
  remove: (id: string) => request<void>(`/api/documents/${id}`, { method: 'DELETE' }),
};

export interface StreamHandlers {
  onSources: (sources: Source[]) => void;
  onToken: (text: string) => void;
  onDone: (info: { declined: boolean }) => void;
  onError: (message: string) => void;
}

// Reads Server-Sent Events from a POST request. EventSource can't do POST, so we parse the stream ourselves.
export async function askStream(
  question: string,
  handlers: StreamHandlers,
  signal: AbortSignal,
): Promise<void> {
  const res = await fetch(`${API_URL}/api/ask/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
    signal,
  });

  if (!res.ok || !res.body) {
    handlers.onError(await readError(res));
    return;
  }

  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = '';

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += value;

    // A complete event ends with a blank line.
    let end = buffer.indexOf('\n\n');
    while (end >= 0) {
      handleSseEvent(buffer.slice(0, end), handlers);
      buffer = buffer.slice(end + 2);
      end = buffer.indexOf('\n\n');
    }
  }
}

function handleSseEvent(raw: string, handlers: StreamHandlers) {
  let name = 'message';
  let data = '';

  for (const line of raw.split('\n')) {
    if (line.startsWith('event: ')) name = line.slice(7);
    else if (line.startsWith('data: ')) data += line.slice(6);
  }
  if (!data) return;

  const payload = JSON.parse(data);
  switch (name) {
    case 'sources':
      handlers.onSources(payload as Source[]);
      break;
    case 'token':
      handlers.onToken(payload as string);
      break;
    case 'done':
      handlers.onDone(payload as { declined: boolean });
      break;
    case 'error':
      handlers.onError((payload as { message: string }).message);
      break;
  }
}
