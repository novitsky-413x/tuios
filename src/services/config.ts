import { homedir } from "node:os";
import { join } from "node:path";
import { mkdir } from "node:fs/promises";

export interface TuiosConfig {
  showHidden: boolean;
  showPreview: boolean;
  sortField: "name" | "size" | "mtime" | "type";
  sortDirection: "asc" | "desc";
  foldersFirst: boolean;
  treeWidth: number;
  previewWidth: number;
  confirmDelete: boolean;
}

const CONFIG_DIR = join(homedir(), ".config", "tuios");
const CONFIG_FILE = join(CONFIG_DIR, "config.json");

const DEFAULT_CONFIG: TuiosConfig = {
  showHidden: false,
  showPreview: true,
  sortField: "name",
  sortDirection: "asc",
  foldersFirst: true,
  treeWidth: 25,
  previewWidth: 40,
  confirmDelete: true,
};

export async function ensureConfigDir(): Promise<void> {
  await mkdir(CONFIG_DIR, { recursive: true });
}

export async function loadConfig(): Promise<TuiosConfig> {
  try {
    const file = Bun.file(CONFIG_FILE);
    if (!(await file.exists())) {
      return { ...DEFAULT_CONFIG };
    }
    
    const data = await file.json();
    return { ...DEFAULT_CONFIG, ...data };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export async function saveConfig(config: TuiosConfig): Promise<void> {
  await ensureConfigDir();
  await Bun.write(CONFIG_FILE, JSON.stringify(config, null, 2));
}

export function getDefaultConfig(): TuiosConfig {
  return { ...DEFAULT_CONFIG };
}
