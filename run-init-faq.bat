@echo off
echo Starting FAQ table creation...
node scripts\init-faq.js
if %errorlevel% neq 0 (
    echo Error: Script failed with error code %errorlevel%
    pause
    exit /b %errorlevel%
)
echo Script completed successfully!
pause
