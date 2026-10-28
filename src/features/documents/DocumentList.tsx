import { StatusBadge } from './StatusBadge';
import { useDeleteDocument, useDocuments } from './useDocuments';

export function DocumentList() {
  const { data, isPending, isError, error } = useDocuments();
  const remove = useDeleteDocument();

  if (isPending) return <p className="muted">Loading documents…</p>;
  if (isError) return <p className="error">Could not load documents: {error.message}</p>;
  if (data.length === 0) return <p className="muted">No documents yet. Upload one above.</p>;

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Status</th>
            <th>Chunks</th>
            <th>Uploaded</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {data.map((doc) => (
            <tr key={doc.id}>
              <td>{doc.fileName}</td>
              <td>
                <StatusBadge status={doc.status} />
                {doc.error && <div className="error">{doc.error}</div>}
              </td>
              <td>{doc.chunkCount}</td>
              <td>{new Date(doc.createdAt).toLocaleString()}</td>
              <td>
                <button
                  className="secondary"
                  disabled={remove.isPending && remove.variables === doc.id}
                  onClick={() => {
                    if (window.confirm(`Delete "${doc.fileName}"?`)) remove.mutate(doc.id);
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {remove.isError && <p className="error">Delete failed: {remove.error.message}</p>}
    </div>
  );
}