@echo off
echo Installing dependencies...
call npm install

echo.
echo Installing Playwright browsers...
call npx playwright install chromium

echo.
echo Setup complete!
echo.
echo To start the server:
echo   npm run dev
echo.
pause
