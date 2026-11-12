import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { BookOpen, LoaderCircle, SendHorizontal, Sparkles, Square } from 'lucide-react';
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
    <div className="chat-body">
      <div className="turns">
        {turns.length === 0 && (
          <div className="chat-empty">
            <span className="bot">
              <Sparkles size={24} />
            </span>
            <h3>Ask anything about your documents</h3>
            <p>Answers come only from your uploaded files and cite the passages they used.</p>
          </div>
        )}
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
          <button type="button" className="btn ghost" onClick={stop}>
            <Square size={14} /> Stop
          </button>
        ) : (
          <button type="submit" className="btn" disabled={!question.trim()}>
            <SendHorizontal size={16} /> Ask
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
      <div className="bubble-q">{turn.question}</div>

      <div className="reply">
        <span className="bot">
          <Sparkles size={17} />
        </span>

        <div className="reply-body">
          {waiting && (
            <div className="thinking">
              <LoaderCircle size={16} className="spin" /> Searching your documents…
            </div>
          )}

          {turn.answer && (
            <div className={turn.status === 'streaming' ? 'bubble-a cursor' : 'bubble-a'}>
              <AnswerText text={turn.answer} />
            </div>
          )}

          {turn.status === 'error' && <div className="alert">{turn.error}</div>}

          {turn.sources.length > 0 && (
            <div>
              <div className="sources-title">
                <BookOpen size={13} /> Sources
              </div>
              {turn.sources.map((s) => (
                <SourceCard key={s.id} source={s} />
              ))}
            </div>
          )}
        </div>
      </div>
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
        <BookOpen size={14} />
        <span className="src-name">
          [{source.id}] {source.fileName}
        </span>
        <span className="src-meta">
          chunk {source.chunkIndex} · {source.distance.toFixed(2)}
        </span>
      </summary>
      <p className="snippet">{source.snippet}</p>
    </details>
  );
}