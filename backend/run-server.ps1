# PowerShell скрипт для запуска сервера
Write-Host "Starting Auto Parts API Server in Demo Mode..." -ForegroundColor Cyan

# Копируем демо-настройки в .env
Copy-Item -Path .\.env.demo -Destination .\.env -Force
Write-Host "Demo environment settings applied." -ForegroundColor Green

# Запуск сервера 
npm run dev 