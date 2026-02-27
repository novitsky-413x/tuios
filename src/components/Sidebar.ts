import { Box, Text, ScrollBox } from "@opentui/core";
import type { Bookmark } from "../services/bookmarks.ts";
import { ICONS } from "../utils/icons.ts";

export function BookmarksSidebar(
  bookmarks: Bookmark[],
  currentPath: string,
  width: number,
  height: number
) {
  const bookmarkElements = bookmarks.map((bookmark) => {
    const isCurrent = bookmark.path === currentPath;
    const bgColor = isCurrent ? "#45475a" : "transparent";
    
    return Box(
      {
        width: "100%",
        height: 1,
        backgroundColor: bgColor,
        paddingX: 1,
      },
      Text({
        content: `${ICONS.bookmark} ${bookmark.name}`,
        fg: isCurrent ? "#f9e2af" : "#cdd6f4",
      }),
    );
  });
  
  if (bookmarkElements.length === 0) {
    bookmarkElements.push(
      Box(
        { width: "100%", height: 1, paddingX: 1 },
        Text({ content: "(no bookmarks)", fg: "#6c7086" }),
      ),
    );
  }
  
  return Box(
    {
      width,
      height,
      flexDirection: "column",
      borderStyle: "rounded",
      borderColor: "#f9e2af",
      title: " Bookmarks ",
      titleAlignment: "center",
      backgroundColor: "#1e1e2e",
    },
    ScrollBox(
      {
        width: "100%",
        height: "100%",
      },
      ...bookmarkElements,
    ),
    Box(
      {
        width: "100%",
        height: 1,
        backgroundColor: "#313244",
        paddingX: 1,
      },
      Text({ content: "B: add  d: remove  Enter: go", fg: "#6c7086" }),
    ),
  );
}
