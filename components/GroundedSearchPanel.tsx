import React, { useState, useCallback } from 'react';
import { generateGroundedResponse } from '../services/geminiService';
import { GroundingChunk } from '../types';
import { IconSpinner, IconSearch, IconVolumeUp } from './Icons';
import FeatureHeader from './common/FeatureHeader';
import { FeatureID } from '../constants';
import { textToSpeech } from '../services/geminiService';
import { decodeAudioData, decodeBase64 } from '../utils/media';


const GroundedSearchPanel: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [response, setResponse] = useState<string | null>(null);
    const [chunks, setChunks] = useState<GroundingChunk[]>([]);
    const [useMaps, setUseMaps] = useState(true);
    const [isSpeaking, setIsSpeaking] = useState(false);

    const handleSearch = useCallback(async () => {
        if (!prompt.trim() || isLoading) return;
        setIsLoading(true);
        setError(null);
        setResponse(null);
        setChunks([]);

        try {
            const result = await generateGroundedResponse(prompt, useMaps);
            setResponse(result.text);
            setChunks(result.candidates?.[0]?.groundingMetadata?.groundingChunks || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
            console.error("Grounded search error:", err);
        } finally {
            setIsLoading(false);
        }
    }, [prompt, isLoading, useMaps]);

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
            <FeatureHeader featureId={FeatureID.GroundedSearch} />
            
            <div className="flex items-center p-1 bg-[var(--bg-secondary)] border border-[var(--border-color)] mb-4">
                <IconSearch className="w-5 h-5 text-[var(--accent-primary)] mx-3" />
                <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Query real-time data streams..."
                    className="w-full bg-transparent p-2 focus:outline-none placeholder-[var(--text-secondary)]"
                    disabled={isLoading}
                />
                <button
                    onClick={handleSearch}
                    disabled={isLoading || !prompt.trim()}
                    className="game-button ml-2"
                >
                    {isLoading ? <IconSpinner className="w-5 h-5 animate-spin" /> : 'Search'}
                </button>
            </div>
             <div className="flex justify-end items-center mb-6 space-x-2">
                <label htmlFor="maps-toggle" className="text-xs text-[var(--text-secondary)] uppercase">Use Geo-Nodes (Maps)</label>
                <input
                    id="maps-toggle"
                    type="checkbox"
                    checked={useMaps}
                    onChange={(e) => setUseMaps(e.target.checked)}
                    className="toggle-checkbox"
                />
            </div>


            {error && <div className="border border-red-500 bg-red-500/10 text-red-300 p-4">{error}</div>}
            
            {response && (
                <div className="mt-6 game-card">
                    <div className="flex justify-between items-start">
                        <h3 className="text-xl font-semibold mb-4 text-[var(--accent-primary)] uppercase">Data Stream</h3>
                        <button onClick={handleSpeak} disabled={isSpeaking} className="p-2 rounded-full hover:bg-[var(--border-color)] disabled:opacity-50 transition-colors">
                           {isSpeaking ? <IconSpinner className="w-6 h-6 animate-spin text-[var(--accent-primary)]"/> : <IconVolumeUp className="w-6 h-6 text-[var(--accent-primary)]" />}
                        </button>
                    </div>

                    <p className="whitespace-pre-wrap text-[var(--text-primary)] font-mono text-sm">{response}</p>
                    
                    {chunks.length > 0 && (
                        <div className="mt-6 border-t border-[var(--border-color)] pt-4">
                            <h4 className="font-semibold text-[var(--text-secondary)] mb-2 uppercase text-xs">Sources:</h4>
                            <ul className="space-y-2 text-sm">
                                {chunks.map((chunk, index) => (
                                    <li key={index}>
                                        {/* FIX: Check for uri before rendering link and provide fallback for title. */}
                                        {chunk.web?.uri && (
                                            <a href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">{`[WEB] ${chunk.web.title || chunk.web.uri}`}</a>
                                        )}
                                        {/* FIX: Check for uri before rendering link and provide fallback for title. */}
                                        {chunk.maps?.uri && (
                                             <a href={chunk.maps.uri} target="_blank" rel="noopener noreferrer" className="text-green-400 hover:underline">{`[MAP] ${chunk.maps.title || chunk.maps.uri}`}</a>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default GroundedSearchPanel;