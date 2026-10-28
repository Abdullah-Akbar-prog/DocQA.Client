import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import type { Source } from '../../api/types';
import { useChat } from './useChat';
import type { Turn } from './useChat';

export function ChatPanel() {
  const { turns, ask, stop, isStreaming } = useChat();
  const [question, setQuestion] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [turns]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const q = question.trim();
    if (!q || isStreaming) return;
    setQuestion('');
    void ask(q);
  }

  return (
    <div>
      <div className="turns">
        {turns.length === 0 && <p className="muted">Ask a question about your documents.</p>}
        {turns.map((turn) => (
          <TurnView key={turn.id} turn={turn} />
        ))}
        <div ref={bottomRef} />
      </div>

      <form className="ask-form" onSubmit={onSubmit}>
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask about your documents…"
          maxLength={2000}
        />
        {isStreaming ? (
          <button type="button" className="secondary" onClick={stop}>
            Stop
          </button>
        ) : (
          <button type="submit" disabled={!question.trim()}>
            Ask
          </button>
        )}
      </form>
    </div>
  );
}

function TurnView({ turn }: { turn: Turn }) {
  const waiting = turn.status === 'streaming' && turn.answer === '';

  return (
    <div className="turn">
      <div className="q">{turn.question}</div>

      {waiting && <p className="muted">Searching your documents…</p>}
      {turn.answer && (
        <p className={turn.status === 'streaming' ? 'answer cursor' : 'answer'}>
          <AnswerText text={turn.answer} />
        </p>
      )}
      {turn.status === 'error' && <p className="error">{turn.error}</p>}

      {turn.sources.length > 0 && (
        <div>
          <div className="muted">Sources</div>
          {turn.sources.map((s) => (
            <SourceCard key={s.id} source={s} />
          ))}
        </div>
      )}
    </div>
  );
}

// Highlights citations like [1] in the answer.
function AnswerText({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\[\d+\])/g).map((part, i) =>
        /^\[\d+\]$/.test(part) ? (
          <span key={i} className="cite">
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  );
}

function SourceCard({ source }: { source: Source }) {
  return (
    <details className="source">
      <summary>
        [{source.id}] {source.fileName}{' '}
        <span className="muted">
          · chunk {source.chunkIndex} · distance {source.distance.toFixed(2)}
        </span>
      </summary>
      <p className="snippet">{source.snippet}</p>
    </details>
  );
}