'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { chatHelpers, authHelpers } from '@/lib/supabase';
import { Send, User as UserIcon } from 'lucide-react';

type Message = {
    id: string;
    message: string;
    created_at: string;
    user_id: string;
    sender?: {
        first_name: string;
        last_name: string;
    };
};

export default function MobileChatPage() {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadMessages();
        const subscription = chatHelpers.subscribeToMessages((payload) => {
            // Fetch the new message with sender details to ensure we display the name correctly
            // A simpler way is to just fetch the user details or rely on payload if we don't need joins immediately
            // But payload won't have the joined sender data effectively without another fetch.
            // For now, let's just reload recent messages or handle optimistic UI.
            // Ideally we'd fetch the single new message with relation.
            loadMessages();
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const loadMessages = async () => {
        const { data, error } = await chatHelpers.getMessages(50);
        if (data) {
            setMessages(data as Message[]);
        }
        setLoading(false);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !user) return;

        const messageText = newMessage.trim();
        setNewMessage(''); // Clear input immediately

        // Optimistic update (optional, but good UX)
        // We'll wait for the real update from subscription/response for simplicity to avoid duplication IDs

        const { error } = await chatHelpers.sendMessage(messageText);
        if (error) {
            console.error('Error sending message:', error);
            // Optionally restore the message to input or show error
        } else {
            // The subscription will pick it up, or we can refresh
            loadMessages();
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 pb-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-gray-100 pb-20 max-w-md mx-auto relative">
            {/* Header */}
            <div className="bg-white px-4 py-3 shadow-sm flex items-center justify-between sticky top-0 z-10">
                <h1 className="text-lg font-bold text-gray-800">Team Chat</h1>
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-green-600 flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                        Online
                    </span>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => {
                    const isOwnMessage = msg.user_id === user?.id;
                    const senderName = msg.sender
                        ? `${msg.sender.first_name} ${msg.sender.last_name}`
                        : 'Unknown User';

                    return (
                        <div
                            key={msg.id}
                            className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                        >
                            {!isOwnMessage && (
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2 flex-shrink-0">
                                    <UserIcon className="w-4 h-4 text-blue-600" />
                                </div>
                            )}

                            <div className={`max-w-[75%] rounded-2xl px-4 py-2 shadow-sm ${isOwnMessage
                                    ? 'bg-blue-600 text-white rounded-tr-none'
                                    : 'bg-white text-gray-800 rounded-tl-none'
                                }`}>
                                {!isOwnMessage && (
                                    <p className="text-xs font-semibold text-blue-600 mb-1">
                                        {senderName}
                                    </p>
                                )}
                                <p className="text-sm">{msg.message}</p>
                                <p className={`text-[10px] mt-1 text-right ${isOwnMessage ? 'text-blue-100' : 'text-gray-400'
                                    }`}>
                                    {formatTime(msg.created_at)}
                                </p>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white p-3 border-t border-gray-200 sticky bottom-16">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-gray-100 border-0 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-800 placeholder-gray-500"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
}
