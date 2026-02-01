import { openDB, type IDBPDatabase } from 'idb';

const DB_NAME = 'prayas-db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb() {
  if (typeof window === 'undefined') return null;
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('plans')) {
          db.createObjectStore('plans');
        }
        if (!db.objectStoreNames.contains('pulse')) {
          db.createObjectStore('pulse');
        }
        if (!db.objectStoreNames.contains('analytics')) {
          db.createObjectStore('analytics');
        }
        if (!db.objectStoreNames.contains('sessions')) {
          db.createObjectStore('sessions');
        }
      }
    });
  }
  return dbPromise;
}

export async function idbSet<T>(store: string, key: string, value: T) {
  const db = await getDb();
  if (!db) return;
  await db.put(store, value, key);
}

export async function idbGet<T>(store: string, key: string) {
  const db = await getDb();
  if (!db) return undefined;
  return (await db.get(store, key)) as T | undefined;
}

export async function idbDelete(store: string, key: string) {
  const db = await getDb();
  if (!db) return;
  await db.delete(store, key);
}
