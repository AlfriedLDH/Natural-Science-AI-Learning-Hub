
import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
    user: User | null;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
    register: (username: string, password: string) => Promise<void>;
    // FIX: Added updateUser to the context type for the Marketplace feature.
    updateUser: (user: User) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        // Check for an active session on initial load
        const sessionUser = localStorage.getItem('sessionUser');
        if (sessionUser) {
            setUser(JSON.parse(sessionUser));
        }
    }, []);

    const login = useCallback(async (username: string, password: string): Promise<void> => {
        const storedUsers: User[] = JSON.parse(localStorage.getItem('users') || '[]');
        const foundUser = storedUsers.find(u => u.username === username && u.password === password);

        if (foundUser) {
            // FIX: Ensure the full user object is saved to the session.
            const userToSave: User = { 
                id: foundUser.id, 
                username: foundUser.username,
                gold: foundUser.gold || 0,
                inventory: foundUser.inventory || [],
                avatar: foundUser.avatar || 'default',
                theme: foundUser.theme || 'default'
            };
            setUser(userToSave);
            localStorage.setItem('sessionUser', JSON.stringify(userToSave));
        } else {
            throw new Error("Invalid username or password");
        }
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        localStorage.removeItem('sessionUser');
    }, []);
    
    const register = useCallback(async (username: string, password: string): Promise<void> => {
        const storedUsers: User[] = JSON.parse(localStorage.getItem('users') || '[]');
        if (storedUsers.some(u => u.username === username)) {
            throw new Error("Username already exists");
        }

        // FIX: Initialize new user with default values for marketplace properties.
        const newUser: User = {
            id: `user_${Date.now()}`,
            username,
            password, // Storing password in plain text for this demo. NEVER do this in a real app.
            gold: 100, // Starting gold
            inventory: [],
            avatar: 'default',
            theme: 'default',
        };

        const updatedUsers = [...storedUsers, newUser];
        localStorage.setItem('users', JSON.stringify(updatedUsers));
    }, []);

    // FIX: Added implementation for updateUser to persist changes.
    const updateUser = useCallback((updatedUser: User) => {
        setUser(updatedUser);
        localStorage.setItem('sessionUser', JSON.stringify(updatedUser));

        const storedUsers: User[] = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = storedUsers.findIndex(u => u.id === updatedUser.id);
        if (userIndex !== -1) {
            // Preserve password when updating
            const oldPassword = storedUsers[userIndex].password;
            storedUsers[userIndex] = { ...updatedUser, password: oldPassword };
            localStorage.setItem('users', JSON.stringify(storedUsers));
        }
    }, []);


    return (
        <AuthContext.Provider value={{ user, login, logout, register, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};