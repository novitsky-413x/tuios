import { Box, Text, BoxRenderable, type CliRenderer } from "@opentui/core";
import { StateManager, type AppState } from "./state/app-state.ts";
import { KeyHandler } from "./keybindings/index.ts";
import { 
  listDirectory, 
  sortEntries, 
  readFilePreview,
  isTextFile,
} from "./services/filesystem.ts";
import { loadBookmarks } from "./services/bookmarks.ts";
import { type TuiosConfig } from "./services/config.ts";

import { StatusBar } from "./components/StatusBar.ts";
import { TabBar } from "./components/TabBar.ts";
import { TreeView, buildTreeNodes } from "./components/TreeView.ts";
import { TileView } from "./components/TileView.ts";
import { FilePreview } from "./components/FilePreview.ts";
import { BookmarksSidebar } from "./components/Sidebar.ts";
import { 
  SearchBar, 
  InputDialog as InputDialogComponent, 
  ConfirmDialog as ConfirmDialogComponent,
  HelpOverlay 
} from "./components/CommandPalette.ts";

export class App {
  private renderer: CliRenderer;
  private state: StateManager;
  private keyHandler: KeyHandler;
  private previewContent: string | null = null;
  private treeContents: Map<string, { name: string; path: string; isDirectory: boolean }[]> = new Map();
  private mainContainer: BoxRenderable | null = null;
  private isRendering = false;
  
  constructor(renderer: CliRenderer, config: TuiosConfig, initialPath: string) {
    this.renderer = renderer;
    this.state = new StateManager(initialPath, config);
    this.keyHandler = new KeyHandler(
      this.state,
      renderer,
      () => this.refresh()
    );
  }
  
  async start(): Promise<void> {
    const bookmarks = await loadBookmarks();
    this.state.setBookmarks(bookmarks);
    
    this.keyHandler.setup();
    
    this.state.subscribe(() => {
      this.scheduleRender();
    });
    
    this.renderer.on("resize", () => {
      this.scheduleRender();
    });
    
    await this.refresh();
  }
  
  private renderQueued = false;
  
  private scheduleRender(): void {
    if (this.renderQueued) return;
    this.renderQueued = true;
    queueMicrotask(() => {
      this.renderQueued = false;
      this.render();
    });
  }
  
  async refresh(): Promise<void> {
    const s = this.state.getState();
    this.state.setLoading(true);
    
    try {
      const entries = await listDirectory(s.currentPath, s.showHidden);
      const sorted = sortEntries(entries, s.sortOptions);
      this.state.setEntries(sorted);
      
      await this.loadTreeContents(s.currentPath, s.treeExpandedPaths);
      
      await this.loadPreview();
    } catch (error) {
      this.state.setError(String(error));
    }
    
    this.render();
  }
  
  private async loadTreeContents(
    rootPath: string, 
    expandedPaths: Set<string>
  ): Promise<void> {
    this.treeContents.clear();
    
    for (const path of expandedPaths) {
      try {
        const entries = await listDirectory(path, this.state.getState().showHidden);
        this.treeContents.set(
          path,
          entries.map(e => ({
            name: e.name,
            path: e.path,
            isDirectory: e.isDirectory,
          }))
        );
      } catch {
        // Directory might not be accessible
      }
    }
  }
  
  private async loadPreview(): Promise<void> {
    const s = this.state.getState();
    const entry = s.entries[s.selectedIndex];
    
    if (!entry || entry.isDirectory || !isTextFile(entry.name)) {
      this.previewContent = null;
      return;
    }
    
    try {
      this.previewContent = await readFilePreview(entry.path, 100, 50000);
    } catch {
      this.previewContent = "(Unable to read file)";
    }
  }
  
  private render(): void {
    if (this.isRendering) return;
    this.isRendering = true;
    
    try {
      const s = this.state.getState();
      const { width, height } = this.renderer;
      
      const tabBarHeight = 1;
      const statusBarHeight = 2;
      const contentHeight = height - tabBarHeight - statusBarHeight;
      
      const treeWidth = s.showTree ? s.config.treeWidth : 0;
      const previewWidth = s.showPreview ? s.config.previewWidth : 0;
      const tileWidth = Math.max(10, width - treeWidth - previewWidth);
      
      const currentEntry = s.entries[s.selectedIndex] ?? null;
      
      const rootPath = this.findRootPath(s.currentPath);
      const treeNodes = buildTreeNodes(
        rootPath,
        s.currentPath,
        s.treeExpandedPaths,
        this.treeContents
      );
      
      const contentPanels: ReturnType<typeof Box>[] = [];
      
      if (s.showTree) {
        contentPanels.push(TreeView(s, treeWidth, contentHeight, treeNodes));
      }
      
      contentPanels.push(TileView(s, tileWidth, contentHeight));
      
      if (s.showPreview) {
        contentPanels.push(
          FilePreview(
            currentEntry,
            this.previewContent,
            previewWidth,
            contentHeight,
            s.focusedPane === "preview"
          )
        );
      }
      
      const mainContent = Box(
        {
          width: "100%",
          height: contentHeight,
          flexDirection: "row",
        },
        ...contentPanels,
      );
      
      const layoutChildren: ReturnType<typeof Box>[] = [
        TabBar(s.tabs, s.activeTabIndex),
        mainContent,
        StatusBar(s),
      ];
      
      if (s.showBookmarks) {
        layoutChildren.push(
          Box(
            {
              position: "absolute",
              top: 2,
              left: 2,
            },
            BookmarksSidebar(s.bookmarks, s.currentPath, 30, Math.min(15, height - 4))
          )
        );
      }
      
      if (s.isSearching) {
        layoutChildren.push(
          Box(
            {
              position: "absolute",
              top: 3,
              left: Math.floor((width - 50) / 2),
            },
            SearchBar(s.searchQuery, true, 50)
          )
        );
      }
      
      if (s.inputDialog) {
        layoutChildren.push(
          Box(
            {
              position: "absolute",
              top: 5,
              left: Math.floor((width - 50) / 2),
            },
            InputDialogComponent(
              s.inputDialog.title,
              s.inputDialog.placeholder,
              s.inputDialog.initialValue,
              50
            )
          )
        );
      }
      
      if (s.confirmDialog) {
        layoutChildren.push(
          Box(
            {
              position: "absolute",
              top: 5,
              left: Math.floor((width - 50) / 2),
            },
            ConfirmDialogComponent(
              s.confirmDialog.title,
              s.confirmDialog.message,
              50
            )
          )
        );
      }
      
      if (s.showHelp) {
        layoutChildren.push(
          Box(
            {
              position: "absolute",
              top: 2,
              left: 2,
            },
            HelpOverlay(width - 4, height - 4)
          )
        );
      }
      
      if (s.error) {
        layoutChildren.push(
          Box(
            {
              width: 60,
              height: 3,
              position: "absolute",
              bottom: 3,
              left: Math.floor((width - 60) / 2),
              borderStyle: "rounded",
              borderColor: "#f38ba8",
              backgroundColor: "#1e1e2e",
              padding: 1,
              flexDirection: "row",
              gap: 1,
            },
            Text({ content: "Error: ", fg: "#f38ba8" }),
            Text({ content: s.error, fg: "#cdd6f4" }),
          )
        );
      }
      
      const layout = Box(
        {
          id: "main-layout",
          width: "100%",
          height: "100%",
          flexDirection: "column",
          backgroundColor: "#1e1e2e",
        },
        ...layoutChildren,
      );
      
      if (this.mainContainer) {
        this.mainContainer.destroy();
      }
      
      this.mainContainer = new BoxRenderable(this.renderer, {
        id: "root-container",
        width: "100%",
        height: "100%",
      });
      
      this.mainContainer.add(layout);
      this.renderer.root.add(this.mainContainer);
      
    } finally {
      this.isRendering = false;
    }
  }
  
  private findRootPath(currentPath: string): string {
    const home = process.env.HOME ?? "/";
    if (currentPath.startsWith(home)) {
      return home;
    }
    
    const parts = currentPath.split("/").filter(Boolean);
    if (parts.length > 0) {
      return "/" + parts[0];
    }
    return "/";
  }
}
