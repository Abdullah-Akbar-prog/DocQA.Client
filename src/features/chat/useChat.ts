import { useCallback, useRef, useState } from 'react';
import { askStream } from '../../api/client';
import type { Source } from '../../api/types';

export interface Turn {
  id: number;
  question: string;
  answer: string;
  sources: Source[];
  status: 'streaming' | 'done' | 'error';
  error?: string;
}

function patchTurn(id: number, change: (turn: Turn) => Turn) {
  return (turns: Turn[]) => turns.map((t) => (t.id === id ? change(t) : t));
}

export function useChat() {
  const [turns, setTurns] = useState<Turn[]>([]);
  const nextId = useRef(1);
  const controller = useRef<AbortController | null>(null);

  const ask = useCallback(async (question: string) => {
    const id = nextId.current++;
    const abort = new AbortController();
    controller.current = abort;

    setTurns((t) => [...t, { id, question, answer: '', sources: [], status: 'streaming' }]);

    try {
      await askStream(
        question,
        {
          onSources: (sources) => setTurns(patchTurn(id, (t) => ({ ...t, sources }))),
          onToken: (text) => setTurns(patchTurn(id, (t) => ({ ...t, answer: t.answer + text }))),
          onDone: ({ declined }) =>
            setTurns(patchTurn(id, (t) => ({ ...t, status: 'done', sources: declined ? [] : t.sources }))),
          onError: (message) =>
            setTurns(patchTurn(id, (t) => ({ ...t, status: 'error', error: message }))),
        },
        abort.signal,
      );
    } catch (e) {
      if (!abort.signal.aborted) {
        const message = e instanceof Error ? e.message : 'Request failed';
        setTurns(patchTurn(id, (t) => ({ ...t, status: 'error', error: message })));
      }
    } finally {
      // If the stream ended or was stopped without a "done" event, don't leave it spinning.
      setTurns(patchTurn(id, (t) => (t.status === 'streaming' ? { ...t, status: 'done' } : t)));
      controller.current = null;
    }
  }, []);

  const stop = useCallback(() => controller.current?.abort(), []);

  return { turns, ask, stop, isStreaming: turns.some((t) => t.status === 'streaming') };
}