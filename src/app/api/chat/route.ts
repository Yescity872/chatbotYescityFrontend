import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: {
    temperature: 0.7,
  },
  systemInstruction: `You are the AI assistant for "YesCity", a travel-based platform.
Your goal is to help users with information about travel, cities, and general inquiries.

If a user asks about places, hotels, food, or activities in a SPECIFIC city (e.g., "show me hotels in Varanasi"), you MUST return a structured JSON response in the following format:
{
  "type": "tool_use",
  "tool": "map",
  "params": {
    "cityName": "Name of the city",
    "category": "One of: Accommodation, Activity, Food, HiddenGem, NearbySpot, Place, Shop, Transport, All",
    "searchQuery": "Optional specific search text"
  },
  "reply": "A friendly conversational reply acknowledging the request"
}

Otherwise, for general conversation, return a simple text reply.
Keep your conversational replies helpful, concise, and friendly.`
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
    if (Array.isArray(history)) {
      safeHistory = history.filter(
        (msg: any) => (msg.role === "user" || msg.role === "model") && 
                      (msg.text || (msg.parts && msg.parts[0]?.text))
      );
    }

    const chatSession = model.startChat({
      history: safeHistory,
    });

    const result = await chatSession.sendMessage(message);
    const replyText = result.response.text();

    // Try to parse if it's a tool use JSON
    try {
      const jsonResponse = JSON.parse(replyText.replace(/```json|```/g, "").trim());
      if (jsonResponse.type === 'tool_use') {
        return NextResponse.json(jsonResponse);
      }
    } catch (e) {
      // Not JSON, continue as standard message
    }

    return NextResponse.json({
      type: "message",
      reply: replyText
    });
  } catch (error: any) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ 
      error: 'Internal Server Error',
      message: error.message
    }, { status: 500 });
  }
}