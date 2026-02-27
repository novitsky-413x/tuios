# tuios

A fast TUI file manager / mini OS built with Bun and OpenTUI.

## Features

- **Three-panel layout**: Tree view, file listing, and preview pane
- **Vim-style navigation**: `h/j/k/l` keys for movement
- **File operations**: Copy, cut, paste, delete, rename, create
- **Syntax-highlighted preview**: View code files with tree-sitter highlighting
- **Tabs**: Open multiple directories in tabs
- **Bookmarks**: Save frequently used directories
- **Search/filter**: Quick file filtering with `/`
- **Mouse support**: Click and scroll (keyboard preferred)

## Installation

Requires [Bun](https://bun.sh/) runtime.

```bash
# Install Bun if you don't have it
curl -fsSL https://bun.sh/install | bash

# Clone and install
cd tuios
bun install

# Run
bun start

# Or run directly
bun run src/index.ts

# Open a specific directory
bun run src/index.ts /path/to/directory
```

### Global installation

```bash
bun link
tuios
```

## Keyboard Shortcuts

### Navigation

| Key | Action |
|-----|--------|
| `h` / `←` | Go to parent directory |
| `j` / `↓` | Move down |
| `k` / `↑` | Move up |
| `l` / `→` / `Enter` | Open / enter directory |
| `g g` | Go to top |
| `G` | Go to bottom |
| `~` | Go to home directory |
| `-` | Go to parent directory |

### Selection

| Key | Action |
|-----|--------|
| `Space` | Toggle selection |
| `a` | Select all |
| `Escape` | Clear selection |

### File Operations

| Key | Action |
|-----|--------|
| `n` | New file |
| `N` | New folder |
| `r` | Rename |
| `y` | Copy (yank) |
| `x` | Cut |
| `v` | Paste |
| `d` | Delete |

### Views & Panels

| Key | Action |
|-----|--------|
| `Tab` | Switch between panes |
| `1` | Focus tree view |
| `2` | Focus file list |
| `p` | Toggle preview pane |
| `b` | Toggle bookmarks |
| `B` | Add current dir to bookmarks |
| `.` | Toggle hidden files |

### Tabs

| Key | Action |
|-----|--------|
| `t` | New tab |
| `w` / `q` | Close tab |
| `g t` | Next tab |
| `g T` | Previous tab |

### Other

| Key | Action |
|-----|--------|
| `/` | Search / filter files |
| `?` | Show help |
| `Ctrl+C` | Quit |

## Configuration

Configuration is stored in `~/.config/tuios/config.json`:

```json
{
  "showHidden": false,
  "showPreview": true,
  "sortField": "name",
  "sortDirection": "asc",
  "foldersFirst": true,
  "treeWidth": 25,
  "previewWidth": 40,
  "confirmDelete": true
}
```

Bookmarks are stored in `~/.config/tuios/bookmarks.json`.

## Tech Stack

- **Runtime**: [Bun](https://bun.sh/) - fast JavaScript runtime
- **TUI Framework**: [OpenTUI](https://opentui.com/) - native Zig core with TypeScript bindings
- **Language**: TypeScript

## License

MIT
