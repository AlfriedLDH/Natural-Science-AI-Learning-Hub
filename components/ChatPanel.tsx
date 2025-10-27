import React, { useState, useRef, useEffect, useCallback } from 'react';
import { generateChatResponse, getLiteResponse } from '../services/geminiService';
import { ChatMessage } from '../types';
import { IconBrain, IconChat, IconSpinner } from './Icons';
import FeatureHeader from './common/FeatureHeader';
import { FeatureID } from '../constants';

const ChatPanel: React.FC = () => {
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useLite, setUseLite] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [history]);
  
  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;
  
    const userMessage: ChatMessage = { role: 'user', parts: [{ text: input }] };
    setHistory(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
  
    try {
        const responseGenerator = useLite ? getLiteResponse : (prompt: string) => generateChatResponse(prompt).then(res => res);
        const response = await responseGenerator(input);
        const modelMessage: ChatMessage = { role: 'model', parts: [{ text: response.text }] };
        setHistory(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error("Error generating chat response:", error);
      const errorMessage: ChatMessage = { role: 'model', parts: [{ text: "Sorry, I encountered an error. Please try again." }] };
      setHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, useLite]);


  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      <FeatureHeader featureId={FeatureID.Chat} />
      
      <div className="flex-1 overflow-y-auto pr-4 space-y-6">
        {history.map((msg, index) => (
          <div key={index} className={`flex items-start gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'model' && <IconBrain className="w-8 h-8 text-[var(--accent-secondary)] flex-shrink-0 mt-1" />}
            <div className={`px-5 py-3 max-w-lg relative text-sm ${
                msg.role === 'user' 
                ? 'bg-[var(--accent-primary)] text-[var(--bg-primary)]' 
                : 'bg-[var(--bg-secondary)] text-[var(--text-primary)]'
            }`} style={{
                clipPath: msg.role === 'user'
                ? 'polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 calc(100% - 10px), 10px 100%)' // TODO this is not right
                : 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)'
            }}>
              <p className="whitespace-pre-wrap">{msg.parts[0].text}</p>
            </div>
             {msg.role === 'user' && <div className="w-8 h-8 bg-gray-600 flex items-center justify-center flex-shrink-0 mt-1 font-bold">U</div>}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <div className="mt-6">
        <div className="flex items-center border border-[var(--border-color)] p-1 bg-[var(--bg-secondary)]">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                }
            }}
            placeholder="Engage with the Science AI..."
            className="w-full bg-transparent p-2 focus:outline-none resize-none placeholder-[var(--text-secondary)]"
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="game-button ml-2"
          >
            {isLoading ? <IconSpinner className="w-5 h-5 animate-spin" /> : 'Send'}
          </button>
        </div>
         <div className="flex justify-end items-center mt-2 space-x-2">
            <label htmlFor="lite-toggle" className="text-xs text-[var(--text-secondary)] uppercase">Low-latency Mode</label>
            <input 
                id="lite-toggle"
                type="checkbox" 
                checked={useLite} 
                onChange={() => setUseLite(!useLite)} 
                className="toggle-checkbox"
            />
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;