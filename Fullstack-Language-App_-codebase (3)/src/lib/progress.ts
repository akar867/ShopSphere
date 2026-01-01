"use client";

// Simple client-side progress tracker using localStorage
// Structure: { audio: { [id:number]: true }, video: { [id:number]: true } }

const KEY = "progress:v1";

export type ProgressStore = {
  audio: Record<string, boolean>;
  video: Record<string, boolean>;
};

function read(): ProgressStore {
  if (typeof window === "undefined") return { audio: {}, video: {} };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { audio: {}, video: {} };
    const parsed = JSON.parse(raw);
    return {
      audio: parsed.audio || {},
      video: parsed.video || {},
    } as ProgressStore;
  } catch {
    return { audio: {}, video: {} };
  }
}

function write(data: ProgressStore) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {}
}

export function markAudioComplete(id: number | string) {
  const store = read();
  store.audio[String(id)] = true;
  write(store);
}

export function markVideoComplete(id: number | string) {
  const store = read();
  store.video[String(id)] = true;
  write(store);
}

export function getProgress() {
  const store = read();
  return store;
}