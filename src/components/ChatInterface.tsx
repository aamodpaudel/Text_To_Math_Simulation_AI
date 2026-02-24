"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, Send, Square } from "lucide-react";

interface ChatInterfaceProps {
    onSendMessage: (text: string) => void;
    isProcessing: boolean;
}

export default function ChatInterface({ onSendMessage, isProcessing }: ChatInterfaceProps) {
    const [input, setInput] = useState("");
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
            // @ts-ignore
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.lang = "en-US";
            recognitionRef.current.interimResults = false;

            recognitionRef.current.onresult = (event: any) => {
                const text = event.results[0][0].transcript;
                setInput(text);
                handleSend(text); // Auto-send on speech end? Or just populate? Let's auto-send for fluidity.
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }
    }, []);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        } else {
            recognitionRef.current?.start();
            setIsListening(true);
        }
    };

    const handleSend = (text: string) => {
        if (!text.trim()) return;
        onSendMessage(text);
        setInput("");
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend(input);
        }
    };

    return (
        <div className="flex gap-2 p-4 bg-slate-900 border-t border-slate-800">
            <button
                onClick={toggleListening}
                className={`p-3 rounded-full transition-colors ${isListening ? "bg-red-500 hover:bg-red-600 animate-pulse" : "bg-slate-700 hover:bg-slate-600"
                    }`}
                disabled={isProcessing}
            >
                {isListening ? <Square className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5 text-white" />}
            </button>

            <div className="flex-1 relative">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isListening ? "Listening..." : "Type your question here (or click mic)..."}
                    className="w-full h-full pl-4 pr-12 rounded-full bg-slate-800 border-none text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    disabled={isProcessing}
                />
                <button
                    onClick={() => handleSend(input)}
                    disabled={!input.trim() || isProcessing}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 rounded-full hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Send className="w-4 h-4 text-white" />
                </button>
            </div>
        </div>
    );
}
