
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { IconSpinner } from '../Icons';

interface RegisterProps {
    onSwitchToLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onSwitchToLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        setError('');
        setIsLoading(true);

        // Simulate async operation
        await new Promise(res => setTimeout(res, 500));

        try {
            await register(username, password);
            // On successful registration, switch to login view
            onSwitchToLogin();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-2xl font-bold text-center uppercase text-[var(--accent-primary)]">Register</h2>
            <div>
                <label className="text-sm font-bold text-[var(--text-secondary)] block mb-2">Username</label>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="game-input"
                    required
                />
            </div>
            <div>
                <label className="text-sm font-bold text-[var(--text-secondary)] block mb-2">Password</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="game-input"
                    required
                    minLength={4}
                />
            </div>
            <div>
                <label className="text-sm font-bold text-[var(--text-secondary)] block mb-2">Confirm Password</label>
                <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="game-input"
                    required
                />
            </div>
            {error && <p className="text-sm text-[var(--error-color)] text-center">{error}</p>}
            <div>
                <button type="submit" className="game-button w-full text-lg" disabled={isLoading}>
                    {isLoading ? <IconSpinner className="w-6 h-6 animate-spin mx-auto" /> : 'Create Account'}
                </button>
            </div>
             <p className="text-center text-sm">
                <span className="text-[var(--text-secondary)]">Already have an account? </span>
                <button type="button" onClick={onSwitchToLogin} className="font-bold text-[var(--accent-secondary)] hover:underline">
                    Login here
                </button>
            </p>
        </form>
    );
};

export default Register;
