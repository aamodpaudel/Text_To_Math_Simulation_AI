import OpenAI from "openai";

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

export async function sendMessageToAI(message: string) {
    try {
        const response = await fetch("/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ message }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Failed to get response");
        }

        const data = await response.json();
        return { speak: data.speak, code: data.code };
    } catch (error) {
        console.error("API Error:", error);
        return { speak: "Sorry, I encountered an error connecting to Ollama. Make sure Ollama is running at http://localhost:11434", code: "" };
    }
}
