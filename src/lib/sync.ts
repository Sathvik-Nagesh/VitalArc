import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { UserProfile } from './types';

// Sync local profile to Firestore
export const syncProfileToCloud = async (userId: string, profile: UserProfile) => {
  try {
    const docRef = doc(db, 'users', userId);
    await setDoc(docRef, {
      profile,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    console.log("Profile synced to cloud successfully.");
  } catch (err) {
    console.error("Cloud sync failed:", err);
  }
};

// Fetch profile from Firestore
export const fetchProfileFromCloud = async (userId: string): Promise<UserProfile | null> => {
  try {
    const docRef = doc(db, 'users', userId);
    const snap = await getDoc(docRef);
    if (snap.exists() && snap.data().profile) {
      return snap.data().profile as UserProfile;
    }
  } catch (err) {
    console.error("Cloud fetch failed:", err);
  }
  return null;
};
