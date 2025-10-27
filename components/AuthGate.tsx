
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Login from './auth/Login';
import Register from './auth/Register';
import { IconBook } from './Icons';

const AuthGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [showLogin, setShowLogin] = useState(true);

    if (!user) {
        return (
            <div className="w-screen h-screen flex items-center justify-center auth-container">
                <div className="w-full max-w-md mx-auto">
                    <div className="flex justify-center items-center mb-8">
                         <IconBook className="w-12 h-12 text-cyan-400" />
                         <h1 className="ml-4 text-3xl font-bold uppercase tracking-widest text-cyan-300">Science Hub</h1>
                    </div>
                    <div className="game-card p-8">
                        {showLogin ? (
                            <Login onSwitchToRegister={() => setShowLogin(false)} />
                        ) : (
                            <Register onSwitchToLogin={() => setShowLogin(true)} />
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

export default AuthGate;
