import React, { useState, useCallback, useRef } from 'react';
import { generateImage, editImage } from '../services/geminiService';
import { IconSpinner, IconImage } from './Icons';
import FeatureHeader from './common/FeatureHeader';
import { FeatureID } from '../constants';

type Mode = 'generate' | 'edit';

const ImageGenerationPanel: React.FC = () => {
    const [mode, setMode] = useState<Mode>('generate');
    const [prompt, setPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState('1:1');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [editFile, setEditFile] = useState<File | null>(null);
    const [editPreview, setEditPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setEditFile(selectedFile);
            setGeneratedImage(null);
            setError(null);
            setEditPreview(URL.createObjectURL(selectedFile));
        }
    };
    
    const handleModeChange = (newMode: Mode) => {
        setMode(newMode);
        setError(null);
        setGeneratedImage(null);
    }

    const handleSubmit = useCallback(async () => {
        if (!prompt.trim() || isLoading) return;
        if (mode === 'edit' && !editFile) return;

        setIsLoading(true);
        setError(null);
        setGeneratedImage(null);

        try {
            let result;
            if (mode === 'generate') {
                result = await generateImage(prompt, aspectRatio);
                const base64Image = result.generatedImages?.[0]?.image.imageBytes;
                if (base64Image) {
                    setGeneratedImage(`data:image/jpeg;base64,${base64Image}`);
                } else {
                    throw new Error("Image generation failed to return an image.");
                }
            } else { // edit mode
                if(!editFile) throw new Error("No file selected for editing.");
                result = await editImage(editFile, prompt);
                const editedPart = result.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
                if (editedPart && editedPart.inlineData) {
                     setGeneratedImage(`data:${editedPart.inlineData.mimeType};base64,${editedPart.inlineData.data}`);
                } else {
                     throw new Error("Image editing failed to return an image.");
                }
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
            console.error("Image generation/editing error:", err);
        } finally {
            setIsLoading(false);
        }
    }, [prompt, isLoading, mode, editFile, aspectRatio]);

    const imageToShow = generatedImage || editPreview;

    return (
        <div className="max-w-4xl mx-auto">
            <FeatureHeader featureId={FeatureID.ImageGeneration} />

            <div className="flex justify-center mb-6">
                <div className="p-1 border border-[var(--border-color)] flex space-x-1 bg-[var(--bg-secondary)]">
                    <button onClick={() => handleModeChange('generate')} className={`px-4 py-2 uppercase text-sm font-bold transition-colors ${mode === 'generate' ? 'bg-[var(--accent-primary)] text-[var(--bg-primary)]' : 'text-[var(--text-secondary)] hover:text-white'}`}>Generate</button>
                    <button onClick={() => handleModeChange('edit')} className={`px-4 py-2 uppercase text-sm font-bold transition-colors ${mode === 'edit' ? 'bg-[var(--accent-primary)] text-[var(--bg-primary)]' : 'text-[var(--text-secondary)] hover:text-white'}`}>Edit</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {/* Left Column: Controls */}
                <div className="space-y-4">
                    {mode === 'edit' && (
                        <div 
                          className="border-2 border-dashed border-[var(--border-color)] p-4 text-center cursor-pointer hover:border-[var(--accent-primary)] hover:bg-[var(--border-color)] transition-colors"
                          onClick={() => fileInputRef.current?.click()}
                        >
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                            <p className="uppercase text-sm">{editPreview ? 'Image Loaded. Click to change.' : 'Upload Image For Editing'}</p>
                        </div>
                    )}
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder={mode === 'generate' ? "e.g., A robot scientist in a chemistry lab" : "e.g., Add a retro filter to the image"}
                        className="game-textarea"
                        rows={4}
                    />
                    {mode === 'generate' && (
                        <div>
                            <label className="text-xs text-[var(--text-secondary)] mb-1 block uppercase">Aspect Ratio</label>
                            <select
                                value={aspectRatio}
                                onChange={(e) => setAspectRatio(e.target.value)}
                                className="game-select"
                            >
                                <option value="1:1">Square (1:1)</option>
                                <option value="16:9">Landscape (16:9)</option>
                                <option value="9:16">Portrait (9:16)</option>
                                <option value="4:3">Standard (4:3)</option>
                                <option value="3:4">Tall (3:4)</option>
                            </select>
                        </div>
                    )}
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading || !prompt.trim() || (mode === 'edit' && !editFile)}
                        className="game-button w-full text-lg"
                    >
                        {isLoading ? <IconSpinner className="w-6 h-6 animate-spin mx-auto" /> : (mode === 'generate' ? 'Generate' : 'Edit Image')}
                    </button>
                </div>
                {/* Right Column: Image Display */}
                <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-4 aspect-square flex items-center justify-center relative">
                     <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[var(--accent-primary)]"></div>
                     <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[var(--accent-primary)]"></div>
                     <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[var(--accent-primary)]"></div>
                     <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[var(--accent-primary)]"></div>

                    {isLoading ? (
                        <div className="text-center">
                            <IconSpinner className="w-12 h-12 animate-spin text-[var(--accent-primary)] mx-auto" />
                            <p className="mt-2 text-[var(--text-secondary)] uppercase">Processing...</p>
                        </div>
                    ) : error ? (
                        <div className="text-red-400 text-center">{error}</div>
                    ) : imageToShow ? (
                        <img src={imageToShow} alt="Generated or edited" className="max-w-full max-h-full object-contain" />
                    ) : (
                        <div className="text-[var(--text-secondary)] text-center">
                            <IconImage className="w-16 h-16 mx-auto mb-2" />
                            <p className="uppercase text-sm">{mode === 'generate' ? 'Output will appear here' : 'Edited image will appear here'}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ImageGenerationPanel;