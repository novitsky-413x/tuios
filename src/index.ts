#!/usr/bin/env bun

import { createCliRenderer } from "@opentui/core";
import { App } from "./app.ts";
import { loadConfig } from "./services/config.ts";
import { resolve } from "node:path";

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
    process.exit(0);
  });
  
  await app.start();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
