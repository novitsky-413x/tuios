import { Box, Text, Input } from "@opentui/core";

export function SearchBar(
  searchQuery: string,
  isActive: boolean,
  width: number
) {
  if (!isActive) {
    return Box({ width: 0, height: 0 });
  }
  
  return Box(
    {
      width,
      height: 3,
      position: "absolute",
      top: 3,
      left: Math.floor((100 - width) / 2),
      borderStyle: "rounded",
      borderColor: "#89b4fa",
      backgroundColor: "#1e1e2e",
      padding: 1,
      flexDirection: "row",
      alignItems: "center",
    },
    Text({ content: "/ ", fg: "#89b4fa" }),
    Input({
      id: "search-input",
      placeholder: "Filter files...",
      value: searchQuery,
      width: width - 6,
      backgroundColor: "#313244",
      focusedBackgroundColor: "#45475a",
      textColor: "#cdd6f4",
      cursorColor: "#89b4fa",
    }),
  );
}

export function InputDialog(
  title: string,
  placeholder: string,
  initialValue: string,
  width: number
) {
  return Box(
    {
      width,
      height: 5,
      position: "absolute",
      top: 5,
      left: Math.floor((100 - width) / 2),
      borderStyle: "rounded",
      borderColor: "#89b4fa",
      backgroundColor: "#1e1e2e",
      padding: 1,
      flexDirection: "column",
      gap: 1,
    },
    Text({ content: title, fg: "#cdd6f4" }),
    Input({
      id: "dialog-input",
      placeholder,
      value: initialValue,
      width: width - 4,
      backgroundColor: "#313244",
      focusedBackgroundColor: "#45475a",
      textColor: "#cdd6f4",
      cursorColor: "#89b4fa",
    }),
  );
}

export function ConfirmDialog(
  title: string,
  message: string,
  width: number
) {
  return Box(
    {
      width,
      height: 6,
      position: "absolute",
      top: 5,
      left: Math.floor((100 - width) / 2),
      borderStyle: "rounded",
      borderColor: "#f38ba8",
      backgroundColor: "#1e1e2e",
      padding: 1,
      flexDirection: "column",
      gap: 1,
    },
    Text({ content: title, fg: "#f38ba8" }),
    Text({ content: message, fg: "#cdd6f4" }),
    Box(
      { flexDirection: "row", gap: 2, marginTop: 1 },
      Text({ content: "[y] Yes", fg: "#a6e3a1" }),
      Text({ content: "[n] No", fg: "#6c7086" }),
    ),
  );
}

export function HelpOverlay(width: number, height: number) {
  const keybindings = [
    ["Navigation", ""],
    ["h/j/k/l, arrows", "Navigate"],
    ["Enter", "Open / enter directory"],
    ["- or Backspace", "Go to parent"],
    ["~", "Go to home"],
    ["g g", "Go to top"],
    ["G", "Go to bottom"],
    ["", ""],
    ["Selection", ""],
    ["Space", "Toggle selection"],
    ["a", "Select all"],
    ["Escape", "Clear selection"],
    ["", ""],
    ["File Operations", ""],
    ["n", "New file"],
    ["N", "New folder"],
    ["r", "Rename"],
    ["y", "Copy (yank)"],
    ["x", "Cut"],
    ["v", "Paste"],
    ["d", "Delete"],
    ["", ""],
    ["Views & Panels", ""],
    ["Tab", "Switch pane"],
    ["1", "Focus tree"],
    ["2", "Focus files"],
    ["p", "Toggle preview"],
    ["b", "Toggle bookmarks"],
    [".", "Toggle hidden files"],
    ["", ""],
    ["Tabs", ""],
    ["t", "New tab"],
    ["w / q", "Close tab"],
    ["g t", "Next tab"],
    ["g T", "Previous tab"],
    ["", ""],
    ["/", "Search / filter"],
    ["?", "Toggle this help"],
    ["Ctrl+C", "Quit"],
  ];
  
  const rows = keybindings.map(([key, desc]) => {
    const keyStr = key ?? "";
    const descStr = desc ?? "";
    if (descStr === "") {
      return Box(
        { width: "100%", height: 1, paddingX: 2 },
        Text({ content: keyStr, fg: "#89b4fa" }),
      );
    }
    return Box(
      { width: "100%", height: 1, paddingX: 2, flexDirection: "row" },
      Text({ content: keyStr.padEnd(20), fg: "#f9e2af" }),
      Text({ content: descStr, fg: "#cdd6f4" }),
    );
  });
  
  return Box(
    {
      width,
      height,
      position: "absolute",
      top: 2,
      left: 2,
      borderStyle: "rounded",
      borderColor: "#89b4fa",
      backgroundColor: "#1e1e2e",
      title: " Help - Press ? or Esc to close ",
      titleAlignment: "center",
      flexDirection: "column",
    },
    ...rows,
  );
}
