#!/usr/bin/env bun

import { createCliRenderer } from "@opentui/core";
import { App } from "./app.ts";
import { loadConfig } from "./services/config.ts";
import { resolve } from "node:path";

function cleanupTerminal() {
  // Disable mouse tracking modes
  process.stdout.write("\x1b[?1000l"); // Disable mouse click tracking
  process.stdout.write("\x1b[?1002l"); // Disable mouse drag tracking  
  process.stdout.write("\x1b[?1003l"); // Disable all mouse tracking
  process.stdout.write("\x1b[?1006l"); // Disable SGR mouse mode
  // Exit alternate screen buffer (in case it wasn't done)
  process.stdout.write("\x1b[?1049l");
  // Reset terminal attributes
  process.stdout.write("\x1b[0m");
  // Show cursor
  process.stdout.write("\x1b[?25h");
  // Clear screen and home cursor
  process.stdout.write("\x1b[2J\x1b[H");
}

async function main() {
  const args = process.argv.slice(2);
  let initialPath = process.cwd();
  
  if (args.length > 0 && args[0] && !args[0].startsWith("-")) {
    initialPath = resolve(args[0]);
  }
  
  const config = await loadConfig();
  
  const renderer = await createCliRenderer({
    exitOnCtrlC: true,
    targetFps: 30,
    useMouse: true,
    useAlternateScreen: true,
  });
  
  const app = new App(renderer, config, initialPath);
  
  renderer.on("destroy", () => {
    // Give renderer time to finish cleanup, then clean terminal and exit
    setTimeout(() => {
      cleanupTerminal();
      process.exit(0);
    }, 50);
  });
  
  await app.start();
}

main().catch((err) => {
  cleanupTerminal();
  console.error("Fatal error:", err);
  process.exit(1);
});
