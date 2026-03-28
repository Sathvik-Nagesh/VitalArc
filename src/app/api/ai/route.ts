import { NextResponse } from 'next/server';

// Node.js runtime — needed to read non-NEXT_PUBLIC_ env vars
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

    console.log('[AI Route] key present:', !!apiKey, 'first 8 chars:', apiKey?.slice(0, 8));

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
      return NextResponse.json({ error: 'Rate limit exceeded.' }, { status: 429 });
    }

    const sanitizedPrompt = sanitize(prompt);

    // Model list ordered by quota availability
    // gemini-2.0-flash-lite has highest free-tier quota
    // gemini-flash-latest is the AI Studio alias
    const models = [
      'gemini-2.0-flash-lite',      // Highest free quota, fast
      'gemini-2.0-flash',           // Standard, may hit quota
      'gemini-flash-latest',         // AI Studio alias
      'gemini-2.0-flash-thinking-exp', // Experimental fallback
    ];

    for (const model of models) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
      console.log(`[AI Route] Trying: ${model}`);

      const geminiRes = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: sanitizedPrompt }] }],
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
      });

      if (geminiRes.ok) {
        const data = await geminiRes.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        if (!text) return NextResponse.json({ error: 'Empty response' }, { status: 500 });
        console.log(`[AI Route] ✅ Success: ${model}`);
        return NextResponse.json({ text, mode, model });
      }

      const errText = await geminiRes.text();
      console.error(`[AI Route] ❌ ${model} → ${geminiRes.status}`);

      // 400 = bad key, stop trying
      if (geminiRes.status === 400) {
        return NextResponse.json(
          { error: 'Invalid API key. Verify at https://aistudio.google.com/app/apikey' },
          { status: 400 }
        );
      }
      // 404 = model not available for this key, try next
      // 429 = quota hit, try next
    }

    // All models failed — return rule-based signal to client
    return NextResponse.json(
      { error: 'quota_exhausted', fallback: true },
      { status: 503 }
    );

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal server error';
    console.error('[AI Route Error]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
