import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// GLOBAL DEV FLAG - Set to false for proper authentication
const DEV_MODE = false;

interface User {
    id: string;
    username: string;
    email?: string; // Added
    name?: string; // Added
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, user: User) => void;
    register: (token: string, user: User) => void; // Added for consistency
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(DEV_MODE ? { id: 'dev-admin', username: 'Developer', name: 'Developer', email: 'dev@jarvis.local' } : null);
    const [token, setToken] = useState<string | null>(DEV_MODE ? 'dev-token-bypass' : null);

    useEffect(() => {
        if (!DEV_MODE) {
            const storedToken = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');

            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            }
        }
    }, []);

    const login = (newToken: string, newUser: User) => {
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
    };

    const register = (newToken: string, newUser: User) => {
        login(newToken, newUser);
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

