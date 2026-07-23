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
      - event_date: The date of the event in "YYYY-MM-DD" format. If no year is specified, assume the current year.
      - event_time: The starting time of the event in 24-hour format "HH:MM". If not found, return null.
      - location: The short name of the venue, hall, or city (e.g., "Ashoka Thirumana Mandabam" or "Chennai").
      - map_link: The full, detailed street address of the venue if available on the invitation. If only the city is present, leave this null.

      Return ONLY the raw JSON object. Do not include any markdown formatting, code blocks, or conversational text.
      Example response format:
      {
        "title": "Rahul & Priya Wedding",
        "event_type": "Wedding",
        "event_date": "2024-12-15",
        "event_time": "18:30",
        "location": "Leela Palace, Chennai",
        "map_link": "Adyar Seaface, MRC Nagar, Chennai, Tamil Nadu 600028"
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
        model: "qwen/qwen3.6-27b",
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

      return NextResponse.json(
        { error: `AI service error: ${response.status}` },
        { status: 500 }
      );
    }

    const data = await response.json();
    const responseText = data.choices?.[0]?.message?.content || "";

    // Clean up the response in case the model returns markdown code blocks
    let cleanedText = responseText.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/^```json/, '').replace(/```$/, '').trim();
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```/, '').replace(/```$/, '').trim();
    }

    let parsedData;
    try {
      parsedData = JSON.parse(cleanedText);
    } catch (e) {
      console.error("Failed to parse AI response as JSON:", cleanedText);
      return NextResponse.json({ error: "Failed to parse extracted data" }, { status: 500 });
    }

    return NextResponse.json({ data: parsedData });

  } catch (error: any) {
    console.error("Error extracting invitation:", error);
    return NextResponse.json({ error: error.message || "Failed to extract details" }, { status: 500 });
  }
}
