@echo off
cd /d "%~dp0"
node node_modules/webpack/bin/webpack.js --mode production
