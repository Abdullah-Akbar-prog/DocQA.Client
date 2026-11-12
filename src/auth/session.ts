export interface Session {
    email: string;
    token: string;
    expiresAt: string;
}

const KEY = 'docqa.session';

export function loadSession(): Session | null {
    try {
        const raw = localStorage.getItem(KEY);
        if (!raw) return null;

        const session = JSON.parse(raw) as Session;
        if (new Date(session.expiresAt).getTime() <= Date.now()) {
            localStorage.removeItem(KEY);
        return null;
    }
    return session;
    } catch {
    return null; // storage unavailable or corrupted
    }
}

export function saveSession(session: Session) {
    try {
        localStorage.setItem(KEY, JSON.stringify(session));
    } catch {
    // storage unavailable: the user just has to log in again after a reload
    }
}

export function clearSession() {
    try {
        localStorage.removeItem(KEY);
    } catch {
    // nothing to clear
    }
}