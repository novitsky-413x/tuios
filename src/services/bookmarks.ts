import { homedir } from "node:os";
import { join } from "node:path";
import { mkdir } from "node:fs/promises";

export interface Bookmark {
  name: string;
  path: string;
  createdAt: Date;
}

const CONFIG_DIR = join(homedir(), ".config", "tuios");
const BOOKMARKS_FILE = join(CONFIG_DIR, "bookmarks.json");

export async function ensureConfigDir(): Promise<void> {
  await mkdir(CONFIG_DIR, { recursive: true });
}

export async function loadBookmarks(): Promise<Bookmark[]> {
  try {
    const file = Bun.file(BOOKMARKS_FILE);
    if (!(await file.exists())) {
      return getDefaultBookmarks();
    }
    
    const data = await file.json();
    return data.bookmarks.map((b: Bookmark) => ({
      ...b,
      createdAt: new Date(b.createdAt),
    }));
  } catch {
    return getDefaultBookmarks();
  }
}

export async function saveBookmarks(bookmarks: Bookmark[]): Promise<void> {
  await ensureConfigDir();
  await Bun.write(BOOKMARKS_FILE, JSON.stringify({ bookmarks }, null, 2));
}

export async function addBookmark(name: string, path: string): Promise<Bookmark[]> {
  const bookmarks = await loadBookmarks();
  
  const existing = bookmarks.find(b => b.path === path);
  if (existing) {
    return bookmarks;
  }
  
  bookmarks.push({
    name,
    path,
    createdAt: new Date(),
  });
  
  await saveBookmarks(bookmarks);
  return bookmarks;
}

export async function removeBookmark(path: string): Promise<Bookmark[]> {
  const bookmarks = await loadBookmarks();
  const filtered = bookmarks.filter(b => b.path !== path);
  await saveBookmarks(filtered);
  return filtered;
}

function getDefaultBookmarks(): Bookmark[] {
  const home = homedir();
  return [
    { name: "Home", path: home, createdAt: new Date() },
    { name: "Documents", path: join(home, "Documents"), createdAt: new Date() },
    { name: "Downloads", path: join(home, "Downloads"), createdAt: new Date() },
  ];
}
