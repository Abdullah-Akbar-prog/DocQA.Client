import { FileSearch, FileText, FolderOpen, LogOut, MessageSquareText, UploadCloud } from 'lucide-react';
import { useAuth } from './auth/useAuth';
import { LoginForm } from './auth/LoginForm';
import { ChatPanel } from './features/chat/ChatPanel';
import { DocumentList } from './features/documents/DocumentList';
import { UploadForm } from './features/documents/UploadForm';

export default function App() {
  const { session, logout } = useAuth();

  if (!session) {
    return (
      <main className="auth-page">
        <LoginForm />
      </main>
    );
  }

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <span className="brand-icon">
              <FileSearch size={20} />
            </span>
            <div>
              <strong>DocQA</strong>
              <small>AI document Q&amp;A</small>
            </div>
          </div>

          <div className="user">
            <span className="avatar">{session.email[0]}</span>
            <span className="email">{session.email}</span>
            <button className="btn ghost" onClick={logout}>
              <LogOut size={16} /> Log out
            </button>
          </div>
        </div>
      </header>

      <main className="page">
        <div className="side">
          <section className="card">
            <h2 className="card-title">
              <UploadCloud size={18} /> Upload
            </h2>
            <UploadForm />
          </section>

          <section className="card">
            <h2 className="card-title">
              <FolderOpen size={18} /> Documents
            </h2>
            <DocumentList />
          </section>
        </div>

        <section className="card chat">
          <h2 className="card-title">
            <MessageSquareText size={18} /> Ask your documents
          </h2>
          <ChatPanel />
        </section>
      </main>
    </>
  );
}