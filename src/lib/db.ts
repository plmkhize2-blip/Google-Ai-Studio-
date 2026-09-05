import { SignalData } from "../types";

const DB_NAME = "ai_chart_scanner_db";
const DB_VERSION = 1;
const STORE_NAME = "signals";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB is not supported"));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("timestamp", "timestamp", { unique: false });
        store.createIndex("symbol", "symbol", { unique: false });
        store.createIndex("direction", "direction", { unique: false });
      }
    };
  });
}

export async function saveSignalToDB(signal: SignalData): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(signal);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn("IndexedDB save failed, falling back to localStorage", err);
    // Fallback if IndexedDB fails: save summary in localStorage
    try {
      const existing = JSON.parse(localStorage.getItem("ai_chart_history") || "[]");
      const filtered = existing.filter((s: SignalData) => s.id !== signal.id);
      // Store with compressed thumbnail if needed
      filtered.unshift(signal);
      localStorage.setItem("ai_chart_history", JSON.stringify(filtered.slice(0, 50)));
    } catch (e) {
      console.error("Local storage fallback failed:", e);
    }
  }
}

export async function getAllSignalsFromDB(): Promise<SignalData[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();

      req.onsuccess = () => {
        const results = req.result as SignalData[];
        // Sort descending by timestamp (newest first)
        results.sort((a, b) => b.timestamp - a.timestamp);
        resolve(results);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn("IndexedDB read failed, falling back to localStorage", err);
    try {
      const list = JSON.parse(localStorage.getItem("ai_chart_history") || "[]");
      return list.sort((a: SignalData, b: SignalData) => b.timestamp - a.timestamp);
    } catch {
      return [];
    }
  }
}

export async function deleteSignalFromDB(id: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn("IndexedDB delete failed, falling back to localStorage", err);
    try {
      const list = JSON.parse(localStorage.getItem("ai_chart_history") || "[]");
      const updated = list.filter((s: SignalData) => s.id !== id);
      localStorage.setItem("ai_chart_history", JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  }
}

export async function clearAllSignalsFromDB(): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.clear();

      req.onsuccess = () => {
        localStorage.removeItem("ai_chart_history");
        resolve();
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn("IndexedDB clear failed", err);
    localStorage.removeItem("ai_chart_history");
  }
}

export async function getStorageStats(): Promise<{ count: number; approxSizeBytes: number }> {
  try {
    const signals = await getAllSignalsFromDB();
    let totalBytes = 0;
    for (const s of signals) {
      totalBytes += (s.chartImage?.length || 0) + 1000;
    }
    return {
      count: signals.length,
      approxSizeBytes: totalBytes,
    };
  } catch {
    return { count: 0, approxSizeBytes: 0 };
  }
}
