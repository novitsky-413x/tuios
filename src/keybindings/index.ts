import type { StateManager } from "../state/app-state.ts";
import type { CliRenderer } from "@opentui/core";
import {
  listDirectory,
  sortEntries,
  getParentDirectory,
  deleteEntry,
  renameEntry,
  copyEntry,
  moveEntry,
  createFile,
  createDirectory,
} from "../services/filesystem.ts";
import { addBookmark, removeBookmark } from "../services/bookmarks.ts";
import { basename } from "node:path";

export interface KeyBinding {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: string;
  description: string;
}

export const KEYBINDINGS: KeyBinding[] = [
  { key: "h", action: "nav_left", description: "Navigate left / parent" },
  { key: "j", action: "nav_down", description: "Navigate down" },
  { key: "k", action: "nav_up", description: "Navigate up" },
  { key: "l", action: "nav_right", description: "Navigate right / enter" },
  { key: "ArrowLeft", action: "nav_left", description: "Navigate left / parent" },
  { key: "ArrowDown", action: "nav_down", description: "Navigate down" },
  { key: "ArrowUp", action: "nav_up", description: "Navigate up" },
  { key: "ArrowRight", action: "nav_right", description: "Navigate right / enter" },
  { key: "Enter", action: "open", description: "Open / enter directory" },
  { key: "Space", action: "toggle_select", description: "Toggle selection" },
  { key: "Tab", action: "switch_pane", description: "Switch pane" },
  { key: "1", action: "focus_tree", description: "Focus tree view" },
  { key: "2", action: "focus_tile", description: "Focus tile view" },
  { key: "p", action: "toggle_preview", description: "Toggle preview" },
  { key: "n", action: "new_file", description: "New file" },
  { key: "N", shift: true, action: "new_folder", description: "New folder" },
  { key: "d", action: "delete", description: "Delete" },
  { key: "r", action: "rename", description: "Rename" },
  { key: "y", action: "copy", description: "Copy (yank)" },
  { key: "x", action: "cut", description: "Cut" },
  { key: "v", action: "paste", description: "Paste" },
  { key: "/", action: "search", description: "Search / filter" },
  { key: "Escape", action: "cancel", description: "Cancel / clear" },
  { key: "b", action: "toggle_bookmarks", description: "Toggle bookmarks" },
  { key: "B", shift: true, action: "add_bookmark", description: "Add bookmark" },
  { key: "t", action: "new_tab", description: "New tab" },
  { key: "w", action: "close_tab", description: "Close tab" },
  { key: ".", action: "toggle_hidden", description: "Toggle hidden files" },
  { key: "g", action: "go_top", description: "Go to top" },
  { key: "G", shift: true, action: "go_bottom", description: "Go to bottom" },
  { key: "a", action: "select_all", description: "Select all" },
  { key: "?", action: "help", description: "Show help" },
  { key: "q", action: "quit", description: "Quit" },
  { key: "~", action: "go_home", description: "Go to home" },
  { key: "-", action: "go_parent", description: "Go to parent" },
];

export class KeyHandler {
  private state: StateManager;
  private renderer: CliRenderer;
  private refreshCallback: () => Promise<void>;
  private gPending = false;
  
  constructor(
    state: StateManager,
    renderer: CliRenderer,
    refreshCallback: () => Promise<void>
  ) {
    this.state = state;
    this.renderer = renderer;
    this.refreshCallback = refreshCallback;
  }
  
  setup(): void {
    this.renderer.keyInput.on("keypress", (key: { 
      name: string; 
      ctrl: boolean; 
      shift: boolean; 
      meta: boolean;
      sequence: string;
    }) => {
      this.handleKey(key);
    });
  }
  
  private handleKey(key: { 
    name: string; 
    ctrl: boolean; 
    shift: boolean; 
    meta: boolean;
    sequence: string;
  }): void {
    const s = this.state.getState();
    
    if (s.inputDialog) {
      return;
    }
    
    if (s.confirmDialog) {
      if (key.name === "y" || key.name === "Enter") {
        s.confirmDialog.onConfirm();
        this.state.hideConfirmDialog();
      } else if (key.name === "n" || key.name === "Escape") {
        s.confirmDialog.onCancel();
        this.state.hideConfirmDialog();
      }
      return;
    }
    
    if (s.showHelp) {
      if (key.name === "Escape" || key.name === "q" || key.name === "?") {
        this.state.toggleHelp();
      }
      return;
    }
    
    if (s.isSearching) {
      if (key.name === "Escape") {
        this.state.endSearch();
        this.state.setSearchQuery("");
        this.state.setFocusedPane("tile");
      } else if (key.name === "Enter") {
        this.state.endSearch();
        this.state.setFocusedPane("tile");
      }
      return;
    }
    
    if (this.gPending) {
      this.gPending = false;
      if (key.name === "g") {
        this.state.setSelectedIndex(0);
      } else if (key.name === "t") {
        this.state.nextTab();
      } else if (key.shift && key.name === "T") {
        this.state.prevTab();
      }
      return;
    }
    
    const action = this.findAction(key);
    if (action) {
      this.executeAction(action);
    }
  }
  
  private findAction(key: { name: string; shift: boolean }): string | null {
    for (const binding of KEYBINDINGS) {
      if (binding.key === key.name || 
          (key.shift && binding.shift && binding.key === key.name.toUpperCase())) {
        return binding.action;
      }
      if (binding.key === key.name && binding.shift === key.shift) {
        return binding.action;
      }
    }
    return null;
  }
  
  private executeAction(action: string): void {
    const s = this.state.getState();
    
    switch (action) {
      case "nav_up":
        this.state.setSelectedIndex(s.selectedIndex - 1);
        break;
        
      case "nav_down":
        this.state.setSelectedIndex(s.selectedIndex + 1);
        break;
        
      case "nav_left":
      case "go_parent":
        this.navigateToParent();
        break;
        
      case "nav_right":
      case "open":
        this.openSelected();
        break;
        
      case "toggle_select":
        const current = this.state.getCurrentEntry();
        if (current) {
          this.state.toggleSelection(current.path);
          this.state.setSelectedIndex(s.selectedIndex + 1);
        }
        break;
        
      case "switch_pane":
        if (s.focusedPane === "tree") {
          this.state.setFocusedPane("tile");
        } else if (s.focusedPane === "tile" && s.showPreview) {
          this.state.setFocusedPane("preview");
        } else {
          this.state.setFocusedPane(s.showTree ? "tree" : "tile");
        }
        break;
        
      case "focus_tree":
        if (s.showTree) this.state.setFocusedPane("tree");
        break;
        
      case "focus_tile":
        this.state.setFocusedPane("tile");
        break;
        
      case "toggle_preview":
        this.state.togglePreview();
        break;
        
      case "new_file":
        this.promptNewFile();
        break;
        
      case "new_folder":
        this.promptNewFolder();
        break;
        
      case "delete":
        this.deleteSelected();
        break;
        
      case "rename":
        this.renameSelected();
        break;
        
      case "copy":
        const copyEntries = this.state.getSelectedEntries();
        if (copyEntries.length > 0) {
          this.state.setClipboard(copyEntries, "copy");
        }
        break;
        
      case "cut":
        const cutEntries = this.state.getSelectedEntries();
        if (cutEntries.length > 0) {
          this.state.setClipboard(cutEntries, "cut");
        }
        break;
        
      case "paste":
        this.pasteClipboard();
        break;
        
      case "search":
        this.state.startSearch();
        break;
        
      case "cancel":
        this.state.clearSelection();
        this.state.setSearchQuery("");
        break;
        
      case "toggle_bookmarks":
        this.state.toggleBookmarks();
        break;
        
      case "add_bookmark":
        this.addCurrentBookmark();
        break;
        
      case "new_tab":
        this.state.addTab(s.currentPath);
        break;
        
      case "close_tab":
        if (s.tabs.length > 1) {
          this.state.closeTab(s.activeTabIndex);
          this.refreshCallback();
        } else {
          this.renderer.destroy();
        }
        break;
        
      case "toggle_hidden":
        this.state.toggleHidden();
        this.refreshCallback();
        break;
        
      case "go_top":
        this.gPending = true;
        setTimeout(() => { this.gPending = false; }, 500);
        break;
        
      case "go_bottom":
        this.state.setSelectedIndex(s.entries.length - 1);
        break;
        
      case "select_all":
        this.state.selectAll();
        break;
        
      case "help":
        this.state.toggleHelp();
        break;
        
      case "quit":
        if (s.tabs.length > 1) {
          this.state.closeTab(s.activeTabIndex);
          this.refreshCallback();
        } else {
          this.renderer.destroy();
        }
        break;
        
      case "go_home":
        const home = process.env.HOME ?? "/";
        this.state.setPath(home);
        this.refreshCallback();
        break;
    }
  }
  
  private navigateToParent(): void {
    const s = this.state.getState();
    const parent = getParentDirectory(s.currentPath);
    if (parent !== s.currentPath) {
      this.state.setPath(parent);
      this.refreshCallback();
    }
  }
  
  private openSelected(): void {
    const entry = this.state.getCurrentEntry();
    if (!entry) return;
    
    if (entry.isDirectory) {
      this.state.setPath(entry.path);
      this.state.toggleTreeExpand(entry.path);
      this.refreshCallback();
    }
  }
  
  private promptNewFile(): void {
    this.state.showInputDialog({
      title: "New File",
      placeholder: "filename.txt",
      initialValue: "",
      onSubmit: async (name) => {
        const s = this.state.getState();
        const path = `${s.currentPath}/${name}`;
        try {
          await createFile(path);
          this.state.hideInputDialog();
          await this.refreshCallback();
        } catch (e) {
          this.state.setError(`Failed to create file: ${e}`);
        }
      },
      onCancel: () => {
        this.state.hideInputDialog();
      },
    });
  }
  
  private promptNewFolder(): void {
    this.state.showInputDialog({
      title: "New Folder",
      placeholder: "folder-name",
      initialValue: "",
      onSubmit: async (name) => {
        const s = this.state.getState();
        const path = `${s.currentPath}/${name}`;
        try {
          await createDirectory(path);
          this.state.hideInputDialog();
          await this.refreshCallback();
        } catch (e) {
          this.state.setError(`Failed to create folder: ${e}`);
        }
      },
      onCancel: () => {
        this.state.hideInputDialog();
      },
    });
  }
  
  private deleteSelected(): void {
    const entries = this.state.getSelectedEntries();
    if (entries.length === 0) return;
    
    const names = entries.map(e => e.name).join(", ");
    const message = entries.length === 1
      ? `Delete "${entries[0]?.name}"?`
      : `Delete ${entries.length} items (${names})?`;
    
    this.state.showConfirmDialog({
      title: "Confirm Delete",
      message,
      onConfirm: async () => {
        try {
          for (const entry of entries) {
            await deleteEntry(entry.path);
          }
          this.state.clearSelection();
          await this.refreshCallback();
        } catch (e) {
          this.state.setError(`Failed to delete: ${e}`);
        }
      },
      onCancel: () => {},
    });
  }
  
  private renameSelected(): void {
    const entry = this.state.getCurrentEntry();
    if (!entry) return;
    
    this.state.showInputDialog({
      title: "Rename",
      placeholder: entry.name,
      initialValue: entry.name,
      onSubmit: async (newName) => {
        if (newName && newName !== entry.name) {
          try {
            await renameEntry(entry.path, newName);
            this.state.hideInputDialog();
            await this.refreshCallback();
          } catch (e) {
            this.state.setError(`Failed to rename: ${e}`);
          }
        } else {
          this.state.hideInputDialog();
        }
      },
      onCancel: () => {
        this.state.hideInputDialog();
      },
    });
  }
  
  private async pasteClipboard(): Promise<void> {
    const s = this.state.getState();
    if (!s.clipboard) return;
    
    const { entries, operation } = s.clipboard;
    
    try {
      for (const entry of entries) {
        if (operation === "copy") {
          await copyEntry(entry.path, s.currentPath);
        } else {
          await moveEntry(entry.path, s.currentPath);
        }
      }
      
      if (operation === "cut") {
        this.state.clearClipboard();
      }
      
      await this.refreshCallback();
    } catch (e) {
      this.state.setError(`Failed to paste: ${e}`);
    }
  }
  
  private async addCurrentBookmark(): Promise<void> {
    const s = this.state.getState();
    const name = basename(s.currentPath) || "/";
    const bookmarks = await addBookmark(name, s.currentPath);
    this.state.setBookmarks(bookmarks);
  }
}
