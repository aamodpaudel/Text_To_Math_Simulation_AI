const { GoogleGenerativeAI } = require("@google/generative-ai");

require("dotenv").config({ path: ".env.local" });
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error("Error: GEMINI_API_KEY missing in .env.local");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);

async function main() {
    try {
        console.log("Fetching available models...");
        // There isn't a direct 'listModels' on the high-level class in some versions, 
        // but we can try to test specific models or use the admin API if available.
        // Actually, newer SDKs don't expose listModels easily without full GoogleAuth.
        // Instead, let's just try 3 common variants and see which one responds.

        const candidates = [
            "gemini-1.5-flash",
            "gemini-1.5-flash-latest",
            "gemini-1.5-pro",
            "gemini-pro",
            "gemini-1.0-pro"
        ];

        for (const modelName of candidates) {
            console.log(`Testing model: ${modelName}...`);
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("Test");
                console.log(`✅ SUCCESS: ${modelName} is available.`);
                console.log("Response:", result.response.text());
                break; // Stop after finding one working model
            } catch (e) {
                console.log(`❌ FAILED: ${modelName} - ${e.message.split('[')[0]}`); // Print short error
            }
        }

    } catch (error) {
        console.error("Fatal Error:", error);
    }
}

main();
