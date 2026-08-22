import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, type Auth, type User } from 'firebase/auth';
import {
  getFirestore, collection, doc, onSnapshot, query, orderBy,
  addDoc, updateDoc, deleteDoc, writeBatch, getDoc, setDoc, increment, getDocs,
  type Firestore,
} from 'firebase/firestore';
import type { ShoppingItem, HistoryItem, Category } from '@/types';
import { categorize } from '@/utils/categorize';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const ENV_VARS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
  'VITE_GEMINI_API_KEY',
];

export function getMissingEnvVars(): string[] {
  return ENV_VARS.filter((v) => !import.meta.env[v]);
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

function ensureInit(): void {
  if (app) return;
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
}

export function initAuth(onReady: (user: User) => void, onError: (msg: string) => void): () => void {
  ensureInit();
  if (!auth) {
    onError('Auth not initialized');
    return () => {};
  }
  signInAnonymously(auth).catch((e) => onError(`Sign-in failed: ${e.message}`));
  return onAuthStateChanged(auth, (user) => {
    if (user) onReady(user);
  });
}

const DEFAULT_LIST_ID = 'default';

export function subscribeToList(
  uid: string,
  onUpdate: (items: ShoppingItem[]) => void,
  onError: (msg: string) => void,
): () => void {
  ensureInit();
  if (!db) {
    onError('Database not initialized');
    return () => {};
  }
  const itemsRef = collection(db, 'users', uid, 'lists', DEFAULT_LIST_ID, 'items');
  const q = query(itemsRef, orderBy('createdAt', 'asc'));
  return onSnapshot(
    q,
    (snap) => {
      const items: ShoppingItem[] = snap.docs.map((d) => {
        const data = d.data() as Omit<ShoppingItem, 'id'>;
        return { id: d.id, ...data };
      });
      onUpdate(items);
    },
    (e) => onError(e.message),
  );
}

export async function addItem(uid: string, name: string, quantity: number, unit: string): Promise<void> {
  ensureInit();
  if (!db) throw new Error('Database not initialized');
  const category: Category = categorize(name);
  const itemsRef = collection(db, 'users', uid, 'lists', DEFAULT_LIST_ID, 'items');
  await addDoc(itemsRef, {
    name,
    quantity,
    unit,
    category,
    checked: false,
    createdAt: Date.now(),
  });
  await updateHistory(uid, name);
}

export async function updateItem(uid: string, itemId: string, updates: Partial<ShoppingItem>): Promise<void> {
  ensureInit();
  if (!db) throw new Error('Database not initialized');
  const itemRef = doc(db, 'users', uid, 'lists', DEFAULT_LIST_ID, 'items', itemId);
  const { id: _id, ...cleanUpdates } = updates;
  void _id;
  await updateDoc(itemRef, cleanUpdates as Record<string, never>);
}

export async function removeItem(uid: string, itemId: string): Promise<void> {
  ensureInit();
  if (!db) throw new Error('Database not initialized');
  const itemRef = doc(db, 'users', uid, 'lists', DEFAULT_LIST_ID, 'items', itemId);
  await deleteDoc(itemRef);
}

export async function clearList(uid: string): Promise<void> {
  ensureInit();
  if (!db) throw new Error('Database not initialized');
  const itemsRef = collection(db, 'users', uid, 'lists', DEFAULT_LIST_ID, 'items');
  const snap = await getDocs(itemsRef);
  const batch = writeBatch(db);
  snap.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}

export async function updateHistory(uid: string, name: string): Promise<void> {
  ensureInit();
  if (!db) return;
  const key = name.toLowerCase().trim();
  const histRef = doc(db, 'users', uid, 'history', key);
  const existing = await getDoc(histRef);
  if (existing.exists()) {
    await updateDoc(histRef, { count: increment(1), lastAdded: Date.now() });
  } else {
    await setDoc(histRef, { name, count: 1, lastAdded: Date.now() });
  }
}

export function subscribeToHistory(
  uid: string,
  onUpdate: (items: HistoryItem[]) => void,
  onError: (msg: string) => void,
): () => void {
  ensureInit();
  if (!db) {
    onError('Database not initialized');
    return () => {};
  }
  const histRef = collection(db, 'users', uid, 'history');
  return onSnapshot(
    histRef,
    (snap) => {
      const items: HistoryItem[] = snap.docs.map((d) => d.data() as HistoryItem);
      items.sort((a, b) => b.count - a.count);
      onUpdate(items);
    },
    (e) => onError(e.message),
  );
}


