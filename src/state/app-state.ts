import type { FileEntry, SortOptions } from "../services/filesystem.ts";
import type { Bookmark } from "../services/bookmarks.ts";
import type { TuiosConfig } from "../services/config.ts";

export type ViewMode = "tree" | "tile";
export type FocusedPane = "tree" | "tile" | "preview" | "search" | "command";

export interface ClipboardState {
  entries: FileEntry[];
  operation: "copy" | "cut";
}

export interface TabState {
  id: string;
  path: string;
  name: string;
  selectedIndex: number;
  scrollOffset: number;
}

export interface AppState {
  currentPath: string;
  entries: FileEntry[];
  selectedIndex: number;
  selectedEntries: Set<string>;
  focusedPane: FocusedPane;
  showTree: boolean;
  showPreview: boolean;
  showBookmarks: boolean;
  showHelp: boolean;
  showHidden: boolean;
  
  treeExpandedPaths: Set<string>;
  treeSelectedPath: string;
  
  sortOptions: SortOptions;
  
  clipboard: ClipboardState | null;
  
  tabs: TabState[];
  activeTabIndex: number;
  
  bookmarks: Bookmark[];
  
  searchQuery: string;
  isSearching: boolean;
  
  loading: boolean;
  error: string | null;
  
  confirmDialog: ConfirmDialog | null;
  inputDialog: InputDialog | null;
  
  config: TuiosConfig;
}

export interface ConfirmDialog {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export interface InputDialog {
  title: string;
  placeholder: string;
  initialValue: string;
  onSubmit: (value: string) => void;
  onCancel: () => void;
}

type StateListener = (state: AppState) => void;

export class StateManager {
  private state: AppState;
  private listeners: Set<StateListener> = new Set();
  
  constructor(initialPath: string, config: TuiosConfig) {
    this.state = {
      currentPath: initialPath,
      entries: [],
      selectedIndex: 0,
      selectedEntries: new Set(),
      focusedPane: "tile",
      showTree: true,
      showPreview: true,
      showBookmarks: false,
      showHelp: false,
      showHidden: config.showHidden,
      
      treeExpandedPaths: new Set([initialPath]),
      treeSelectedPath: initialPath,
      
      sortOptions: {
        field: config.sortField,
        direction: config.sortDirection,
        foldersFirst: config.foldersFirst,
      },
      
      clipboard: null,
      
      tabs: [{
        id: crypto.randomUUID(),
        path: initialPath,
        name: initialPath.split("/").pop() || "/",
        selectedIndex: 0,
        scrollOffset: 0,
      }],
      activeTabIndex: 0,
      
      bookmarks: [],
      
      searchQuery: "",
      isSearching: false,
      
      loading: false,
      error: null,
      
      confirmDialog: null,
      inputDialog: null,
      
      config,
    };
  }
  
  getState(): AppState {
    return this.state;
  }
  
  subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  
  update(partial: Partial<AppState>): void {
    this.state = { ...this.state, ...partial };
    this.notifyListeners();
  }
  
  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }
  
  setPath(path: string): void {
    this.update({
      currentPath: path,
      selectedIndex: 0,
      selectedEntries: new Set(),
      error: null,
    });
    
    const tabs = [...this.state.tabs];
    const activeTab = tabs[this.state.activeTabIndex];
    if (activeTab) {
      activeTab.path = path;
      activeTab.name = path.split("/").pop() || "/";
      activeTab.selectedIndex = 0;
      this.update({ tabs });
    }
  }
  
  setEntries(entries: FileEntry[]): void {
    this.update({
      entries,
      loading: false,
      selectedIndex: Math.min(this.state.selectedIndex, Math.max(0, entries.length - 1)),
    });
  }
  
  setSelectedIndex(index: number): void {
    const clamped = Math.max(0, Math.min(index, this.state.entries.length - 1));
    this.update({ selectedIndex: clamped });
  }
  
  toggleSelection(path: string): void {
    const selected = new Set(this.state.selectedEntries);
    if (selected.has(path)) {
      selected.delete(path);
    } else {
      selected.add(path);
    }
    this.update({ selectedEntries: selected });
  }
  
  clearSelection(): void {
    this.update({ selectedEntries: new Set() });
  }
  
  selectAll(): void {
    const selected = new Set(this.state.entries.map(e => e.path));
    this.update({ selectedEntries: selected });
  }
  
  setFocusedPane(pane: FocusedPane): void {
    this.update({ focusedPane: pane });
  }
  
  toggleTree(): void {
    this.update({ showTree: !this.state.showTree });
  }
  
  togglePreview(): void {
    this.update({ showPreview: !this.state.showPreview });
  }
  
  toggleBookmarks(): void {
    this.update({ showBookmarks: !this.state.showBookmarks });
  }
  
  toggleHelp(): void {
    this.update({ showHelp: !this.state.showHelp });
  }
  
  toggleHidden(): void {
    this.update({ showHidden: !this.state.showHidden });
  }
  
  toggleTreeExpand(path: string): void {
    const expanded = new Set(this.state.treeExpandedPaths);
    if (expanded.has(path)) {
      expanded.delete(path);
    } else {
      expanded.add(path);
    }
    this.update({ treeExpandedPaths: expanded });
  }
  
  setTreeSelectedPath(path: string): void {
    this.update({ treeSelectedPath: path });
  }
  
  setClipboard(entries: FileEntry[], operation: "copy" | "cut"): void {
    this.update({
      clipboard: { entries, operation },
    });
  }
  
  clearClipboard(): void {
    this.update({ clipboard: null });
  }
  
  addTab(path: string): void {
    const newTab: TabState = {
      id: crypto.randomUUID(),
      path,
      name: path.split("/").pop() || "/",
      selectedIndex: 0,
      scrollOffset: 0,
    };
    
    this.update({
      tabs: [...this.state.tabs, newTab],
      activeTabIndex: this.state.tabs.length,
    });
  }
  
  closeTab(index: number): void {
    if (this.state.tabs.length <= 1) return;
    
    const tabs = this.state.tabs.filter((_, i) => i !== index);
    let activeIndex = this.state.activeTabIndex;
    
    if (activeIndex >= tabs.length) {
      activeIndex = tabs.length - 1;
    }
    
    this.update({
      tabs,
      activeTabIndex: activeIndex,
    });
  }
  
  switchTab(index: number): void {
    if (index < 0 || index >= this.state.tabs.length) return;
    
    const tabs = [...this.state.tabs];
    const currentTab = tabs[this.state.activeTabIndex];
    if (currentTab) {
      currentTab.path = this.state.currentPath;
      currentTab.selectedIndex = this.state.selectedIndex;
    }
    
    const newTab = tabs[index];
    if (!newTab) return;
    
    this.update({
      tabs,
      activeTabIndex: index,
      currentPath: newTab.path,
      selectedIndex: newTab.selectedIndex,
    });
  }
  
  nextTab(): void {
    const next = (this.state.activeTabIndex + 1) % this.state.tabs.length;
    this.switchTab(next);
  }
  
  prevTab(): void {
    const prev = (this.state.activeTabIndex - 1 + this.state.tabs.length) % this.state.tabs.length;
    this.switchTab(prev);
  }
  
  setBookmarks(bookmarks: Bookmark[]): void {
    this.update({ bookmarks });
  }
  
  setSearchQuery(query: string): void {
    this.update({ searchQuery: query });
  }
  
  startSearch(): void {
    this.update({ isSearching: true, focusedPane: "search" });
  }
  
  endSearch(): void {
    this.update({ isSearching: false });
  }
  
  setLoading(loading: boolean): void {
    this.update({ loading });
  }
  
  setError(error: string | null): void {
    this.update({ error, loading: false });
  }
  
  showConfirmDialog(dialog: ConfirmDialog): void {
    this.update({ confirmDialog: dialog });
  }
  
  hideConfirmDialog(): void {
    this.update({ confirmDialog: null });
  }
  
  showInputDialog(dialog: InputDialog): void {
    this.update({ inputDialog: dialog });
  }
  
  hideInputDialog(): void {
    this.update({ inputDialog: null });
  }
  
  getCurrentEntry(): FileEntry | null {
    return this.state.entries[this.state.selectedIndex] ?? null;
  }
  
  getSelectedEntries(): FileEntry[] {
    if (this.state.selectedEntries.size === 0) {
      const current = this.getCurrentEntry();
      return current ? [current] : [];
    }
    
    return this.state.entries.filter(e => this.state.selectedEntries.has(e.path));
  }
  
  getFilteredEntries(): FileEntry[] {
    if (!this.state.searchQuery) {
      return this.state.entries;
    }
    
    const query = this.state.searchQuery.toLowerCase();
    return this.state.entries.filter(e => 
      e.name.toLowerCase().includes(query)
    );
  }
}
