import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, query, collection, where, getDocs } from 'firebase/firestore';

/**
 * TELEGRAM AUTH-SYNC WEBHOOK
 * Handles incoming messages from the bot and maps them to Firebase Users.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message } = body;

    if (!message || !message.text) return NextResponse.json({ ok: true });

    const chatId = message.chat.id;
    const text = message.text.trim();

    // 1. Check for Sync Command (/sync XYZ-123)
    if (text.startsWith('/sync ')) {
      const syncToken = text.split(' ')[1];
      
      // SEARCH FIRESTORE FOR THIS TOKEN
      const q = query(collection(db, 'users'), where('syncToken', '==', syncToken));
      const snap = await getDocs(q);

      if (snap.empty) {
        return sendTelegramMessage(chatId, "❌ Invalid Sync Token. Please check your VitalArc Profile page.");
      }

      const userDoc = snap.docs[0];
      await updateDoc(userDoc.ref, {
        telegramChatId: chatId,
        syncToken: null // Consume the token after successful auth
      });

      return sendTelegramMessage(chatId, `✅ SUCCESS! Your Telegram account is now securely linked to ${userDoc.data().profile?.name || 'your VitalArc account'}. You can now send health updates here!`);
    }

    // 2. Handle Health Updates (e.g. "My weight is 85kg")
    // Note: In an actual build, you would route this to an NLU engine (Gemini)
    // to parse the clinical data before updating the linked Profile.
    
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Telegram Webhook Error:", err);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}

async function sendTelegramMessage(chatId: number, text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return NextResponse.json({ error: 'Bot token missing' });

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text })
  });
  
  return NextResponse.json({ ok: true });
}
