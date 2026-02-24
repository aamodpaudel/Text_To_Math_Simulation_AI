import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const API_KEY = process.env.NEXT_PUBLIC_OLLAMA_API_KEY || "ollama";
const ENDPOINT = process.env.NEXT_PUBLIC_OLLAMA_ENDPOINT || "http://localhost:11434/v1";
const MODEL = process.env.NEXT_PUBLIC_OLLAMA_MODEL || "mistral";

const SYSTEM_PROMPT = `You are a math tutor. Generate responses in this exact format:

[SPEAK]
Your explanation here
[CODE]
<Mafs height={400}>
  <Coordinates.Cartesian />
  <COMPONENT />
</Mafs>

COMPONENTS (choose ONE):

A) Plot function: <Plot.OfX y={(x) => MATH_EXPRESSION} color={Theme.blue} />
   Examples:
   <Plot.OfX y={(x) => Math.sin(x)} color={Theme.blue} />
   <Plot.OfX y={(x) => x * x} color={Theme.orange} />

B) Circle: <Circle center={[0, 0]} radius={1} color={Theme.blue} />
   Example:
   <Circle center={[1, 2]} radius={0.5} color={Theme.pink} />

C) Line: <Line.Segment point1={[0, 0]} point2={[1, 1]} color={Theme.blue} />

RULES:
- Use only one component type
- Functions use arrow syntax: (x) => expression
- Arrays use brackets: [x, y]
- Colors: Theme.blue, Theme.orange, Theme.pink, Theme.green, Theme.red
- Math: Math.sin, Math.cos, Math.PI, Math.sqrt, Math.abs
- NO backticks, NO markdown, NO semicolons, NO extra text
`;

export async function POST(request: NextRequest) {
    try {
        const { message } = await request.json();

        if (!message) {
            return NextResponse.json(
                { error: "Message is required" },
                { status: 400 }
            );
        }

        const client = new OpenAI({
            apiKey: API_KEY,
            baseURL: ENDPOINT,
        });

        const response = await client.chat.completions.create({
            model: MODEL,
            messages: [
                {
                    role: "system",
                    content: SYSTEM_PROMPT,
                },
                {
                    role: "user",
                    content: message,
                },
            ],
            temperature: 0.9,
            max_tokens: 2048,
        });

        const text = response.choices[0].message.content || "";

        // Parse the response
        const speakMatch = text.match(/\[SPEAK\]\s*([\s\S]*?)(?=\[CODE\])/);
        const codeMatch = text.match(/\[CODE\]\s*([\s\S]*?)$/);

        let speak = speakMatch ? speakMatch[1].trim() : text;
        let code = codeMatch ? codeMatch[1].trim() : "";

        // Extract only the Mafs component from code
        const mafsMatch = code.match(/<Mafs[\s\S]*?<\/Mafs>/);
        if (mafsMatch) {
            code = mafsMatch[0];
        }

        // Remove code fences
        code = code
            .replace(/```jsx\n?/g, "")
            .replace(/^```\n?/g, "")
            .replace(/\n?```$/g, "")
            .trim();

        // Remove semicolons
        code = code.replace(/;/g, "");

        // Fix common issues:
        // 1. Fix center={1, 2} to center={[1, 2]}
        code = code.replace(/center=\{(\d+\.?\d*)\s*,\s*(\d+\.?\d*)\}/g, "center={[$1, $2]}");
        
        // 2. Fix point1={1, 2} to point1={[1, 2]}
        code = code.replace(/point1=\{([^}]+)\}/g, (match, content) => {
            if (!content.includes("[")) {
                return `point1={[${content}]}`;
            }
            return match;
        });
        
        // 3. Fix point2
        code = code.replace(/point2=\{([^}]+)\}/g, (match, content) => {
            if (!content.includes("[")) {
                return `point2={[${content}]}`;
            }
            return match;
        });

        // 4. Remove any stray brackets or malformed syntax
        code = code.replace(/\]\s*\]/g, "]");
        code = code.replace(/\[\s*\[/g, "[");

        // 5. Ensure proper spacing in components
        code = code.replace(/>\s+</g, ">\n  <");

        // Validate basic structure
        const hasComponent = code.includes("Plot.OfX") || code.includes("Circle") || code.includes("Line.Segment");
        const hasClosing = code.includes("</Mafs>");
        const hasOpening = code.includes("<Mafs");

        // Check for undefined variables - only allow: x, Math, Theme
        const undefinedVarPattern = /\b([a-zA-Z_]\w*)\b(?=\s*[\*\+\-\/\=]|\))/g;
        const allowedVars = new Set(["x", "Math", "Theme", "PI", "sin", "cos", "tan", "sqrt", "abs", "blue", "orange", "pink", "green", "red"]);
        let hasUndefinedVars = false;
        
        let match;
        const regex = /y=\{[^}]*\}|radius=\{[^}]*\}|center=\{[^}]*\}/g;
        while ((match = regex.exec(code)) !== null) {
            const content = match[0];
            const varMatches = content.match(/\b[a-z_]\w*\b/g) || [];
            for (const varName of varMatches) {
                if (!allowedVars.has(varName) && !["point", "Cartesian", "Coordinates", "Plot", "OfX", "color", "Segment", "radius", "center", "height", "Mafs"].includes(varName)) {
                    hasUndefinedVars = true;
                    console.warn(`Undefined variable found: ${varName}`);
                    break;
                }
            }
        }

        // If code is invalid or has undefined vars, use default
        if (!code || !hasComponent || !hasClosing || !hasOpening || hasUndefinedVars) {
            code = `<Mafs height={400}>
  <Coordinates.Cartesian />
  <Plot.OfX y={(x) => Math.sin(x)} color={Theme.blue} />
</Mafs>`;
        }

        console.log("Generated code:", code);

        return NextResponse.json({ speak, code });
    } catch (error) {
        console.error("Ollama API Error:", error);
        return NextResponse.json(
            { error: "Sorry, I encountered an error connecting to Ollama. Make sure Ollama is running at http://localhost:11434" },
            { status: 500 }
        );
    }
}
