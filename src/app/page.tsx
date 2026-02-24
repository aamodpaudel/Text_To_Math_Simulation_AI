"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Blackboard from "@/components/Blackboard";
import ChatInterface from "@/components/ChatInterface";
import { sendMessageToAI } from "@/lib/llm";

// Dynamically import Avatar to avoid SSR issues with talkinghead library
// Avatar removed per user request
// const Avatar = dynamic(() => import("@/components/Avatar"), { ssr: false });

export default function Home() {
    const [avatarText, setAvatarText] = useState("Hello! I am your math tutor. Ask me anything.");
    const [boardCode, setBoardCode] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSendMessage = async (text: string) => {
        setIsProcessing(true);
        // Initial feedback
        // setAvatarText("Thinking..."); 

        try {
            const response = await sendMessageToAI(text);
            if (response.speak) {
                setAvatarText(response.speak);
            }
            if (response.code) {
                setBoardCode(response.code);
            }
        } catch (e) {
            console.error(e);
            setAvatarText("Something went wrong.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <main className="flex min-h-screen flex-col bg-slate-950 text-white">
            <div className="flex-1 flex flex-col md:flex-row p-4 gap-4 h-[calc(100vh-80px)]">
                {/* Left Panel: Avatar */}
                <div className="md:w-1/2 w-full h-full min-h-[300px] border border-slate-800 rounded-xl bg-slate-900 overflow-hidden shadow-lg shadow-blue-900/10 relative flex flex-col">
                    <div className="absolute top-0 left-0 w-full p-2 bg-slate-800/50 text-slate-400 text-xs font-mono uppercase tracking-wider border-b border-white/5">
                        Tutor Response
                    </div>
                    <div className="flex-1 p-8 flex items-center justify-center text-center overflow-y-auto">
                        <p className="text-lg md:text-2xl font-light leading-relaxed text-blue-100 animate-in fade-in duration-500">
                            {avatarText}
                        </p>
                    </div>
                </div>

                {/* Right Panel: Blackboard */}
                <div className="md:w-1/2 w-full h-full min-h-[300px] border border-slate-800 rounded-xl bg-slate-900 overflow-hidden shadow-lg shadow-purple-900/10">
                    <Blackboard code={boardCode} />
                </div>
            </div>

            {/* Chat Interface */}
            <div className="h-20 w-full max-w-4xl mx-auto">
                <ChatInterface onSendMessage={handleSendMessage} isProcessing={isProcessing} />
            </div>
        </main>
    );
}
