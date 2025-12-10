#!/bin/bash
# Run electron-vite dev without ELECTRON_RUN_AS_NODE
# This is needed because VSCode/Claude Code sets ELECTRON_RUN_AS_NODE=1

cd "$(dirname "$0")"
unset ELECTRON_RUN_AS_NODE
npm run dev
