@echo off
REM MongoDB Setup for Windows - Hospital Management System

echo ========================================
echo MongoDB Setup for Hospital Management
echo ========================================

REM Download MongoDB
echo.
echo Downloading MongoDB 7.0.5...
powershell -Command "Add-Type -AssemblyName System.Net.Http; $client = New-Object System.Net.Http.HttpClient; $file = New-Object System.IO.FileStream('mongodb-installer.msi', [System.IO.FileMode]::Create); $task = $client.GetAsync('https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-7.0.5-signed.msi'); $task.Wait(); $stream = $task.Result.Content.ReadAsStreamAsync(); $stream.Result.CopyTo($file); $file.Close()"

if errorlevel 1 (
    echo Failed to download MongoDB
    pause
    exit /b 1
)

REM Run installer
echo Installing MongoDB...
msiexec /i mongodb-installer.msi /quiet /norestart SHOULD_INSTALL_COMPASS=0

echo.
echo ========================================
echo MongoDB installation in progress...
echo This may take 2-3 minutes
echo ========================================
echo.
echo Once complete, restart your backend:
echo   npm start
echo.
pause
