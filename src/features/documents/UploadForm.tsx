import { useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useUploadDocument } from './useDocuments';

const ALLOWED = ['.pdf', '.txt', '.md'];
const MAX_MB = 20;

// Quick feedback in the browser. The API repeats these checks, because it can't trust the client.
function validate(file: File | null): string | null {
  if (!file) return null;
  const extension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
  if (!ALLOWED.includes(extension)) return `Unsupported file type. Allowed: ${ALLOWED.join(', ')}`;
  if (file.size === 0) return 'The file is empty.';
  if (file.size > MAX_MB * 1024 * 1024) return `The file is larger than ${MAX_MB} MB.`;
  return null;
}

export function UploadForm() {
  const upload = useUploadDocument();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);

  function onSelect(e: ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    setClientError(validate(selected));
    upload.reset();
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!file || clientError) return;

    upload.mutate(file, {
      onSuccess: () => {
        setFile(null);
        if (inputRef.current) inputRef.current.value = '';
      },
    });
  }

  const error = clientError ?? upload.error?.message;

  return (
    <form onSubmit={onSubmit}>
      <div className="upload">
        <input ref={inputRef} type="file" accept={ALLOWED.join(',')} onChange={onSelect} />
        <button type="submit" disabled={!file || !!clientError || upload.isPending}>
          {upload.isPending ? 'Uploading…' : 'Upload'}
        </button>
      </div>
      {error && <p className="error">{error}</p>}
      {upload.isSuccess && <p className="muted">Uploaded.</p>}
    </form>
  );
}