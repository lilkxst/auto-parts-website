# PowerShell скрипт для запуска сервера
Write-Host "Starting Auto Parts API Server in Demo Mode..." -ForegroundColor Cyan

# Переменные среды для демо-режима
$env:USE_DEMO_MODE = "true"

# Запуск сервера 
npm run dev 