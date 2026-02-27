import { Box, Text } from "@opentui/core";
import type { TabState } from "../state/app-state.ts";
import { ICONS } from "../utils/icons.ts";

export function TabBar(tabs: TabState[], activeIndex: number) {
  const tabElements = tabs.map((tab, index) => {
    const isActive = index === activeIndex;
    const icon = isActive ? ICONS.tab : " ";
    const name = tab.name.length > 15 ? tab.name.slice(0, 12) + "..." : tab.name;
    
    return Box(
      {
        paddingX: 1,
        backgroundColor: isActive ? "#45475a" : "#313244",
        marginRight: 1,
      },
      Text({
        content: `${icon} ${name}`,
        fg: isActive ? "#cdd6f4" : "#6c7086",
      }),
    );
  });
  
  return Box(
    {
      width: "100%",
      height: 1,
      flexDirection: "row",
      backgroundColor: "#1e1e2e",
      paddingX: 1,
    },
    ...tabElements,
    Box({ flexGrow: 1 }),
    Text({ content: `[${tabs.length}]`, fg: "#6c7086" }),
  );
}
