import { ChatPanel } from './features/chat/ChatPanel';
import { DocumentList } from './features/documents/DocumentList';
import { UploadForm } from './features/documents/UploadForm';

export default function App() {
  return (
    <main className="container">
      <header>
        <h1>DocQA</h1>
        <p className="muted">Upload documents, then ask questions about them.</p>
      </header>

      <section className="card">
        <h2>Upload</h2>
        <UploadForm />
      </section>

      <section className="card">
        <h2>Documents</h2>
        <DocumentList />
      </section>

      <section className="card">
        <h2>Ask</h2>
        <ChatPanel />
      </section>
    </main>
  );
}