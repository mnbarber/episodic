import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);
const API_URL = import.meta.env.VITE_API_URL;

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_URL}/api/auth/me`, { credentials: 'include' })
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => setUser(data))
            .finally(() => setLoading(false));
    }, []);

    async function loginWithGoogle(credential) {
        const res = await fetch(`${API_URL}/api/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ credential }),
        });
        if (!res.ok) {
            throw new Error('Google sign-in failed');
        }
        const data = await res.json();
        setUser(data);
        return data;
    }

    async function registerWithEmail(username, email, password) {
        const data = await api.registerWithEmail({ username, email, password });
        setUser(data);
        return data;
    }

    async function loginWithEmail(email, password) {
        const data = await api.loginWithEmail({ email, password });
        setUser(data);
        return data;
    }

    async function updateProfile(data) {
        const updated = await api.updateProfile(data);
        setUser(updated);
        return updated;
    }

    async function uploadAvatar(file) {
        const updated = await api.uploadAvatar(file);
        setUser(updated);
        return updated;
    }

    async function logout() {
        await fetch(`${API_URL}/api/auth/logout`, {
            method: 'POST',
            credentials: 'include',
        });
        setUser(null);
    }

    return (
        <AuthContext.Provider
            value={{ user, loading, loginWithGoogle, registerWithEmail, loginWithEmail, updateProfile, uploadAvatar, logout }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
