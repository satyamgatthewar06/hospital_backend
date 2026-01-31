# MongoDB Startup Script for Windows
$mongoPath = "$env:USERPROFILE\mongodb-server"
$dataPath = "$env:USERPROFILE\mongodb-server\data"

# Create directories
Write-Host "Creating directories..."
if (-not (Test-Path $mongoPath)) { 
    New-Item -ItemType Directory -Path $mongoPath -Force | Out-Null 
}
if (-not (Test-Path $dataPath)) { 
    New-Item -ItemType Directory -Path $dataPath -Force | Out-Null 
}

# Check if MongoDB already downloaded
if (-not (Test-Path "$mongoPath\mongod.exe")) {
    Write-Host "Downloading MongoDB 7.0.5..."
    $url = 'https://downloads.mongodb.org/windows/mongodb-windows-x86_64-7.0.5.zip'
    $zip = "$mongoPath\mongodb.zip"
    
    try {
        Invoke-WebRequest -Uri $url -OutFile $zip -UseBasicParsing
        Write-Host "Extracting MongoDB..."
        Expand-Archive -Path $zip -DestinationPath $mongoPath -Force
        Move-Item "$mongoPath\mongodb-windows-x86_64-7.0.5\bin\*" $mongoPath -Force
        Remove-Item "$mongoPath\mongodb-windows-x86_64-7.0.5" -Force -Recurse
        Remove-Item $zip -Force
    } catch {
        Write-Host "Download failed. Please check your internet connection."
        exit 1
    }
}

Write-Host "Starting MongoDB on port 27017..."
Write-Host "Data path: $dataPath"
& "$mongoPath\mongod.exe" --dbpath $dataPath
