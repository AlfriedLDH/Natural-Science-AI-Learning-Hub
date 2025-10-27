




import { GoogleGenAI, GenerateContentResponse, Chat, Modality, GenerateImagesResponse, Type } from "@google/genai";
import { MODELS } from '../constants';
import { ChatMessage, QuizQuestion } from "../types";

const getAI = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("API_KEY environment variable not set");
    }
    return new GoogleGenAI({ apiKey });
}

let chatInstance: Chat | null = null;
const getChatInstance = () => {
    if (!chatInstance) {
        const ai = getAI();
        chatInstance = ai.chats.create({
            model: MODELS.chat,
            config: {
                systemInstruction: 'You are a helpful AI assistant specialized in natural sciences (Math, Physics, Chemistry, Biology, Computer Science). Answer questions clearly and concisely.',
            },
        });
    }
    return chatInstance;
}

export const generateChatResponse = async (prompt: string): Promise<GenerateContentResponse> => {
    const chat = getChatInstance();
    return await chat.sendMessage({ message: prompt });
}

export const generateGroundedResponse = async (prompt: string, useMaps: boolean): Promise<GenerateContentResponse> => {
    const ai = getAI();
    const tools = useMaps ? [{ googleMaps: {} }, { googleSearch: {} }] : [{ googleSearch: {} }];
    
    // Attempt to get user location for maps
    let toolConfig = {};
    if (useMaps && navigator.geolocation) {
        try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
            });
            toolConfig = {
                retrievalConfig: {
                    latLng: {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    }
                }
            }
        } catch (error) {
            console.warn("Could not get user location for Maps grounding:", error);
        }
    }

    return await ai.models.generateContent({
        model: MODELS.chat,
        contents: prompt,
        config: { tools },
        ...(Object.keys(toolConfig).length > 0 && { toolConfig })
    });
}

export const analyzeMedia = async (file: File, prompt: string): Promise<GenerateContentResponse> => {
    const ai = getAI();
    const { fileToBase64 } = await import('../utils/media');
    const base64Data = await fileToBase64(file);

    const isVideo = file.type.startsWith('video/');
    const model = isVideo ? MODELS.videoAnalysis : MODELS.imageAnalysis;

    return ai.models.generateContent({
        model,
        contents: {
            parts: [
                { inlineData: { mimeType: file.type, data: base64Data } },
                { text: prompt }
            ]
        },
    });
}

// FIX: Changed return type from GenerateContentResponse to GenerateImagesResponse to match the return value of generateImages.
export const generateImage = async (prompt: string, aspectRatio: string): Promise<GenerateImagesResponse> => {
    const ai = getAI();
    return ai.models.generateImages({
        model: MODELS.imageGeneration,
        prompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio,
        },
    });
}


export const editImage = async (file: File, prompt: string): Promise<GenerateContentResponse> => {
    const ai = getAI();
    const { fileToBase64 } = await import('../utils/media');
    const base64Data = await fileToBase64(file);
    
    return ai.models.generateContent({
        model: MODELS.imageEditing,
        contents: {
            parts: [
                { inlineData: { mimeType: file.type, data: base64Data } },
                { text: prompt }
            ]
        },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });
}


export const generateComplexResponse = async (prompt: string): Promise<GenerateContentResponse> => {
    const ai = getAI();
    return await ai.models.generateContent({
        model: MODELS.pro,
        contents: prompt,
        config: {
            thinkingConfig: { thinkingBudget: 32768 }
        }
    });
}

export const textToSpeech = async (text: string): Promise<GenerateContentResponse> => {
    const ai = getAI();
    return await ai.models.generateContent({
        model: MODELS.tts,
        contents: [{ parts: [{ text: `Say with a clear and helpful tone: ${text}` }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Kore' },
                },
            },
        },
    });
}

export const getLiteResponse = async (prompt: string): Promise<GenerateContentResponse> => {
    const ai = getAI();
    return ai.models.generateContent({
        model: MODELS.chatLite,
        contents: prompt
    });
};


const quizSchema = {
    type: Type.OBJECT,
    properties: {
        questions: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    question: { type: Type.STRING },
                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                    correctAnswer: { type: Type.STRING }
                },
                required: ["question", "options", "correctAnswer"]
            }
        }
    }
};

export const generateQuiz = async (subject: string): Promise<QuizQuestion[]> => {
    const ai = getAI();
    const prompt = `Generate a 5-question multiple-choice quiz about ${subject} at a high school level. Each question should have 4 options. Ensure the correctAnswer value exactly matches one of the values in the options array.`;

    const response = await ai.models.generateContent({
        model: MODELS.chat,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: quizSchema,
        },
    });
    
    const jsonResponse = JSON.parse(response.text);
    return jsonResponse.questions;
};