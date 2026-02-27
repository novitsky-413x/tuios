import { Box, Text } from "@opentui/core";
import type { AppState } from "../state/app-state.ts";
import { formatFileSize } from "../utils/format.ts";
import { ICONS } from "../utils/icons.ts";

export function StatusBar(state: AppState) {
  const entry = state.entries[state.selectedIndex];
  
  let leftContent = ` ${state.currentPath}`;
  
  if (state.clipboard) {
    const op = state.clipboard.operation === "copy" ? ICONS.copy : ICONS.cut;
    leftContent += ` ${op} ${state.clipboard.entries.length} item(s)`;
  }
  
  let centerContent = "";
  if (entry) {
    centerContent = `${entry.name}`;
    if (!entry.isDirectory) {
      centerContent += ` (${formatFileSize(entry.size)})`;
    }
  }
  
  const selectedCount = state.selectedEntries.size;
  let rightContent = `${state.selectedIndex + 1}/${state.entries.length}`;
  if (selectedCount > 0) {
    rightContent = `${selectedCount} selected | ${rightContent}`;
  }
  
  if (state.showHidden) {
    rightContent += " [H]";
  }
  
  const hints = state.focusedPane === "tree" 
    ? "Tab:switch  Enter:open  ?:help"
    : "hjkl:nav  Enter:open  Space:sel  y:copy  d:del  ?:help";
  
  return Box(
    {
      width: "100%",
      height: 2,
      flexDirection: "column",
      backgroundColor: "#1e1e2e",
    },
    Box(
      {
        width: "100%",
        height: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        backgroundColor: "#313244",
        paddingX: 1,
      },
      Text({ content: leftContent, fg: "#cdd6f4" }),
      Text({ content: centerContent, fg: "#89b4fa" }),
      Text({ content: rightContent, fg: "#a6adc8" }),
    ),
    Box(
      {
        width: "100%",
        height: 1,
        paddingX: 1,
        backgroundColor: "#1e1e2e",
      },
      Text({ content: hints, fg: "#6c7086" }),
    ),
  );
}
