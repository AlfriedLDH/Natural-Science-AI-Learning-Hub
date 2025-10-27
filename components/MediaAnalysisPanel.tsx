import React, { useState, useCallback, useRef } from 'react';
import { analyzeMedia } from '../services/geminiService';
import { IconSpinner, IconVolumeUp } from './Icons';
import FeatureHeader from './common/FeatureHeader';
import { FeatureID } from '../constants';
import { textToSpeech } from '../services/geminiService';
import { decodeAudioData, decodeBase64 } from '../utils/media';

const MediaAnalysisPanel: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [response, setResponse] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setResponse(null);
            setError(null);
            setPreviewUrl(URL.createObjectURL(selectedFile));
        }
    };

    const handleAnalyze = useCallback(async () => {
        if (!file || !prompt.trim() || isLoading) return;
        setIsLoading(true);
        setError(null);
        setResponse(null);

        try {
            const result = await analyzeMedia(file, prompt);
            setResponse(result.text);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
            console.error("Media analysis error:", err);
        } finally {
            setIsLoading(false);
        }
    }, [file, prompt, isLoading]);

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
            <FeatureHeader featureId={FeatureID.MediaAnalysis} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column: Upload and Prompt */}
                <div className="space-y-4 flex flex-col">
                    <div 
                      className="border-2 border-dashed border-[var(--border-color)] p-6 text-center cursor-pointer hover:border-[var(--accent-primary)] hover:bg-[var(--border-color)] transition-colors flex-1 flex flex-col justify-center"
                      onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*,video/*"
                            className="hidden"
                        />
                        {previewUrl ? (
                             file?.type.startsWith('video/') ? (
                                <video src={previewUrl} controls className="max-h-64 mx-auto" />
                            ) : (
                                <img src={previewUrl} alt="Preview" className="max-h-64 mx-auto" />
                            )
                        ) : (
                            <p className="text-[var(--text-secondary)]">UPLOAD IMAGE / VIDEO</p>
                        )}
                    </div>
                    {file && <p className="text-xs text-center text-[var(--text-secondary)] uppercase">{file.name}</p>}

                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Specify analysis parameters..."
                        className="game-textarea"
                        rows={4}
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleAnalyze}
                        disabled={isLoading || !file || !prompt.trim()}
                        className="game-button w-full text-lg"
                    >
                        {isLoading ? <IconSpinner className="w-6 h-6 animate-spin mx-auto" /> : 'Analyze'}
                    </button>
                </div>

                {/* Right Column: Response */}
                <div className="game-card flex flex-col">
                    {isLoading && !response && (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <IconSpinner className="w-12 h-12 animate-spin text-[var(--accent-primary)]" />
                            <p className="mt-4 text-[var(--text-secondary)] uppercase">Analyzing Datastream</p>
                            {file?.type.startsWith('video/') && <p className="text-xs text-[var(--text-secondary)] mt-1">Video analysis requires more resources.</p>}
                        </div>
                    )}
                    {error && <div className="border border-red-500 bg-red-500/10 text-red-300 p-4">{error}</div>}
                    {response && (
                         <div>
                            <div className="flex justify-between items-start">
                                <h3 className="text-xl font-semibold mb-4 text-[var(--accent-primary)] uppercase">Analysis</h3>
                                <button onClick={handleSpeak} disabled={isSpeaking} className="p-2 rounded-full hover:bg-[var(--border-color)] disabled:opacity-50 transition-colors">
                                   {isSpeaking ? <IconSpinner className="w-6 h-6 animate-spin"/> : <IconVolumeUp className="w-6 h-6" />}
                                </button>
                            </div>
                            <p className="whitespace-pre-wrap text-[var(--text-primary)] font-mono text-sm">{response}</p>
                        </div>
                    )}
                    {!isLoading && !response && !error && (
                         <div className="flex items-center justify-center h-full">
                             <p className="text-[var(--text-secondary)]">Analysis results will appear here.</p>
                         </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MediaAnalysisPanel;