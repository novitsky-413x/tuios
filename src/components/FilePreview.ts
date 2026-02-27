import { Box, Text, ScrollBox, Code, SyntaxStyle, RGBA } from "@opentui/core";
import type { FileEntry } from "../services/filesystem.ts";
import { readFilePreview, isTextFile } from "../services/filesystem.ts";
import { formatFileSize, formatDate, formatPermissions } from "../utils/format.ts";
import { ICONS } from "../utils/icons.ts";

const defaultSyntaxStyle = SyntaxStyle.fromStyles({
  default: { fg: RGBA.fromHex("#cdd6f4") },
  keyword: { fg: RGBA.fromHex("#cba6f7") },
  string: { fg: RGBA.fromHex("#a6e3a1") },
  comment: { fg: RGBA.fromHex("#6c7086") },
  number: { fg: RGBA.fromHex("#fab387") },
  function: { fg: RGBA.fromHex("#89b4fa") },
  variable: { fg: RGBA.fromHex("#f5c2e7") },
  type: { fg: RGBA.fromHex("#f9e2af") },
  operator: { fg: RGBA.fromHex("#89dceb") },
  punctuation: { fg: RGBA.fromHex("#bac2de") },
});

function getFiletype(filename: string): string | undefined {
  const ext = filename.split(".").pop()?.toLowerCase();
  const filetypeMap: Record<string, string> = {
    ts: "typescript",
    tsx: "tsx",
    js: "javascript",
    jsx: "javascript",
    py: "python",
    rs: "rust",
    go: "go",
    java: "java",
    c: "c",
    cpp: "cpp",
    h: "c",
    hpp: "cpp",
    rb: "ruby",
    php: "php",
    swift: "swift",
    kt: "kotlin",
    scala: "scala",
    zig: "zig",
    md: "markdown",
    json: "json",
    yaml: "yaml",
    yml: "yaml",
    toml: "toml",
    xml: "xml",
    html: "html",
    css: "css",
    scss: "scss",
    sh: "bash",
    bash: "bash",
    zsh: "bash",
    sql: "sql",
  };
  return ext ? filetypeMap[ext] : undefined;
}

export function FilePreview(
  entry: FileEntry | null,
  previewContent: string | null,
  width: number,
  height: number,
  isFocused: boolean
) {
  if (!entry) {
    return Box(
      {
        width,
        height,
        borderStyle: "single",
        borderColor: "#45475a",
        title: " Preview ",
        titleAlignment: "center",
        backgroundColor: "#1e1e2e",
        justifyContent: "center",
        alignItems: "center",
      },
      Text({ content: "No file selected", fg: "#6c7086" }),
    );
  }
  
  if (entry.isDirectory) {
    return Box(
      {
        width,
        height,
        flexDirection: "column",
        borderStyle: isFocused ? "rounded" : "single",
        borderColor: isFocused ? "#89b4fa" : "#45475a",
        title: " Preview ",
        titleAlignment: "center",
        backgroundColor: "#1e1e2e",
        padding: 1,
      },
      Text({ content: `${ICONS.folder} ${entry.name}`, fg: "#89b4fa" }),
      Text({ content: "", height: 1 }),
      Text({ content: "Type: Directory", fg: "#cdd6f4" }),
      Text({ content: `Modified: ${formatDate(entry.mtime)}`, fg: "#cdd6f4" }),
      Text({ content: `Permissions: ${formatPermissions(entry.mode)}`, fg: "#cdd6f4" }),
    );
  }
  
  const filetype = getFiletype(entry.name);
  const canPreview = isTextFile(entry.name) && previewContent !== null;
  
  if (!canPreview) {
    return Box(
      {
        width,
        height,
        flexDirection: "column",
        borderStyle: isFocused ? "rounded" : "single",
        borderColor: isFocused ? "#89b4fa" : "#45475a",
        title: " Preview ",
        titleAlignment: "center",
        backgroundColor: "#1e1e2e",
        padding: 1,
      },
      Text({ content: `${ICONS.file} ${entry.name}`, fg: "#cdd6f4" }),
      Text({ content: "", height: 1 }),
      Text({ content: `Size: ${formatFileSize(entry.size)}`, fg: "#cdd6f4" }),
      Text({ content: `Modified: ${formatDate(entry.mtime)}`, fg: "#cdd6f4" }),
      Text({ content: `Permissions: ${formatPermissions(entry.mode)}`, fg: "#cdd6f4" }),
      Text({ content: "", height: 1 }),
      Text({ content: "(Binary or unsupported file type)", fg: "#6c7086" }),
    );
  }
  
  return Box(
    {
      width,
      height,
      flexDirection: "column",
      borderStyle: isFocused ? "rounded" : "single",
      borderColor: isFocused ? "#89b4fa" : "#45475a",
      title: ` ${entry.name} `,
      titleAlignment: "center",
      backgroundColor: "#1e1e2e",
    },
    ScrollBox(
      {
        width: "100%",
        height: "100%",
        viewportCulling: true,
      },
      filetype
        ? Code({
            content: previewContent || "",
            filetype,
            syntaxStyle: defaultSyntaxStyle,
          })
        : Text({
            content: previewContent || "",
            fg: "#cdd6f4",
          }),
    ),
  );
}
