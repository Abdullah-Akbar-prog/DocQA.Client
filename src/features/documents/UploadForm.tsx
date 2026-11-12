import { useRef, useState } from 'react';
import type { ChangeEvent, DragEvent, FormEvent } from 'react';
import { CircleAlert, CircleCheck, CloudUpload, FileText, LoaderCircle, X } from 'lucide-react';
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
  const [dragging, setDragging] = useState(false);

  function pick(selected: File | null) {
    setFile(selected);
    setClientError(validate(selected));
    upload.reset();
  }

  function clear() {
    pick(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  function onSelect(e: ChangeEvent<HTMLInputElement>) {
    pick(e.target.files?.[0] ?? null);
  }

  function onDrop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setDragging(false);
    pick(e.dataTransfer.files[0] ?? null);
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
      <label
        className={dragging ? 'dropzone dragging' : 'dropzone'}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        <input ref={inputRef} type="file" accept={ALLOWED.join(',')} onChange={onSelect} />
        <span className="dz-icon">
          <CloudUpload size={22} />
        </span>
        <strong>Drop a file here or click to browse</strong>
        <small>PDF, TXT or MD · up to {MAX_MB} MB</small>
      </label>

      {file && (
        <div className="file-chip">
          <FileText size={18} />
          <span title={file.name}>{file.name}</span>
          <button type="button" className="icon-btn" aria-label="Remove file" onClick={clear}>
            <X size={16} />
          </button>
        </div>
      )}

      {file && (
        <div className="upload-actions">
          <button type="submit" className="btn block" disabled={!!clientError || upload.isPending}>
            {upload.isPending ? <LoaderCircle size={16} className="spin" /> : <CloudUpload size={16} />}
            {upload.isPending ? 'Uploading…' : 'Upload'}
          </button>
        </div>
      )}

      {error && (
        <p className="notice error">
          <CircleAlert size={16} /> {error}
        </p>
      )}
      {upload.isSuccess && !file && (
        <p className="notice ok">
          <CircleCheck size={16} /> Uploaded. It is being processed.
        </p>
      )}
    </form>
  );
}