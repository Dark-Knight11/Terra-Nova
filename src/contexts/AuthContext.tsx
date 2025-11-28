import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { api, tokenManager } from '../api/client';

interface User {
    id: string;
    email?: string;
    walletAddress?: string;
    role: 'COMPANY' | 'AUDITOR' | 'REGISTRY';
    isVerified: boolean;
    company?: { name: string; verificationStatus: string };
    auditor?: { name: string; verificationStatus: string };
    registry?: { name: string; verificationStatus: string };
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, role: string, companyName?: string) => Promise<void>;
    loginWithWallet: (address: string, signature: string, message: string) => Promise<void>;
    linkWallet: (address: string, signature: string, message: string) => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check for existing session on mount
    useEffect(() => {
        const initAuth = async () => {
            const token = tokenManager.getAccessToken();
            const savedUser = tokenManager.getUser();

            if (token && savedUser) {
                setUser(savedUser);
                // Optionally verify token is still valid
                try {
                    const { user: freshUser } = await api.auth.getCurrentUser();
                    setUser(freshUser);
                    tokenManager.setUser(freshUser);
                } catch (error) {
                    // Token invalid, clear session
                    tokenManager.clearTokens();
                    setUser(null);
                }
            }
            setIsLoading(false);
        };

        initAuth();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const response = await api.auth.login({ email, password });
            tokenManager.setTokens(response.accessToken, response.refreshToken);
            tokenManager.setUser(response.user);
            setUser(response.user);
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    const register = async (email: string, password: string, role: string, companyName?: string) => {
        try {
            // @ts-ignore
            const response = await api.auth.register({ email, password, role, companyName });
            tokenManager.setTokens(response.accessToken, response.refreshToken);
            tokenManager.setUser(response.user);
            setUser(response.user);
        } catch (error) {
            console.error('Registration failed:', error);
            throw error;
        }
    };

    const loginWithWallet = async (_address: string, signature: string, message: string) => {
        try {
            const response = await api.auth.verifySignature({ message, signature });
            tokenManager.setTokens(response.accessToken, response.refreshToken);
            tokenManager.setUser(response.user);
            setUser(response.user);
        } catch (error) {
            console.error('Wallet login failed:', error);
            throw error;
        }
    };

    const linkWallet = async (address: string, signature: string, message: string) => {
        try {
            const response = await api.auth.linkWallet({ message, signature });
            // Update user with new wallet info
            if (user) {
                // @ts-ignore
                const updatedUser = { ...user, walletAddress: response.walletAddress || address };
                setUser(updatedUser);
                tokenManager.setUser(updatedUser);
            }
        } catch (error) {
            console.error('Link wallet failed:', error);
            throw error;
        }
    };

    const logout = () => {
        const refreshToken = tokenManager.getRefreshToken();
        if (refreshToken) {
            api.auth.logout(refreshToken).catch(console.error);
        }
        tokenManager.clearTokens();
        setUser(null);
    };

    const refreshUser = async () => {
        try {
            const { user: freshUser } = await api.auth.getCurrentUser();
            setUser(freshUser);
            tokenManager.setUser(freshUser);
        } catch (error) {
            console.error('Failed to refresh user:', error);
            logout();
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                register,
                loginWithWallet,
                linkWallet,
                logout,
                refreshUser,
            }}
        >
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
