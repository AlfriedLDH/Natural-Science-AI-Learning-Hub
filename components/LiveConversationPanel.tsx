
import React, { useState, useEffect, useRef, useCallback } from 'react';
// FIX: Removed LiveSession from import as it is not an exported member of @google/genai.
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from "@google/genai";
import { MODELS } from '../constants';
import { decodeAudioData, decodeBase64, encodeAudio } from '../utils/media';
import { IconMic, IconSpinner } from './Icons';
import FeatureHeader from './common/FeatureHeader';
import { FeatureID } from '../constants';

type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

// FIX: Defined a local LiveSession interface to correctly type the session object.
interface LiveSession {
    sendRealtimeInput(params: { media: Blob }): void;
    close(): void;
}

const LiveConversationPanel: React.FC = () => {
    const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
    const [transcriptions, setTranscriptions] = useState<{ user: string; model: string }[]>([]);
    const [currentInput, setCurrentInput] = useState('');
    const [currentOutput, setCurrentOutput] = useState('');
    
    const sessionRef = useRef<Promise<LiveSession> | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);

    const stopConversation = useCallback(() => {
        if (sessionRef.current) {
            sessionRef.current.then(session => session.close());
            sessionRef.current = null;
        }
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }
        if (scriptProcessorRef.current) {
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current = null;
        }
        if (sourceNodeRef.current) {
            sourceNodeRef.current.disconnect();
            sourceNodeRef.current = null;
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close().catch(console.error);
        }
        setConnectionState('disconnected');
        setCurrentInput('');
        setCurrentOutput('');
    }, []);

    const startConversation = useCallback(async () => {
        if (connectionState !== 'disconnected') return;
        setConnectionState('connecting');
        setTranscriptions([]);
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            let nextStartTime = 0;

            const sessionPromise = ai.live.connect({
                model: MODELS.live,
                config: {
                    responseModalities: [Modality.AUDIO],
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
                    systemInstruction: 'You are a friendly and helpful science tutor. Keep your answers concise and conversational.'
                },
                callbacks: {
                    onopen: async () => {
                        setConnectionState('connected');
                        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                        mediaStreamRef.current = stream;
                        
                        const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
                        audioContextRef.current = inputAudioContext;
                        
                        const source = inputAudioContext.createMediaStreamSource(stream);
                        sourceNodeRef.current = source;

                        const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
                        scriptProcessorRef.current = scriptProcessor;

                        scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const pcmBlob: Blob = {
                                data: encodeAudio(new Uint8Array(new Int16Array(inputData.map(v => v * 32768)).buffer)),
                                mimeType: 'audio/pcm;rate=16000',
                            };
                            sessionPromise.then((session) => session.sendRealtimeInput({ media: pcmBlob }));
                        };
                        source.connect(scriptProcessor);
                        scriptProcessor.connect(inputAudioContext.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        let tempInput = currentInput;
                        let tempOutput = currentOutput;

                        if (message.serverContent?.inputTranscription) {
                            const text = message.serverContent.inputTranscription.text;
                            setCurrentInput(prev => prev + text);
                            tempInput += text;
                        }
                        if (message.serverContent?.outputTranscription) {
                            const text = message.serverContent.outputTranscription.text;
                            setCurrentOutput(prev => prev + text);
                            tempOutput += text;
                        }

                        if (message.serverContent?.turnComplete) {
                            if (tempInput.trim() || tempOutput.trim()) {
                                setTranscriptions(prev => [...prev, { user: tempInput, model: tempOutput }]);
                            }
                            setCurrentInput('');
                            setCurrentOutput('');
                        }
                        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                        if (base64Audio) {
                            nextStartTime = Math.max(nextStartTime, outputAudioContext.currentTime);
                            const audioBuffer = await decodeAudioData(decodeBase64(base64Audio), outputAudioContext, 24000, 1);
                            const source = outputAudioContext.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(outputAudioContext.destination);
                            source.start(nextStartTime);
                            nextStartTime += audioBuffer.duration;
                        }
                    },
                    onerror: (e) => {
                        console.error('Live session error:', e);
                        setConnectionState('error');
                        stopConversation();
                    },
                    onclose: () => {
                       stopConversation();
                    },
                }
            });
            sessionRef.current = sessionPromise as Promise<LiveSession>;

        } catch (error) {
            console.error('Failed to start conversation:', error);
            setConnectionState('error');
        }
    }, [connectionState, stopConversation, currentInput, currentOutput]);

    useEffect(() => {
        return () => {
            stopConversation();
        };
    }, [stopConversation]);

    const getButtonContent = () => {
        switch (connectionState) {
            case 'connecting':
                return 'CONNECTING...';
            case 'connected':
                return 'END TRANSMISSION';
            case 'error':
                return 'RETRY CONNECTION';
            default:
                return 'START TRANSMISSION';
        }
    }

    return (
        <div className="max-w-4xl mx-auto flex flex-col h-full">
            <FeatureHeader featureId={FeatureID.LiveConversation} />
            <div className="flex-1 game-card overflow-y-auto font-mono text-sm space-y-2">
                {transcriptions.map((turn, index) => (
                    <div key={index}>
                        <p><span className="text-[var(--accent-primary)]">{'> USER: '}</span>{turn.user}</p>
                        <p><span className="text-[var(--accent-secondary)]">{'> AI: '}</span>{turn.model}</p>
                    </div>
                ))}
                {connectionState === 'connected' && (
                    <div className="opacity-60">
                        {currentInput && <p><span className="text-[var(--accent-primary)]">{'> USER: '}</span>{currentInput}</p>}
                        {currentOutput && <p><span className="text-[var(--accent-secondary)]">{'> AI: '}</span>{currentOutput}</p>}
                    </div>
                )}
                 {transcriptions.length === 0 && connectionState !== 'connected' && (
                    <div className="text-center text-[var(--text-secondary)] pt-10">
                        <IconMic className="w-16 h-16 mx-auto mb-4" />
                        <p>AWAITING LIVE AUDIO TRANSMISSION</p>
                    </div>
                )}
            </div>
            <div className="mt-6 flex flex-col items-center justify-center">
                 <button
                    onClick={connectionState === 'connected' ? stopConversation : startConversation}
                    className={`w-40 h-40 rounded-full border-4 flex items-center justify-center text-center font-bold uppercase transition-all duration-300
                        ${connectionState === 'connecting' ? 'border-yellow-500 text-yellow-500 cursor-not-allowed animate-pulse' : ''}
                        ${connectionState === 'connected' ? 'border-red-500 text-red-500 hover:bg-red-500/10 animate-pulse' : ''}
                        ${connectionState === 'disconnected' ? 'border-[var(--accent-primary)] text-[var(--accent-primary)] hover:bg-[var(--accent-primary)] hover:text-[var(--bg-primary)]' : ''}
                        ${connectionState === 'error' ? 'border-orange-500 text-orange-500 hover:bg-orange-500/10' : ''}
                    `}
                    disabled={connectionState === 'connecting'}
                >
                    {getButtonContent()}
                </button>
            </div>
        </div>
    );
};

export default LiveConversationPanel;