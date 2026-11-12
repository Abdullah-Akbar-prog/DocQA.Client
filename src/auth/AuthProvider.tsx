import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { authApi, SESSION_EXPIRED_EVENT } from '../api/client';
import type { AuthResponse } from '../api/types';
import { AuthContext } from './authContext';
import { clearSession, loadSession, saveSession } from './session';
import type { Session } from './session';

export function AuthProvider({ children }: { children: ReactNode }) {
    const queryClient = useQueryClient();
    const [session, setSession] = useState<Session | null>(() => loadSession());

    const start = useCallback(
    (auth: AuthResponse) => {
        const next: Session = { token: auth.token, email: auth.email, expiresAt: auth.expiresAt };
        saveSession(next);
      queryClient.clear(); // never show another user's cached data
        setSession(next);
    },
    [queryClient],
    );

    const logout = useCallback(() => {
    clearSession();
    queryClient.clear();
    setSession(null);
    }, [queryClient]);

  // The API client fires this event when the server rejects our token.
    useEffect(() => {
    const onExpired = () => {
        queryClient.clear();
        setSession(null);
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
    }, [queryClient]);

    const value = useMemo(
    () => ({
        session,
        login: async (email: string, password: string) => start(await authApi.login(email, password)),
        register: async (email: string, password: string) => start(await authApi.register(email, password)),
        logout,
    }),
    [session, start, logout],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}