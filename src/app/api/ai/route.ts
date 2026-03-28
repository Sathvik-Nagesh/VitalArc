import { NextResponse } from 'next/server';

export const runtime = 'edge';

// Rate limiting (edge-compatible, in-memory per isolate)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(id: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(id);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(id, { count: 1, resetAt: now + 60 * 60 * 1000 });
    return true;
  }
  if (entry.count >= 20) return false; // 20/hr server-side
  entry.count++;
  return true;
}

function sanitize(s: string): string {
  return s.replace(/[<>{}"'`\\;]/g, '').trim().slice(0, 500);
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key not configured. Add GEMINI_API_KEY to your .env file.' },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { prompt, userId = 'anon', mode = 'coach' } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });
    }

    // Rate limiting
    if (!checkRateLimit(userId)) {
      return NextResponse.json({ error: 'Rate limit exceeded. Try again in an hour.' }, { status: 429 });
    }

    const sanitizedPrompt = sanitize(prompt);

    // Call Gemini 2.0 Flash (1M token context, fastest, best for clinical data)
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: sanitizedPrompt }] }],
          generationConfig: {
            temperature: 0.7,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
          safetySettings: [
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
          ],
        }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error('[Gemini API Error]', geminiRes.status, errText);
      return NextResponse.json(
        { error: `Gemini API error: ${geminiRes.status}` },
        { status: geminiRes.status }
      );
    }

    const data = await geminiRes.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!text) {
      return NextResponse.json({ error: 'Empty response from Gemini' }, { status: 500 });
    }

    return NextResponse.json({ text, mode });
  } catch (err: any) {
    console.error('[AI API Route Error]', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
