import { NextResponse } from "next/server";
import { OpenAI } from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    // Map to OpenAI format
    const chatMessages = messages.map((m: any) => ({
      role: m.role === "user" ? "user" : "assistant",
      content: m.text,
    }));
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: "You are a friendly English tutor. Keep responses short, clear, and beginner-friendly. Always reply in English." },
        ...chatMessages,
      ],
      max_tokens: 128,
      temperature: 0.7,
    });
    const reply = completion.choices[0].message.content || "";
    return NextResponse.json({ reply });
  } catch (error) {
    return NextResponse.json({ reply: "Sorry, I couldn't reply right now." }, { status: 200 });
  }
}
