import { Box, Text, ScrollBox } from "@opentui/core";
import type { AppState } from "../state/app-state.ts";
import type { FileEntry } from "../services/filesystem.ts";
import { getFileIcon } from "../utils/icons.ts";
import { formatFileSize, formatDate } from "../utils/format.ts";
import { ICONS } from "../utils/icons.ts";

export function TileView(
  state: AppState,
  width: number,
  height: number
) {
  const isFocused = state.focusedPane === "tile";
  const entries = state.searchQuery 
    ? state.entries.filter(e => 
        e.name.toLowerCase().includes(state.searchQuery.toLowerCase())
      )
    : state.entries;
  
  const rowElements = entries.map((entry, index) => {
    const isSelected = index === state.selectedIndex;
    const isMarked = state.selectedEntries.has(entry.path);
    
    let bgColor = "transparent";
    if (isSelected && isFocused) {
      bgColor = "#45475a";
    } else if (isSelected) {
      bgColor = "#313244";
    } else if (isMarked) {
      bgColor = "#2a2a3a";
    }
    
    const icon = getFileIcon(entry.name, entry.isDirectory);
    const marker = isMarked ? ICONS.selected : " ";
    const nameColor = entry.isDirectory ? "#89b4fa" : "#cdd6f4";
    const name = entry.name.length > 30 
      ? entry.name.slice(0, 27) + "..." 
      : entry.name;
    
    const size = entry.isDirectory ? "<DIR>" : formatFileSize(entry.size);
    const date = formatDate(entry.mtime);
    
    const nameWidth = Math.max(10, width - 28);
    const paddedName = name.padEnd(nameWidth).slice(0, nameWidth);
    const paddedSize = size.padStart(10);
    
    return Box(
      {
        width: "100%",
        height: 1,
        flexDirection: "row",
        backgroundColor: bgColor,
        paddingX: 1,
      },
      Text({ content: marker, fg: "#a6e3a1", width: 2 }),
      Text({ content: `${icon} `, fg: nameColor, width: 3 }),
      Text({ content: paddedName, fg: nameColor }),
      Text({ content: paddedSize, fg: "#6c7086" }),
      Text({ content: `  ${date}`, fg: "#6c7086" }),
    );
  });
  
  if (rowElements.length === 0) {
    rowElements.push(
      Box(
        { width: "100%", height: 1, paddingX: 1 },
        Text({ 
          content: state.searchQuery 
            ? `No matches for "${state.searchQuery}"` 
            : "(empty directory)", 
          fg: "#6c7086" 
        }),
      ),
    );
  }
  
  let title = " Files ";
  if (state.searchQuery) {
    title = ` Filter: ${state.searchQuery} `;
  }
  
  return Box(
    {
      width,
      height,
      flexDirection: "column",
      borderStyle: isFocused ? "rounded" : "single",
      borderColor: isFocused ? "#89b4fa" : "#45475a",
      title,
      titleAlignment: "center",
      backgroundColor: "#1e1e2e",
    },
    Box(
      {
        width: "100%",
        height: 1,
        flexDirection: "row",
        backgroundColor: "#313244",
        paddingX: 1,
      },
      Text({ content: "  ", width: 2 }),
      Text({ content: "   ", width: 3 }),
      Text({ content: "Name", fg: "#cdd6f4" }),
      Box({ flexGrow: 1 }),
      Text({ content: "Size", fg: "#cdd6f4" }),
      Text({ content: "      Modified", fg: "#cdd6f4" }),
    ),
    ScrollBox(
      {
        width: "100%",
        height: "100%",
        viewportCulling: true,
      },
      ...rowElements,
    ),
  );
}
