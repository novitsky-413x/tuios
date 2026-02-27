import { Box, Text, ScrollBox } from "@opentui/core";
import type { AppState } from "../state/app-state.ts";
import { ICONS, getFileIcon } from "../utils/icons.ts";

interface TreeNode {
  name: string;
  path: string;
  depth: number;
  isDirectory: boolean;
  isExpanded: boolean;
  isSelected: boolean;
  isCurrent: boolean;
}

export function TreeView(
  state: AppState,
  width: number,
  height: number,
  treeNodes: TreeNode[]
) {
  const isFocused = state.focusedPane === "tree";
  
  const nodeElements = treeNodes.map((node) => {
    const indent = "  ".repeat(node.depth);
    const expandIcon = node.isDirectory
      ? (node.isExpanded ? ICONS.expanded : ICONS.collapsed)
      : " ";
    const fileIcon = getFileIcon(node.name, node.isDirectory, node.isExpanded);
    
    let bgColor = "transparent";
    if (node.isCurrent && isFocused) {
      bgColor = "#45475a";
    } else if (node.isSelected) {
      bgColor = "#313244";
    }
    
    const textColor = node.isDirectory ? "#89b4fa" : "#cdd6f4";
    
    return Box(
      {
        width: "100%",
        height: 1,
        backgroundColor: bgColor,
        paddingLeft: 1,
      },
      Text({
        content: `${indent}${expandIcon} ${fileIcon} ${node.name}`,
        fg: textColor,
      }),
    );
  });
  
  if (nodeElements.length === 0) {
    nodeElements.push(
      Box(
        { width: "100%", height: 1, paddingLeft: 1 },
        Text({ content: "(empty)", fg: "#6c7086" }),
      ),
    );
  }
  
  return Box(
    {
      width,
      height,
      flexDirection: "column",
      borderStyle: isFocused ? "rounded" : "single",
      borderColor: isFocused ? "#89b4fa" : "#45475a",
      title: " Tree ",
      titleAlignment: "center",
      backgroundColor: "#1e1e2e",
    },
    ScrollBox(
      {
        width: "100%",
        height: "100%",
        viewportCulling: true,
      },
      ...nodeElements,
    ),
  );
}

export function buildTreeNodes(
  rootPath: string,
  currentPath: string,
  expandedPaths: Set<string>,
  dirContents: Map<string, { name: string; path: string; isDirectory: boolean }[]>
): TreeNode[] {
  const nodes: TreeNode[] = [];
  
  function addNode(
    path: string,
    name: string,
    depth: number,
    isDirectory: boolean
  ) {
    const isExpanded = expandedPaths.has(path);
    const isCurrent = path === currentPath;
    
    nodes.push({
      name,
      path,
      depth,
      isDirectory,
      isExpanded,
      isSelected: false,
      isCurrent,
    });
    
    if (isDirectory && isExpanded) {
      const contents = dirContents.get(path) ?? [];
      const sortedContents = [...contents].sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        return a.name.localeCompare(b.name);
      });
      
      for (const item of sortedContents) {
        addNode(item.path, item.name, depth + 1, item.isDirectory);
      }
    }
  }
  
  const rootName = rootPath === "/" ? "/" : rootPath.split("/").pop() || rootPath;
  addNode(rootPath, rootName, 0, true);
  
  return nodes;
}
