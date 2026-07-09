@echo off
cd /d "%~dp0"
if defined PORT (
  node_modules\.bin\vite.cmd --port %PORT%
) else (
  node_modules\.bin\vite.cmd
)
