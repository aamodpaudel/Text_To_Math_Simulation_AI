"use client";

import { useEffect, useRef, useState } from "react";

export default function Avatar({ textToSpeak }: { textToSpeak: string }) {
    const avatarRef = useRef<HTMLDivElement>(null);
    const headRef = useRef<any>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (!avatarRef.current) return;

        const initAvatar = async () => {
            try {
                // Dynamic import to avoid SSR build issues with the library's dynamic require/imports
                const { TalkingHead } = await import("@met4citizen/talkinghead");

                const nodeAvatar = document.getElementById("avatar-container");
                if (!nodeAvatar) return;

                // Configuration for TalkingHead
                // Using the glb file we moved to public/face.glb
                const head = new TalkingHead(nodeAvatar, {
                    ttsEndpoint: "https://eu-texttospeech.googleapis.com/v1beta1/text:synthesize",
                    cameraView: "upper",
                });

                // Load the model
                await head.showAvatar({
                    url: "/face.glb",
                    body: "F",
                    avatarMood: "neutral",
                    ttsLang: "en-GB",
                    ttsVoice: "en-GB-Standard-A",
                    lipsyncLang: "en",
                });

                headRef.current = head;
                setIsLoaded(true);
            } catch (error) {
                console.error("Failed to load avatar:", error);
            }
        };

        if (!headRef.current) {
            initAvatar();
        }

        // Cleanup? The library might not have a clean destroy method easily documented, 
        // but we should avoid double init.
        return () => {
            // cleanup if needed
        }
    }, []);

    useEffect(() => {
        if (isLoaded && headRef.current && textToSpeak) {
            headRef.current.speakText(textToSpeak);
        }
    }, [textToSpeak, isLoaded]);

    return (
        <div
            id="avatar-container"
            ref={avatarRef}
            className="w-full h-full min-h-[400px] bg-slate-900 rounded-lg overflow-hidden relative"
        >
            {!isLoaded && (
                <div className="absolute inset-0 flex items-center justify-center text-white">
                    Loading Avatar...
                </div>
            )}
        </div>
    );
}
