import { readdir, stat, mkdir, rm, rename, copyFile as fsCopyFile } from "node:fs/promises";
import { join, basename, dirname } from "node:path";

export interface FileEntry {
  name: string;
  path: string;
  isDirectory: boolean;
  isSymlink: boolean;
  isHidden: boolean;
  size: number;
  mtime: Date;
  mode: number;
}

export type SortField = "name" | "size" | "mtime" | "type";
export type SortDirection = "asc" | "desc";

export interface SortOptions {
  field: SortField;
  direction: SortDirection;
  foldersFirst: boolean;
}

export async function listDirectory(
  dirPath: string,
  showHidden = false
): Promise<FileEntry[]> {
  const entries: FileEntry[] = [];
  
  try {
    const items = await readdir(dirPath, { withFileTypes: true });
    
    for (const item of items) {
      const isHidden = item.name.startsWith(".");
      if (!showHidden && isHidden) continue;
      
      const fullPath = join(dirPath, item.name);
      
      try {
        const stats = await stat(fullPath);
        
        entries.push({
          name: item.name,
          path: fullPath,
          isDirectory: item.isDirectory(),
          isSymlink: item.isSymbolicLink(),
          isHidden,
          size: stats.size,
          mtime: stats.mtime,
          mode: stats.mode,
        });
      } catch {
        entries.push({
          name: item.name,
          path: fullPath,
          isDirectory: item.isDirectory(),
          isSymlink: item.isSymbolicLink(),
          isHidden,
          size: 0,
          mtime: new Date(),
          mode: 0,
        });
      }
    }
  } catch (error) {
    throw new Error(`Cannot read directory: ${dirPath}`);
  }
  
  return entries;
}

export function sortEntries(
  entries: FileEntry[],
  options: SortOptions
): FileEntry[] {
  const { field, direction, foldersFirst } = options;
  const multiplier = direction === "asc" ? 1 : -1;
  
  return [...entries].sort((a, b) => {
    if (foldersFirst) {
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
    }
    
    switch (field) {
      case "name":
        return multiplier * a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
      case "size":
        return multiplier * (a.size - b.size);
      case "mtime":
        return multiplier * (a.mtime.getTime() - b.mtime.getTime());
      case "type": {
        const extA = a.name.split(".").pop() ?? "";
        const extB = b.name.split(".").pop() ?? "";
        return multiplier * extA.localeCompare(extB);
      }
      default:
        return 0;
    }
  });
}

export async function getFileInfo(filePath: string): Promise<FileEntry> {
  const stats = await stat(filePath);
  const name = basename(filePath);
  
  return {
    name,
    path: filePath,
    isDirectory: stats.isDirectory(),
    isSymlink: stats.isSymbolicLink(),
    isHidden: name.startsWith("."),
    size: stats.size,
    mtime: stats.mtime,
    mode: stats.mode,
  };
}

export async function readFilePreview(
  filePath: string,
  maxLines = 100,
  maxBytes = 50000
): Promise<string> {
  const file = Bun.file(filePath);
  const size = file.size;
  
  if (size === 0) return "(empty file)";
  if (size > maxBytes) {
    const slice = file.slice(0, maxBytes);
    const text = await slice.text();
    const lines = text.split("\n").slice(0, maxLines);
    return lines.join("\n") + "\n... (truncated)";
  }
  
  const text = await file.text();
  const lines = text.split("\n").slice(0, maxLines);
  return lines.join("\n");
}

export async function createFile(filePath: string): Promise<void> {
  await Bun.write(filePath, "");
}

export async function createDirectory(dirPath: string): Promise<void> {
  await mkdir(dirPath, { recursive: true });
}

export async function deleteEntry(entryPath: string): Promise<void> {
  await rm(entryPath, { recursive: true, force: true });
}

export async function renameEntry(
  oldPath: string,
  newName: string
): Promise<string> {
  const dir = dirname(oldPath);
  const newPath = join(dir, newName);
  await rename(oldPath, newPath);
  return newPath;
}

export async function copyEntry(
  sourcePath: string,
  destDir: string
): Promise<string> {
  const name = basename(sourcePath);
  const destPath = join(destDir, name);
  
  const sourceStats = await stat(sourcePath);
  
  if (sourceStats.isDirectory()) {
    await mkdir(destPath, { recursive: true });
    const items = await readdir(sourcePath);
    for (const item of items) {
      await copyEntry(join(sourcePath, item), destPath);
    }
  } else {
    await fsCopyFile(sourcePath, destPath);
  }
  
  return destPath;
}

export async function moveEntry(
  sourcePath: string,
  destDir: string
): Promise<string> {
  const name = basename(sourcePath);
  const destPath = join(destDir, name);
  await rename(sourcePath, destPath);
  return destPath;
}

export function getParentDirectory(dirPath: string): string {
  const parent = dirname(dirPath);
  return parent === dirPath ? dirPath : parent;
}

export function isTextFile(filename: string): boolean {
  const textExtensions = new Set([
    "txt", "md", "json", "yaml", "yml", "toml", "xml", "html", "htm",
    "css", "scss", "sass", "less", "js", "jsx", "ts", "tsx", "mjs", "cjs",
    "py", "rb", "go", "rs", "c", "cpp", "h", "hpp", "java", "kt", "scala",
    "swift", "php", "sh", "bash", "zsh", "fish", "ps1", "bat", "cmd",
    "sql", "graphql", "dockerfile", "makefile", "cmake", "gitignore",
    "env", "ini", "cfg", "conf", "log", "csv", "tsv", "zig",
  ]);
  
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  const name = filename.toLowerCase();
  
  return textExtensions.has(ext) || 
         textExtensions.has(name) ||
         name === "makefile" ||
         name === "dockerfile" ||
         name === "license" ||
         name === "readme";
}
