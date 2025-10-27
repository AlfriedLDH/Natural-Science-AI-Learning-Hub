
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { FeatureID } from '../constants';
import FeatureHeader from './common/FeatureHeader';
import { QuizResult, User } from '../types';

const DashboardPanel: React.FC = () => {
    const { user } = useAuth();

    // In a real app, this data would come from a backend.
    // Here we simulate it by reading from localStorage.
    const allUsersData: { user: User, results: QuizResult[] }[] = JSON.parse(localStorage.getItem('users') || '[]').map((u: User) => ({
        user: u,
        results: JSON.parse(localStorage.getItem(`quizResults_${u.id}`) || '[]')
    }));

    const userResults = allUsersData.find(u => u.user.id === user?.id)?.results || [];
    
    const totalPoints = userResults.reduce((sum, result) => sum + result.score, 0);
    const quizzesTaken = userResults.length;

    const leaderboard = allUsersData.map(data => {
        const totalScore = data.results.reduce((sum, r) => sum + r.score, 0);
        return { userId: data.user.id, username: data.user.username, totalScore };
    }).sort((a, b) => b.totalScore - a.totalScore);
    
    const rank = leaderboard.findIndex(item => item.userId === user?.id) + 1;

    const StatCard: React.FC<{ label: string; value: string | number; }> = ({ label, value }) => (
        <div className="game-card p-6 text-center">
            <div className="text-4xl font-bold text-[var(--accent-primary)]">{value}</div>
            <div className="text-sm uppercase tracking-widest text-[var(--text-secondary)] mt-2">{label}</div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto">
            <FeatureHeader featureId={FeatureID.Dashboard} />
            <h3 className="text-2xl font-bold text-white mb-6">Welcome back, <span className="text-[var(--accent-secondary)]">{user?.username}</span>!</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard label="Total Points" value={totalPoints} />
                <StatCard label="Quizzes Taken" value={quizzesTaken} />
                <StatCard label="Current Rank" value={rank > 0 ? `#${rank}` : 'N/A'} />
            </div>

             <div className="mt-8 game-card">
                <h4 className="text-xl font-semibold mb-4 text-[var(--accent-primary)] uppercase">Recent Activity</h4>
                {userResults.length > 0 ? (
                    <ul className="space-y-2 font-mono text-sm">
                        {userResults.slice(-5).reverse().map((result) => (
                            <li key={result.timestamp} className="flex justify-between p-2 bg-[var(--bg-secondary)] border-l-2 border-[var(--accent-primary)]">
                                <span>{result.subject}</span>
                                <span>Score: <span className="font-bold">{result.score} / {result.total}</span></span>
                                <span className="text-[var(--text-secondary)]">{new Date(result.timestamp).toLocaleDateString()}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-[var(--text-secondary)]">No quizzes taken yet. Go to the Exercises tab to get started!</p>
                )}
            </div>
        </div>
    );
};

export default DashboardPanel;
