
import React from 'react';
import { FeatureID } from '../constants';
import FeatureHeader from './common/FeatureHeader';
import { useAuth } from '../hooks/useAuth';
import { QuizResult, User } from '../types';
import { IconTrophy } from './Icons';

interface LeaderboardEntry {
    rank: number;
    username: string;
    totalScore: number;
    quizzesTaken: number;
    userId: string;
}

const LeaderboardPanel: React.FC = () => {
    const { user: currentUser } = useAuth();
    
    // In a real app, this would be a single API call.
    // Here, we aggregate data from localStorage.
    const allUsers: User[] = JSON.parse(localStorage.getItem('users') || '[]');
    const leaderboardData: LeaderboardEntry[] = allUsers.map(user => {
        const results: QuizResult[] = JSON.parse(localStorage.getItem(`quizResults_${user.id}`) || '[]');
        const totalScore = results.reduce((sum, r) => sum + r.score, 0);
        return {
            userId: user.id,
            username: user.username,
            totalScore,
            quizzesTaken: results.length,
        };
    })
    .sort((a, b) => b.totalScore - a.totalScore)
    .map((user, index) => ({ ...user, rank: index + 1 }));

    return (
        <div className="max-w-4xl mx-auto">
            <FeatureHeader featureId={FeatureID.Leaderboard} />
            
            <div className="game-card p-0">
                <table className="w-full text-left leaderboard-table">
                    <thead>
                        <tr>
                            <th className="w-1/6 text-center">Rank</th>
                            <th className="w-3/6">User</th>
                            <th className="w-1/6 text-center">Quizzes</th>
                            <th className="w-1/6 text-right">Total Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaderboardData.map(entry => (
                            <tr key={entry.userId} className={entry.userId === currentUser?.id ? 'current-user' : ''}>
                                <td className="text-center font-bold text-xl">
                                    {entry.rank === 1 && <IconTrophy className="w-6 h-6 text-yellow-400 inline-block mr-2" />}
                                    {entry.rank}
                                </td>
                                <td>{entry.username}</td>
                                <td className="text-center">{entry.quizzesTaken}</td>
                                <td className="text-right font-bold text-lg text-[var(--accent-primary)]">{entry.totalScore}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {leaderboardData.length === 0 && (
                    <p className="text-center p-8 text-[var(--text-secondary)]">No data yet. Complete exercises to appear on the leaderboard!</p>
                )}
            </div>
        </div>
    );
};

export default LeaderboardPanel;
