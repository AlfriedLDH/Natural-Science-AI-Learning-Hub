

export interface ChatMessage {
    role: 'user' | 'model';
    parts: { text: string }[];
}

export interface GroundingChunk {
    web?: {
// FIX: Made uri and title optional to match the type from @google/genai library.
        uri?: string;
        title?: string;
    };
    maps?: {
        // FIX: Made uri and title optional to match the type from @google/genai library to resolve type error.
        uri?: string;
        title?: string;
        // FIX: Changed placeAnswerSources from an array of objects to an object to match the @google/genai SDK type.
        placeAnswerSources?: {
            reviewSnippets: {
                uri: string;
                text: string;
            }[];
        }
    }
}

// FIX: Added ShopItem interface for the Marketplace feature.
export interface ShopItem {
    id: string;
    name: string;
    description: string;
    cost: number;
    type: 'avatar' | 'theme';
}

// FIX: Added fields to User interface for Marketplace feature.
export interface User {
    id: string;
    username: string;
    // In a real app, this would be a securely hashed password.
    // Here, it's stored as plain text for demonstration purposes.
    password?: string; 
    gold: number;
    inventory: string[];
    avatar: string;
    theme: string;
}

export interface QuizQuestion {
    question: string;
    options: string[];
    correctAnswer: string;
}

export interface QuizResult {
    subject: string;
    score: number;
    total: number;
    timestamp: number;
}