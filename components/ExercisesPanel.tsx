
import React, { useState, useCallback } from 'react';
import { FeatureID, SUBJECTS } from '../constants';
import FeatureHeader from './common/FeatureHeader';
import { generateQuiz } from '../services/geminiService';
import { QuizQuestion, QuizResult } from '../types';
import { IconSpinner } from './Icons';
import { useAuth } from '../hooks/useAuth';

type QuizState = 'idle' | 'loading' | 'active' | 'finished';

const ExercisesPanel: React.FC = () => {
    const { user } = useAuth();
    const [subject, setSubject] = useState(SUBJECTS[0]);
    const [quizState, setQuizState] = useState<QuizState>('idle');
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [answers, setAnswers] = useState<string[]>([]);
    const [score, setScore] = useState(0);

    const handleStartQuiz = useCallback(async () => {
        setQuizState('loading');
        try {
            const generatedQuestions = await generateQuiz(subject);
            setQuestions(generatedQuestions);
            setAnswers(new Array(generatedQuestions.length).fill(''));
            setQuizState('active');
        } catch (error) {
            console.error("Failed to generate quiz:", error);
            alert("Could not generate a quiz. Please try again.");
            setQuizState('idle');
        }
    }, [subject]);

    const handleAnswerSelect = (questionIndex: number, answer: string) => {
        const newAnswers = [...answers];
        newAnswers[questionIndex] = answer;
        setAnswers(newAnswers);
    };

    const handleSubmitQuiz = () => {
        let currentScore = 0;
        questions.forEach((q, index) => {
            if (q.correctAnswer === answers[index]) {
                currentScore++;
            }
        });
        setScore(currentScore);
        setQuizState('finished');

        // Save result to localStorage
        if(user) {
            const newResult: QuizResult = {
                subject,
                score: currentScore,
                total: questions.length,
                timestamp: Date.now()
            };
            const resultsKey = `quizResults_${user.id}`;
            const existingResults: QuizResult[] = JSON.parse(localStorage.getItem(resultsKey) || '[]');
            localStorage.setItem(resultsKey, JSON.stringify([...existingResults, newResult]));
        }
    };
    
    const handleReset = () => {
        setQuizState('idle');
        setQuestions([]);
        setAnswers([]);
        setScore(0);
    }

    const renderContent = () => {
        switch (quizState) {
            case 'loading':
                return (
                    <div className="text-center py-20">
                        <IconSpinner className="w-12 h-12 animate-spin text-[var(--accent-primary)] mx-auto" />
                        <p className="mt-4 text-[var(--text-secondary)] uppercase">Generating Quiz Matrix...</p>
                    </div>
                );
            case 'active':
                return (
                    <div>
                        {questions.map((q, qIndex) => (
                            <div key={qIndex} className="mb-6 game-card p-6">
                                <p className="font-bold text-lg mb-4">{qIndex + 1}. {q.question}</p>
                                <div className="space-y-2">
                                    {q.options.map((option, oIndex) => (
                                        <label key={oIndex} className={`block p-3 border border-[var(--border-color)] cursor-pointer transition-colors ${answers[qIndex] === option ? 'bg-[var(--accent-primary)] text-[var(--bg-primary)]' : 'hover:bg-[var(--border-color)]'}`}>
                                            <input
                                                type="radio"
                                                name={`question-${qIndex}`}
                                                value={option}
                                                checked={answers[qIndex] === option}
                                                onChange={() => handleAnswerSelect(qIndex, option)}
                                                className="hidden"
                                            />
                                            {option}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                        <button onClick={handleSubmitQuiz} className="game-button w-full text-lg mt-4">Submit Answers</button>
                    </div>
                );
            case 'finished':
                return (
                    <div className="text-center py-10 game-card">
                        <h3 className="text-3xl font-bold text-[var(--accent-primary)]">Quiz Complete!</h3>
                        <p className="text-5xl font-bold my-6">{score} <span className="text-2xl text-[var(--text-secondary)]">/ {questions.length}</span></p>
                        <p className="text-lg">You scored {((score / questions.length) * 100).toFixed(0)}% on the {subject} quiz.</p>
                        <button onClick={handleReset} className="game-button mt-8">Take Another Quiz</button>
                    </div>
                );
            case 'idle':
            default:
                return (
                    <div className="text-center py-10 game-card">
                        <h3 className="text-2xl font-bold mb-4">Select a Subject</h3>
                        <select
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="game-select max-w-sm mx-auto mb-8"
                        >
                            {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <button onClick={handleStartQuiz} className="game-button text-xl">
                            Start Quiz
                        </button>
                    </div>
                );
        }
    };


    return (
        <div className="max-w-4xl mx-auto">
            <FeatureHeader featureId={FeatureID.Exercises} />
            {renderContent()}
        </div>
    );
};

export default ExercisesPanel;
