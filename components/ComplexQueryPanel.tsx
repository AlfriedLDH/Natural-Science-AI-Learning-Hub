import React, { useState, useCallback } from 'react';
import { generateComplexResponse } from '../services/geminiService';
import { IconSpinner, IconVolumeUp } from './Icons';
import FeatureHeader from './common/FeatureHeader';
import { FeatureID } from '../constants';
import { textToSpeech } from '../services/geminiService';
import { decodeAudioData, decodeBase64 } from '../utils/media';


const ComplexQueryPanel: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [response, setResponse] = useState<string | null>(null);
    const [isSpeaking, setIsSpeaking] = useState(false);

    const handleSubmit = useCallback(async () => {
        if (!prompt.trim() || isLoading) return;
        setIsLoading(true);
        setError(null);
        setResponse(null);

        try {
            const result = await generateComplexResponse(prompt);
            setResponse(result.text);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
            console.error("Complex query error:", err);
        } finally {
            setIsLoading(false);
        }
    }, [prompt, isLoading]);

    const handleSpeak = async () => {
        if (!response || isSpeaking) return;
        setIsSpeaking(true);
        try {
            const audioResponse = await textToSpeech(response);
            const base64Audio = audioResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
                const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
                const audioBuffer = await decodeAudioData(decodeBase64(base64Audio), audioContext, 24000, 1);
                const source = audioContext.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(audioContext.destination);
                source.start();
                source.onended = () => setIsSpeaking(false);
            }
        } catch (error) {
            console.error("TTS Error:", error);
            setIsSpeaking(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <FeatureHeader featureId={FeatureID.ComplexQuery} />

            <div className="space-y-4">
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Enter a complex problem, multi-step query, or a reasoning task..."
                    className="game-textarea"
                    rows={8}
                    disabled={isLoading}
                />
                <button
                    onClick={handleSubmit}
                    disabled={isLoading || !prompt.trim()}
                    className="game-button w-full text-lg"
                >
                    {isLoading ? <IconSpinner className="w-6 h-6 animate-spin mx-auto" /> : 'Analyze'}
                </button>
            </div>

            {isLoading && !response && (
                <div className="mt-6 text-center">
                    <IconSpinner className="w-12 h-12 animate-spin text-[var(--accent-primary)] mx-auto" />
                    <p className="mt-4 text-[var(--text-secondary)] uppercase">Engaging quantum processor...</p>
                </div>
            )}

            {error && <div className="mt-6 border border-red-500 bg-red-500/10 text-red-300 p-4">{error}</div>}
            
            {response && (
                <div className="mt-6 game-card">
                    <div className="flex justify-between items-start">
                        <h3 className="text-xl font-semibold mb-4 text-[var(--accent-primary)] uppercase">Result</h3>
                         <button onClick={handleSpeak} disabled={isSpeaking} className="p-2 rounded-full hover:bg-[var(--border-color)] disabled:opacity-50 transition-colors">
                           {isSpeaking ? <IconSpinner className="w-6 h-6 animate-spin"/> : <IconVolumeUp className="w-6 h-6" />}
                        </button>
                    </div>
                    <p className="whitespace-pre-wrap text-[var(--text-primary)] font-mono text-sm">{response}</p>
                </div>
            )}
        </div>
    );
};

export default ComplexQueryPanel;