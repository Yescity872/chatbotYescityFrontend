"use client";

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, Map as MapIcon, Loader2, LogOut } from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';


interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface ChatInterfaceProps {
    onMapRequest: (params: any) => void;
}

export default function ChatInterface({ onMapRequest }: ChatInterfaceProps) {
    const { logout } = useAuth();
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Hi! I’m your YesCity guide. Ask me to find places or show you a map!' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsLoading(true);

        try {
            // Filter history to send only user/assistant text for context (avoid large payloads if possible)
            // But for now, sending recent context is key.
            const history = messages.map(m => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.content }] }));

            // Add current message
            const currentMessage = { role: 'user', parts: [{ text: userMsg }] };

            const response = await axios.post('/api/chat', {
                history: history, // Send previous context
                message: userMsg  // Current input
            });
            const data = response.data;

            if (data.type === 'tool_use' && data.tool === 'map') {
                const reply = data.reply || `Opening map for ${data.params.cityName}...`;
                setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
                onMapRequest(data.params);
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: data.reply || "I didn't understand that." }]);
            }
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I had trouble connecting to the server." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white/80 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden border border-white/20">

            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <h2 className="font-semibold text-lg tracking-wide">YesCity AI</h2>
                </div>
                <button
                    onClick={() => logout()}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium transition-colors border border-white/10 shadow-sm"
                    title="Logout"
                >
                    <LogOut size={14} />
                    <span>Logout</span>
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                {messages.map((m, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={clsx(
                            "flex w-full mb-2",
                            m.role === 'user' ? "justify-end" : "justify-start"
                        )}
                    >
                        <div className={clsx(
                            "max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm",
                            m.role === 'user'
                                ? "bg-blue-600 text-white rounded-br-none"
                                : "bg-gray-100 text-gray-800 rounded-bl-none border border-gray-200"
                        )}>
                            {m.content}
                        </div>
                    </motion.div>
                ))}
                {isLoading && (
                    <div className="flex justify-start w-full">
                        <div className="bg-gray-50 p-3 rounded-2xl rounded-bl-none border border-gray-100 flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                            <span className="text-xs text-gray-500 font-medium">Thinking...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} className="p-4 bg-white border-t border-gray-100">
                <div className="flex gap-2 items-center bg-gray-50 p-2 rounded-full border border-gray-200 focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                    <input
                        type="text"
                        className="flex-1 bg-transparent px-4 py-2 outline-none text-gray-700 placeholder-gray-400"
                        placeholder="Type a message..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </form>
        </div>
    );
}
