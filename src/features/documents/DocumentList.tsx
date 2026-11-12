import { FileText, FolderOpen, Trash2 } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { useDeleteDocument, useDocuments } from './useDocuments';

export function DocumentList() {
  const { data, isPending, isError, error } = useDocuments();
  const remove = useDeleteDocument();

  if (isPending) return <p className="muted">Loading documents…</p>;
  if (isError) return <p className="error">Could not load documents: {error.message}</p>;

  if (data.length === 0) {
    return (
      <div className="empty">
        <span className="empty-icon">
          <FolderOpen size={24} />
        </span>
        <strong>No documents yet</strong>
        <span>Upload a file to start asking questions.</span>
      </div>
    );
  }

  return (
    <>
      <ul className="doc-list">
        {data.map((doc) => (
          <li key={doc.id} className="doc">
            <span className="doc-icon">
              <FileText size={20} />
            </span>

            <div className="doc-main">
              <div className="doc-name" title={doc.fileName}>
                {doc.fileName}
              </div>
              <div className="doc-meta">
                <StatusBadge status={doc.status} />
                <span>{doc.chunkCount} chunks</span>
                <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
              </div>
              {doc.error && <div className="error">{doc.error}</div>}
            </div>

            <button
              className="icon-btn"
              aria-label={`Delete ${doc.fileName}`}
              disabled={remove.isPending && remove.variables === doc.id}
              onClick={() => {
                if (window.confirm(`Delete "${doc.fileName}"?`)) remove.mutate(doc.id);
              }}
            >
              <Trash2 size={17} />
            </button>
          </li>
        ))}
      </ul>
      {remove.isError && <p className="error">Delete failed: {remove.error.message}</p>}
    </>
  );
}