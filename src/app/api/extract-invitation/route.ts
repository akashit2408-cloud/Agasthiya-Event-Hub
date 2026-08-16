import { NextResponse } from "next/server";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { image } = body;

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Check if API key is configured
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Groq API key not configured" }, { status: 500 });
    }

    const prompt = `
      You are an expert event data extraction assistant. I will provide an image of an event/wedding invitation.
      CRITICAL INSTRUCTION: If the invitation contains details for BOTH a "Wedding" (or Muhurtham) and a "Reception", you MUST prioritize extracting the Date, Time, and Location for the RECEPTION. The DJ is usually hired for the Reception, so those details are the most important. If you extract Reception details, you MUST set the event_type to "Reception".

      Extract the following information from the image and return it strictly as a JSON object:
      - title: The name of the event or the couple's names (e.g., "Rahul & Priya Wedding", "John's 1st Birthday"). Keep it short.
      - event_type: Categorize it into EXACTLY ONE of these: "Wedding", "Reception", "Birthday", "Corporate", or "Other".
      - event_time: The starting time of the event in 24-hour format "HH:MM". If not found, return null.
      - location: The short name of the venue, hall, or city (e.g., "Ashoka Thirumana Mandabam" or "Chennai").
      - full_address: The full, detailed street address of the venue if available on the invitation. If only the city is present, leave this null.

      CRITICAL: You MUST return ONLY a raw, valid JSON object. Do NOT include any markdown formatting like \`\`\`json. Do NOT include any conversational text, explanations, or thoughts. Just the raw { ... } JSON.
      If you cannot read the image or find no details, return {"error": "Could not read details"}.
      Example response format:
      {
        "title": "Rahul & Priya Wedding",
        "event_type": "Wedding",
        "event_time": "18:30",
        "location": "Leela Palace, Chennai",
        "full_address": "Adyar Seaface, MRC Nagar, Chennai, Tamil Nadu 600028"
      }
    `;

    // Call Groq API (OpenAI-compatible, completely free)
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.GROQ_VISION_MODEL || "qwen/qwen3.6-27b",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: {
                  url: image, // data:image/jpeg;base64,... format
                },
              },
            ],
          },
        ],
        temperature: 0.2,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Groq API error:", errorData);

      if (response.status === 401) {
        return NextResponse.json(
          { error: "API key is invalid. Please check your GROQ_API_KEY in Vercel Environment Variables." },
          { status: 500 }
        );
      }
      
      if (response.status === 429) {
        return NextResponse.json(
          { error: "AI is currently busy (Rate Limit Reached). Please wait 15 seconds and try again." },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { error: `AI service error: ${response.status}` },
        { status: 500 }
      );
    }

    const data = await response.json();
    const responseText = data.choices?.[0]?.message?.content || "";

    // Remove <think>...</think> tags if the model is a reasoning model
    let cleanedText = responseText.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

    // Clean up the response in case the model returns markdown code blocks
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/^```json/, '').replace(/```$/, '').trim();
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```/, '').replace(/```$/, '').trim();
    }
    
    // Fallback: If it's still not clean, extract the first JSON object
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanedText = jsonMatch[0];
    }

    let parsedData;
    try {
      parsedData = JSON.parse(cleanedText);
    } catch (e) {
      console.error("Failed to parse AI response as JSON. Raw response:", responseText);
      // Let's attempt to return an empty structured object instead of crashing completely
      // so the user can still proceed manually
      return NextResponse.json({ error: "The AI couldn't find a clear format in the image. Please fill details manually." }, { status: 400 });
    }

    if (parsedData.error) {
       return NextResponse.json({ error: parsedData.error }, { status: 400 });
    }

    return NextResponse.json({ data: parsedData });

  } catch (error: any) {
    console.error("Error extracting invitation:", error);
    return NextResponse.json({ error: error.message || "Failed to extract details" }, { status: 500 });
  }
}
