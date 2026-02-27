export const ICONS = {
  folder: "📁",
  folderOpen: "📂",
  file: "📄",
  fileText: "📝",
  fileCode: "💻",
  fileImage: "🖼️",
  fileVideo: "🎬",
  fileAudio: "🎵",
  fileArchive: "📦",
  filePdf: "📕",
  symlink: "🔗",
  executable: "⚙️",
  hidden: "👁️",
  selected: "✓",
  expanded: "▼",
  collapsed: "▶",
  tab: "◆",
  bookmark: "★",
  search: "🔍",
  copy: "📋",
  cut: "✂️",
  error: "❌",
  loading: "⏳",
} as const;

const EXTENSION_MAP: Record<string, string> = {
  // Code
  ts: ICONS.fileCode,
  tsx: ICONS.fileCode,
  js: ICONS.fileCode,
  jsx: ICONS.fileCode,
  py: ICONS.fileCode,
  rs: ICONS.fileCode,
  go: ICONS.fileCode,
  java: ICONS.fileCode,
  c: ICONS.fileCode,
  cpp: ICONS.fileCode,
  h: ICONS.fileCode,
  hpp: ICONS.fileCode,
  rb: ICONS.fileCode,
  php: ICONS.fileCode,
  swift: ICONS.fileCode,
  kt: ICONS.fileCode,
  scala: ICONS.fileCode,
  zig: ICONS.fileCode,
  
  // Text/Config
  md: ICONS.fileText,
  txt: ICONS.fileText,
  json: ICONS.fileText,
  yaml: ICONS.fileText,
  yml: ICONS.fileText,
  toml: ICONS.fileText,
  xml: ICONS.fileText,
  html: ICONS.fileCode,
  css: ICONS.fileCode,
  scss: ICONS.fileCode,
  
  // Images
  png: ICONS.fileImage,
  jpg: ICONS.fileImage,
  jpeg: ICONS.fileImage,
  gif: ICONS.fileImage,
  webp: ICONS.fileImage,
  svg: ICONS.fileImage,
  ico: ICONS.fileImage,
  bmp: ICONS.fileImage,
  
  // Video
  mp4: ICONS.fileVideo,
  mkv: ICONS.fileVideo,
  avi: ICONS.fileVideo,
  mov: ICONS.fileVideo,
  webm: ICONS.fileVideo,
  
  // Audio
  mp3: ICONS.fileAudio,
  wav: ICONS.fileAudio,
  flac: ICONS.fileAudio,
  ogg: ICONS.fileAudio,
  m4a: ICONS.fileAudio,
  
  // Archives
  zip: ICONS.fileArchive,
  tar: ICONS.fileArchive,
  gz: ICONS.fileArchive,
  rar: ICONS.fileArchive,
  "7z": ICONS.fileArchive,
  
  // Documents
  pdf: ICONS.filePdf,
};

export function getFileIcon(filename: string, isDirectory: boolean, isExpanded = false): string {
  if (isDirectory) {
    return isExpanded ? ICONS.folderOpen : ICONS.folder;
  }
  
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  return EXTENSION_MAP[ext] ?? ICONS.file;
}

export function isHiddenFile(filename: string): boolean {
  return filename.startsWith(".");
}
