
import { IconChat, IconSearch, IconMedia, IconImage, IconBrain, IconMic, IconDashboard, IconQuiz, IconTrophy } from './components/Icons';
// FIX: Imported ShopItem type for SHOP_ITEMS constant.
import { ShopItem } from '../types';

export enum FeatureID {
    Dashboard = 'dashboard',
    Exercises = 'exercises',
    Leaderboard = 'leaderboard',
    Chat = 'chat',
    GroundedSearch = 'groundedSearch',
    MediaAnalysis = 'mediaAnalysis',
    ImageGeneration = 'imageGeneration',
    ComplexQuery = 'complexQuery',
    LiveConversation = 'liveConversation',
    // FIX: Added Marketplace to FeatureID enum.
    Marketplace = 'marketplace',
}

export const FEATURES = {
    [FeatureID.Dashboard]: { id: FeatureID.Dashboard, name: 'Dashboard', icon: IconDashboard, description: "Your personal mission control for learning." },
    [FeatureID.Exercises]: { id: FeatureID.Exercises, name: 'Exercises', icon: IconQuiz, description: "Test your knowledge with AI-generated quizzes." },
    [FeatureID.Leaderboard]: { id: FeatureID.Leaderboard, name: 'Leaderboard', icon: IconTrophy, description: "See how you rank among other learners." },
    [FeatureID.Chat]: { id: FeatureID.Chat, name: 'AI Chat', icon: IconChat, description: "Ask questions and get quick answers on any subject." },
    [FeatureID.GroundedSearch]: { id: FeatureID.GroundedSearch, name: 'Grounded Search', icon: IconSearch, description: "Get up-to-date info from Google Search & Maps." },
    [FeatureID.MediaAnalysis]: { id: FeatureID.MediaAnalysis, name: 'Media Analysis', icon: IconMedia, description: "Analyze images and videos to extract key information." },
    [FeatureID.ImageGeneration]: { id: FeatureID.ImageGeneration, name: 'Image Generation', icon: IconImage, description: "Create and edit images from text prompts." },
    [FeatureID.ComplexQuery]: { id: FeatureID.ComplexQuery, name: 'Deep Analysis', icon: IconBrain, description: "Leverage advanced reasoning for complex problems." },
    [FeatureID.LiveConversation]: { id: FeatureID.LiveConversation, name: 'Live Conversation', icon: IconMic, description: "Talk with AI in a real-time voice conversation." },
    // FIX: Added Marketplace to FEATURES object.
    [FeatureID.Marketplace]: { id: FeatureID.Marketplace, name: 'Marketplace', icon: IconTrophy, description: "Purchase new items for your profile." },
} as const;


export const SUBJECTS = [
    "Toán học (Mathematics)",
    "Vật lý (Physics)",
    "Hóa học (Chemistry)",
    "Sinh học (Biology)",
    "Tin học (Computer Science)"
];

export const MODELS = {
    chat: 'gemini-2.5-flash',
    chatLite: 'gemini-2.5-flash-lite',
    pro: 'gemini-2.5-pro',
    imageAnalysis: 'gemini-2.5-flash',
    videoAnalysis: 'gemini-2.5-pro',
    imageGeneration: 'imagen-4.0-generate-001',
    imageEditing: 'gemini-2.5-flash-image',
    tts: 'gemini-2.5-flash-preview-tts',
    live: 'gemini-2.5-flash-native-audio-preview-09-2025'
};

// FIX: Added constants for the Marketplace feature.
export const AVATARS: { [key: string]: string } = {
    'default': `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>`,
    'avatar1': `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 21v-1.5M15.75 3v1.5M19.5 8.25h1.5m-18 0h1.5m15 3.75h1.5m-18 0h1.5m15 3.75h1.5m-18 0h1.5M15.75 21v-1.5m-4.5-16.5a1.5 1.5 0 00-3 0V6a1.5 1.5 0 003 0V4.5zM12 9a1.5 1.5 0 011.5 1.5v3A1.5 1.5 0 0112 15a1.5 1.5 0 01-1.5-1.5v-3A1.5 1.5 0 0112 9z" /></svg>`,
};

export const THEMES: { [key: string]: { name: string; gradient: string } } = {
    'default': { name: 'Default', gradient: 'transparent' },
    'theme1': { name: 'Nebula', gradient: 'linear-gradient(to right, #6a11cb 0%, #2575fc 100%)' },
};

export const SHOP_ITEMS: ShopItem[] = [
    { id: 'avatar1', name: 'AI Core', description: 'A sleek, futuristic AI avatar.', cost: 100, type: 'avatar' },
    { id: 'theme1', name: 'Nebula', description: 'A cosmic theme for your interface.', cost: 500, type: 'theme' },
];
