import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { MongoClient } from 'mongodb';

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

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || "";
const DB_NAME = process.env.MONGODB_DB_NAME || "yescity";
const COLLECTION_NAME = process.env.COLLECTION_NAME || "places";

// Map category aliases to standardized categories
const CATEGORY_MAP: Record<string, string> = {
  'hotels': 'Accommodation',
  'hotel': 'Accommodation',
  'accommodation': 'Accommodation',
  'stay': 'Accommodation',
  'lodging': 'Accommodation',
  'food': 'Food',
  'restaurant': 'Food',
  'dining': 'Food',
  'eat': 'Food',
  'restaurants': 'Food',
  'hidden gem': 'HiddenGem',
  'hidden gems': 'HiddenGem',
  'secret spot': 'HiddenGem',
  'offbeat': 'HiddenGem',
  'nearby': 'NearbySpot',
  'nearby spots': 'NearbySpot',
  'around': 'NearbySpot',
  'places': 'Place',
  'attractions': 'Place',
  'sightseeing': 'Place',
  'tourist spots': 'Place',
  'shopping': 'Shop',
  'shops': 'Shop',
  'market': 'Shop',
  'store': 'Shop'
};

// Function 1: Classify query and extract city & category
async function classifyQuery(message: string, history: any[]): Promise<{
  intent: 'MAP' | 'CHAT';
  cityName: string | null;
  category: string | null;
  searchQuery: string | null;
  requiresCity: boolean;
  requiresCategory: boolean;
}> {
  try {
    // Extract context from history
    const lastCityFromHistory = extractCityFromHistory(history);

    // Use Gemini to classify the query
    const classificationPrompt = `Analyze the following user query and conversation history to determine:
    1. Intent: Is this a MAP request or CHAT?
    2. City name (if mentioned or can be inferred from history)
    3. Category (map to: Accommodation, Food, HiddenGem, NearbySpot, Place, Shop)
    4. Search query (specific place name if mentioned)

    User Query: "${message}"
    Conversation History: ${JSON.stringify(history.slice(-3))} // Last 3 messages
    
    Return JSON: {
      "intent": "MAP" or "CHAT",
      "cityName": "city name or null",
      "category": "valid category or null",
      "searchQuery": "specific place or null",
      "requiresCity": boolean,
      "requiresCategory": boolean
    }`;

    const classificationModel = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.1,
      }
    });

    const result = await classificationModel.generateContent(classificationPrompt);
    const text = result.response.text();

    let classification;
    try {
      classification = JSON.parse(text);
    } catch (e) {
      console.error("Failed to parse classification:", text);
      classification = {
        intent: 'CHAT',
        cityName: null,
        category: null,
        searchQuery: null,
        requiresCity: true,
        requiresCategory: false
      };
    }

    // Apply spelling corrections and category mapping
    if (classification.cityName) {
      classification.cityName = correctCitySpelling(classification.cityName);
    }

    if (classification.category) {
      const normalizedCategory = classification.category.toLowerCase();
      classification.category = CATEGORY_MAP[normalizedCategory] || classification.category;
    }

    // Check if we need to ask for city
    classification.requiresCity = !classification.cityName && !lastCityFromHistory;

    // Use city from history if available
    if (!classification.cityName && lastCityFromHistory) {
      classification.cityName = lastCityFromHistory;
    }

    return classification;
  } catch (error) {
    console.error("Classification error:", error);
    return {
      intent: 'CHAT',
      cityName: null,
      category: null,
      searchQuery: null,
      requiresCity: true,
      requiresCategory: false
    };
  }
}

// Helper function to extract city from history
function extractCityFromHistory(history: any[]): string | null {
  if (!history || !Array.isArray(history)) return null;

  // Look for city mentions in the last 5 messages
  const recentMessages = history.slice(-5);

  for (const msg of recentMessages) {
    if (msg.role === 'user' || msg.role === 'model') {
      const text = msg.parts?.[0]?.text || msg.text || '';

      // Simple city name extraction (you can enhance this)
      const cityMatches = text.match(/\b(Varanasi|Delhi|Mumbai|Kolkata|Chennai|Bangalore|Jaipur|Goa|Agra)\b/i);
      if (cityMatches) {
        return correctCitySpelling(cityMatches[0]);
      }
    }
  }

  return null;
}

// Helper function to correct city spelling
function correctCitySpelling(city: string): string {
  const cityCorrections: Record<string, string> = {
    'varaansi': 'Varanasi',
    'varanasi': 'Varanasi',
    'delhi': 'Delhi',
    'new delhi': 'Delhi',
    'mumbai': 'Mumbai',
    'bombay': 'Mumbai',
    'kolkata': 'Kolkata',
    'calcutta': 'Kolkata',
    'chennai': 'Chennai',
    'madras': 'Chennai',
    'bangalore': 'Bangalore',
    'bengaluru': 'Bangalore',
    'jaipur': 'Jaipur',
    'goa': 'Goa',
    'agra': 'Agra'
  };

  const lowerCity = city.toLowerCase();
  return cityCorrections[lowerCity] || city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
}

// Function 2: Fetch data from MongoDB
async function fetchPlacesFromMongoDB(cityName: string, category: string | null, searchQuery: string | null): Promise<{
  success: boolean;
  data: any[];
  message: string;
  category?: string;
}> {
  let client: MongoClient | null = null;

  try {
    if (!MONGODB_URI) {
      throw new Error('MongoDB connection string not configured');
    }

    client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    // Build query filter
    const filter: any = { city: { $regex: new RegExp(`^${cityName}$`, 'i') } };

    if (category) {
      filter.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    if (searchQuery) {
      filter.$or = [
        { name: { $regex: searchQuery, $options: 'i' } },
        { description: { $regex: searchQuery, $options: 'i' } }
      ];
    }

    // Check if city exists
    const cityExists = await collection.findOne({ city: { $regex: new RegExp(`^${cityName}$`, 'i') } });

    if (!cityExists) {
      return {
        success: false,
        data: [],
        message: `Sorry, I couldn't find "${cityName}" in our database. Please try another city.`
      };
    }

    // Check if category exists for this city
    if (category) {
      const categoryExists = await collection.findOne({
        city: { $regex: new RegExp(`^${cityName}$`, 'i') },
        category: { $regex: new RegExp(`^${category}$`, 'i') }
      });

      if (!categoryExists) {
        // Get available categories for this city
        const availableCategories = await collection.distinct('category', {
          city: { $regex: new RegExp(`^${cityName}$`, 'i') }
        });

        return {
          success: false,
          data: [],
          message: `Sorry, I couldn't find "${category}" places in ${cityName}. Available categories are: ${availableCategories.join(', ')}.`,
          category: category
        };
      }
    }

    // Fetch places with limit
    const places = await collection.find(filter).limit(20).toArray();

    return {
      success: true,
      data: places,
      message: places.length > 0
        ? `Found ${places.length} ${category || 'places'} in ${cityName}`
        : `No specific results found in ${cityName}. Try a different search.`
    };

  } catch (error) {
    console.error('MongoDB Error:', error);
    return {
      success: false,
      data: [],
      message: 'Error connecting to database. Please try again.'
    };
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// Function 3: Generate final response with data
async function generateFinalResponse(
  classification: ReturnType<typeof classifyQuery> extends Promise<infer T> ? T : never,
  fetchResult: Awaited<ReturnType<typeof fetchPlacesFromMongoDB>>,
  userMessage: string
): Promise<{
  type: "tool_use" | "message";
  tool?: "map";
  params?: {
    cityName: string | null;
    category: string | null;
    searchQuery: string | null;
  };
  reply: string;
  data?: any[];
}> {
  // If city is required but missing
  if (classification.requiresCity) {
    return {
      type: "message",
      reply: "Which city would you like to explore?"
    };
  }

  // If fetch failed due to city not found
  if (!fetchResult.success && classification.cityName && !classification.category) {
    return {
      type: "message",
      reply: fetchResult.message
    };
  }

  // If fetch failed due to category not found
  if (!fetchResult.success && fetchResult.category) {
    return {
      type: "message",
      reply: fetchResult.message
    };
  }

  // If it's a CHAT intent
  if (classification.intent === 'CHAT') {
    return {
      type: "message",
      reply: "I can help you explore cities on the map. Where would you like to go?"
    };
  }

  // If it's a MAP intent with data
  const cityName = classification.cityName || 'this location';
  const category = classification.category ? ` ${classification.category.toLowerCase()}` : '';
  const searchQuery = classification.searchQuery || '';

  let reply = "";

  if (searchQuery) {
    reply = `Searching for ${searchQuery}${category ? ` (${classification.category})` : ''} in ${cityName}...`;
  } else if (category) {
    reply = `Exploring ${classification.category?.toLowerCase()} places in ${cityName}...`;
  } else {
    reply = `Opening map for ${cityName}...`;
  }

  // Add data summary to reply if we have data
  if (fetchResult.success && fetchResult.data.length > 0) {
    const placesSummary = fetchResult.data.slice(0, 3).map((place, idx) =>
      `${idx + 1}. ${place.name} - ${place.description?.substring(0, 60)}...`
    ).join('\n');

    if (fetchResult.data.length > 3) {
      reply += `\n\nFound ${fetchResult.data.length} places. Here are some:\n${placesSummary}\n\n...and ${fetchResult.data.length - 3} more places.`;
    } else {
      reply += `\n\nFound these places:\n${placesSummary}`;
    }
  }

  return {
    type: "tool_use",
    tool: "map",
    params: {
      cityName: classification.cityName,
      category: classification.category,
      searchQuery: classification.searchQuery
    },
    reply: reply,
    data: fetchResult.success ? fetchResult.data : undefined
  };
}

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

    // 1. Classify the query
    const classification = await classifyQuery(message, safeHistory);

    let finalResponse;

    // If we have a city and it's a MAP intent, fetch data
    if (classification.intent === 'MAP' && classification.cityName && !classification.requiresCity) {
      // 2. Fetch data from MongoDB
      const fetchResult = await fetchPlacesFromMongoDB(
        classification.cityName,
        classification.category,
        classification.searchQuery
      );

      // 3. Generate final response
      finalResponse = await generateFinalResponse(classification, fetchResult, message);
    } else {
      // Handle cases where we don't need to fetch data
      finalResponse = await generateFinalResponse(classification, {
        success: false,
        data: [],
        message: ''
      }, message);
    }

    // Initialize chat with safe history
    const chatSession = model.startChat({
      history: safeHistory,
    });

    // Send the final response through Gemini for natural language polish
    const polishPrompt = `Based on the following structured response, create a natural, friendly reply for the user. Keep it concise and helpful.

        Structured Response: ${JSON.stringify(finalResponse, null, 2)}
        
        User's original message: "${message}"
        
        Return ONLY the natural language reply string:`;

    const polishResult = await model.generateContent(polishPrompt);
    const polishedReply = polishResult.response.text();

    // Update the reply with polished version
    finalResponse.reply = polishedReply || finalResponse.reply;

    return NextResponse.json(finalResponse);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}