import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';

// Skip the secret check in dev (localtunnel can't forward custom headers reliably)
function isValidTelegramRequest(req: Request): boolean {
  if (process.env.NODE_ENV === 'development') return true;
  const secretToken = req.headers.get('x-telegram-bot-api-secret-token');
  return secretToken === process.env.TELEGRAM_WEBHOOK_SECRET;
}

async function sendTelegramMessage(chatId: number, text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.error('[Telegram] No TELEGRAM_BOT_TOKEN in env!');
    return;
  }
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
  });
  if (!res.ok) {
    console.error('[Telegram sendMessage error]', await res.text());
  }
}


// GET handler needed to bypass localtunnel's browser confirmation page
export async function GET() {
  return NextResponse.json({ ok: true, service: 'VitalArc Telegram Webhook', status: 'active' });
}

/**
 * TELEGRAM AUTH-SYNC WEBHOOK
 * POST /api/telegram/webhook
 */
export async function POST(req: Request) {
  // Log incoming request for debugging
  console.log('[Telegram Webhook] Received POST');

  // Validate request origin
  if (!isValidTelegramRequest(req)) {
    console.warn('[Telegram Webhook] Unauthorized request blocked');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }


  try {
    const body = await req.json();
    const message = body?.message;
    if (!message?.text) return NextResponse.json({ ok: true });

    const chatId: number = message.chat.id;
    const firstName: string = message.from?.first_name || 'there';
    const text: string = message.text.trim();

    // ── Command: /start ──────────────────────────────────────────────
    if (text === '/start') {
      await sendTelegramMessage(chatId, `👋 <b>Welcome to VitalArc Bot, ${firstName}!</b>\n\nTo link your account:\n1. Open VitalArc web app\n2. Go to your Profile page\n3. Copy your Sync Token\n4. Send: <code>/sync YOUR_TOKEN</code>\n\nAfter linking, you can send health updates like:\n• <code>My weight is 75kg</code>\n• <code>I slept 8 hours last night</code>\n• <code>/status</code> — see your health summary`);
      return NextResponse.json({ ok: true });
    }

    // ── Command: /sync TOKEN ─────────────────────────────────────────
    if (text.startsWith('/sync ')) {
      const syncToken = text.split(' ')[1]?.trim();
      if (!syncToken || syncToken.length < 6) {
        await sendTelegramMessage(chatId, '❌ Invalid token format. Get your token from the VitalArc Profile page.');
        return NextResponse.json({ ok: true });
      }

      // Find user with this sync token
      const q = query(collection(db, 'users'), where('syncToken', '==', syncToken));
      const snap = await getDocs(q);

      if (snap.empty) {
        await sendTelegramMessage(chatId, '❌ Token not found or already used. Generate a new one in your VitalArc Profile.');
        return NextResponse.json({ ok: true });
      }

      const userDoc = snap.docs[0];
      const name = userDoc.data().profile?.name || 'User';

      // Link Telegram chatId to this Firebase UID
      await updateDoc(userDoc.ref, {
        telegramChatId: chatId,
        syncToken: null,         // One-time use: delete after success
        telegramLinkedAt: new Date().toISOString(),
      });

      await sendTelegramMessage(chatId, `✅ <b>Account linked!</b>\n\nHello, ${name}! Your Telegram is now securely connected to VitalArc.\n\n💬 Try sending:\n• <code>My weight is 80kg</code>\n• <code>I slept 7 hours</code>\n• <code>/status</code>`);
      return NextResponse.json({ ok: true });
    }

    // ── Command: /status ─────────────────────────────────────────────
    if (text === '/status') {
      const q = query(collection(db, 'users'), where('telegramChatId', '==', chatId));
      const snap = await getDocs(q);
      if (snap.empty) {
        await sendTelegramMessage(chatId, '🔒 Please link your account first. Send /start for instructions.');
        return NextResponse.json({ ok: true });
      }
      const data = snap.docs[0].data();
      const profile = data.profile;
      if (!profile) {
        await sendTelegramMessage(chatId, 'ℹ️ No health data found yet. Complete your bio-scan at the VitalArc web app first.');
        return NextResponse.json({ ok: true });
      }
      await sendTelegramMessage(chatId, `📊 <b>Your VitalArc Summary</b>\n\n👤 Name: ${profile.name || 'Not set'}\n🎂 Age: ${profile.age || 'N/A'}\n⚖️ Weight: ${profile.weight || 'N/A'} kg\n💤 Sleep: ${profile.sleepHours || 'N/A'} hrs/night\n🏃 Exercise: ${profile.exerciseDaysPerWeek || 'N/A'} days/week\n\n<i>Update data by texting e.g. "My weight is 75kg"</i>`);
      return NextResponse.json({ ok: true });
    }

    // ── Natural Language Health Update ───────────────────────────────
    // Find authenticated Telegram user
    const q = query(collection(db, 'users'), where('telegramChatId', '==', chatId));
    const snap = await getDocs(q);

    if (snap.empty) {
      await sendTelegramMessage(chatId, '🔒 Please link your account first. Send /start for instructions.');
      return NextResponse.json({ ok: true });
    }

    // Parse natural language health updates
    const lowerText = text.toLowerCase();
    const userDocRef = snap.docs[0].ref;
    const profile = snap.docs[0].data().profile || {};
    const updates: Record<string, unknown> = {};

    // Weight detection
    const weightMatch = lowerText.match(/(\d+(?:\.\d+)?)\s*(?:kg|kilos?|kilograms?)/);
    if (weightMatch) updates['profile.weight'] = parseFloat(weightMatch[1]);

    // Sleep detection
    const sleepMatch = lowerText.match(/(\d+(?:\.\d+)?)\s*(?:hours?|hrs?)(?:\s*of\s*sleep)?/);
    if (sleepMatch && lowerText.includes('sleep')) updates['profile.sleepHours'] = parseFloat(sleepMatch[1]);

    // Exercise detection
    if (lowerText.includes('exercise') || lowerText.includes('workout') || lowerText.includes('gym')) {
      const daysMatch = lowerText.match(/(\d+)\s*day/);
      if (daysMatch) updates['profile.exerciseDaysPerWeek'] = parseInt(daysMatch[1]);
    }

    if (Object.keys(updates).length > 0) {
      await updateDoc(userDocRef, { ...updates, updatedAt: new Date().toISOString() });
      const fieldNames = Object.keys(updates).map(k => k.replace('profile.', '')).join(', ');
      await sendTelegramMessage(chatId, `✅ Updated your <b>${fieldNames}</b>! Your dashboard will reflect this immediately.\n\n📱 <a href="https://vitalarc.vercel.app/dashboard">View Dashboard</a>`);
    } else {
      await sendTelegramMessage(chatId, `🤔 I didn't understand that. Try:\n• <code>My weight is 75kg</code>\n• <code>I slept 8 hours</code>\n• <code>/status</code> to view your data`);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[Telegram Webhook Error]', err);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
