import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { image } = body;

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });
    }

    // Extract base64 data and mime type
    const base64Data = image.split(',')[1];
    const mimeType = image.split(';')[0].split(':')[1] || 'image/jpeg';

    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const prompt = `
      You are an expert event data extraction assistant. I will provide an image of an event/wedding invitation.
      Extract the following information from the image and return it strictly as a JSON object:
      - title: The name of the event or the couple's names (e.g., "Rahul & Priya Wedding", "John's 1st Birthday"). Keep it short.
      - event_type: Categorize it into EXACTLY ONE of these: "Wedding", "Birthday", "Corporate", or "Other".
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

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        }
      }
    ]);

    const responseText = result.response.text();
    
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
      console.error("Failed to parse Gemini response as JSON:", cleanedText);
      return NextResponse.json({ error: "Failed to parse extracted data" }, { status: 500 });
    }

    return NextResponse.json({ data: parsedData });

  } catch (error: any) {
    console.error("Error extracting invitation:", error);
    return NextResponse.json({ error: error.message || "Failed to extract details" }, { status: 500 });
  }
}
