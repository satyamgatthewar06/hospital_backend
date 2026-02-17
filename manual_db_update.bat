@echo off
echo ==========================================
echo      Railway Database Update Utility
echo ==========================================
echo.
echo 1. Unlinking previous project (if any)...
railway unlink
echo.
echo 2. Please select your project ('wholesome-trust') from the list below:
railway link
echo.
echo 3. Updating Database Schema...
railway run node db/createSchema.js
echo.
echo 4. Seeding Users...
railway run node create_all_users.js
echo.
echo ==========================================
echo ✅ Database update complete!
echo ==========================================
pause
