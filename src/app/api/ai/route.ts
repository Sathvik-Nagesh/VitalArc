import { NextResponse } from 'next/server';

export const runtime = 'edge';

// Simple in-memory rate limiter per edge isolate
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(id: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(id);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(id, { count: 1, resetAt: now + 60 * 60 * 1000 });
    return true;
  }
  if (entry.count >= 30) return false;
  entry.count++;
  return true;
}

function sanitize(s: string): string {
  return s.replace(/[<>{}"'`\\;]/g, '').trim().slice(0, 8000);
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey || apiKey === 'YOUR_KEY_HERE' || apiKey.trim() === '') {
      return NextResponse.json(
        { error: 'Gemini API key not configured.' },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { prompt, userId = 'anon', mode = 'coach' } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });
    }

    if (!checkRateLimit(userId)) {
      return NextResponse.json({ error: 'Rate limit exceeded. Try again in an hour.' }, { status: 429 });
    }

    const sanitizedPrompt = sanitize(prompt);

    // Use exact model name from AI Studio + X-goog-api-key header (most compatible)
    // Try gemini-flash-latest first, then 1.5-flash as fallback
    const models = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-flash-8b'];

    for (const model of models) {
      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey,  // Match AI Studio curl format
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: sanitizedPrompt }],
              },
            ],
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

      if (geminiRes.ok) {
        const data = await geminiRes.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        if (!text) {
          return NextResponse.json({ error: 'Empty response from Gemini' }, { status: 500 });
        }
        console.log(`[Gemini OK] model=${model}`);
        return NextResponse.json({ text, mode, model });
      }

      const errText = await geminiRes.text();
      console.error(`[Gemini ${model}] ${geminiRes.status}:`, errText.slice(0, 300));

      // 400 = bad key — stop immediately, no point retrying other models
      if (geminiRes.status === 400) {
        return NextResponse.json(
          { error: 'Invalid API key. Go to https://aistudio.google.com/app/apikey and get a fresh key.' },
          { status: 400 }
        );
      }

      // 429 = quota hit — try next model
      // 503 = overloaded — try next model
      // anything else — try next model
    }

    return NextResponse.json(
      { error: 'All Gemini models failed. Check API key quota at https://aistudio.google.com/' },
      { status: 503 }
    );

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal server error';
    console.error('[AI Route Error]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
