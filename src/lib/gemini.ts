import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

// Initialize LangChain Chat Model
// Using specific version 001 to avoid alias resolution issues
const getChatModel = () => {
    if (!API_KEY) {
        throw new Error("Missing Google API Key");
    }
    return new ChatGoogleGenerativeAI({
        model: "gemini-1.5-pro",
        apiKey: API_KEY,
        maxOutputTokens: 2048,
        temperature: 0.9,
        topK: 40,
        topP: 0.8,
    });
};

const SYSTEM_PROMPT = `You are a visual math tutor. I use the 'Mafs' React library for rendering. 
When explaining a concept, you must provide two outputs in your response:
1. A spoken explanation for the student, prefixed with [SPEAK].
2. A snippet of valid React 'Mafs' code to visualize the concept on a Cartesian plane, prefixed with [CODE].

Example Response:
[SPEAK]
Here is a sine wave. Notice how it oscillates between -1 and 1.
[CODE]
<Mafs height={400}>
  <Coordinates.Cartesian />
  <Plot.OfX y={(x) => Math.sin(x)} color={Theme.blue} />
</Mafs>

Rules for Code:
- Do NOT include markdown code fences (like \`\`\`jsx). Just the raw JSX code.
- You have access to these Mafs components: Mafs, Coordinates, Plot, Theme, useStopwatch, vec, Line, Circle, Math.
- Always wrap your visualization in <Mafs height={400}>...</Mafs>.
- Use <Coordinates.Cartesian /> for axes. 
- Provide the full component code structure.
`;

export async function sendMessageToGemini(message: string) {
    if (!API_KEY) {
        console.error("Gemini API Key is missing");
        return { speak: "I am missing my API key. Please configure it.", code: "" };
    }

    try {
        const chatModel = getChatModel();
        const response = await chatModel.invoke([
            new SystemMessage(SYSTEM_PROMPT),
            new HumanMessage(message),
        ]);

        const text = typeof response.content === 'string' ? response.content : JSON.stringify(response.content);

        // Parse the response
        const speakMatch = text.match(/\[SPEAK\]([\s\S]*?)(\[CODE\]|$)/);
        const codeMatch = text.match(/\[CODE\]([\s\S]*?)$/);

        const speak = speakMatch ? speakMatch[1].trim() : text; // Fallback to full text if no tags
        const code = codeMatch ? codeMatch[1].trim().replace(/```jsx|```/g, "") : "";

        return { speak, code };
    } catch (error) {
        console.error("LangChain/Gemini API Error:", error);
        return { speak: "Sorry, I encountered an error. Please Check your API Key and Model availability.", code: "" };
    }
}
