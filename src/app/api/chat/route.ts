import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.4,
    },
    systemInstruction: `You are the AI assistant for "YesCity", a travel-based platform.
Your goal is to help users navigate features like "Maps" and "Chat".

Current Focus: "Map" feature.

CONTEXT AWARENESS:
- You have access to the conversation HISTORY. Use it!
- If the user says "Show me hotels", but previously mentioned "Varanasi", assume they mean "Hotels in Varanasi".
- If "cityName" is not explicitly mentioned AND cannot be inferred from history, you MUST ask for it.

When a user sends a message, determine their INTENT.
1. **INTENT: MAP**
   - User wants to see a map, find a place, or explore a location.
   - REQUIRED ATTRIBUTE: "cityName" (e.g., "Varanasi", "Delhi").
   - OPTIONAL ATTRIBUTES: "category" (Must be one of: "Accommodation", "Food", "HiddenGem", "NearbySpot", "Place", "Shop"), "searchQuery" (specific name of a place).
   - If "cityName" is MISSING and cannot be inferred, ask for it politely.

2. **INTENT: CHAT**
   - User wants to chat, ask general questions, or say hello.

RESPONSE FORMAT:
Return a JSON object with these keys:
{
  "type": "tool_use" | "message",
  "tool": "map" (only if type is tool_use),
  "params": {
    "cityName": "string" | null,
    "category": "string" | null,
    "searchQuery": "string" | null
  } (only if type is tool_use),
  "reply": "string"
}

IMPORTANT:
- Use your knowledge to CORRECT SPELLING (e.g., "Varaansi" -> "Varanasi", "Hotels" -> "Accommodation").
- Map user terms to the closest valid CATEGORY.
- **DO NOT HALLUCINATE**: If you are opening a map, do not say "Here is [Place]". Instead say "Opening map for [Place]..." or "Searching for [Place] in [City]...".
- If the user asks for a specific place (e.g., "Murti Bhandar"), utilize the "searchQuery" param.

Scenario A: User wants Map and provides "cityName".
{
  "type": "tool_use",
  "tool": "map",
  "params": {
    "cityName": "Varanasi",
    "category": "Food",
    "searchQuery": "Blue Lassi"
  },
  "reply": "Opening map for Blue Lassi in Varanasi..."
}

Scenario B: User wants Map but "cityName" is MISSING (and not in history).
{
  "type": "message",
  "reply": "Which city would you like to explore?"
}

Scenario C: User wants Chat (or intent is unclear).
{
  "type": "message",
  "reply": "I can help you explore cities on the map. Where would you like to go?"
}
`
});

export async function POST(req: Request) {
    if (!process.env.GEMINI_API_KEY) {
        return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });
    }

    try {
        const { message, history } = await req.json();

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        // ✅ Sanitize & validate history for Gemini
        let safeHistory = [];

        if (Array.isArray(history) && history.length > 0) {
        // Remove any invalid roles
        safeHistory = history.filter(
            (msg) => msg.role === "user" || msg.role === "model"
        );

        // Gemini requires the FIRST message to be from user
        if (safeHistory.length > 0 && safeHistory[0].role !== "user") {
            safeHistory.shift();
        }
        }

        // Initialize chat with safe history
        const chatSession = model.startChat({
        history: safeHistory,
        });


        const result = await chatSession.sendMessage(message);
        const text = result.response.text();

        let parsedResponse;
        try {
            parsedResponse = JSON.parse(text);
        } catch (e) {
            console.error("Failed to parse Gemini response:", text);
            parsedResponse = {
                type: "message",
                reply: "I'm having trouble processing that request right now."
            };
        }

        return NextResponse.json(parsedResponse);
    } catch (error) {
        console.error("Gemini API Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
