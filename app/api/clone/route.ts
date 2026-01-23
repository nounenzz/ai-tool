import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const text = formData.get("text") as string;
    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!text || !apiKey) {
      return NextResponse.json({ error: "Missing text or API Key" }, { status: 400 });
    }

    // 🔥 修改点：我们不克隆了，直接用官方的一个好听的女声 (Rachel)
    // 这样免费账号也能跑通
    const voice_id = "21m00Tcm4TlvDq8ikWAM"; 

    // Step 2: 直接用这个 ID 念稿子
    const ttsResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: text,
        model_id: "eleven_multilingual_v2",
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    });

    if (!ttsResponse.ok) {
      const err = await ttsResponse.json();
      console.log(err);
      return NextResponse.json({ error: "TTS Failed", details: err }, { status: 500 });
    }

    const audioBuffer = await ttsResponse.arrayBuffer();

    return new NextResponse(audioBuffer, {
      headers: { "Content-Type": "audio/mpeg" },
    });

  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}