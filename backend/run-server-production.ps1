# PowerShell скрипт для запуска сервера в рабочем режиме
Write-Host "Starting Auto Parts API Server in PRODUCTION Mode..." -ForegroundColor Green

# Создаем файл .env для производственного режима
@"
# Настройки сервера
PORT=5000

# Режим работы
NODE_ENV=development

# Явно отключаем демо-режим
USE_DEMO_MODE=false

# Настройки базы данных MongoDB
MONGODB_URI=mongodb://localhost:27017/autoparts

# Настройки JWT
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=30d

# Настройки SMTP для отправки писем
EMAIL_USER=sos2223kj@gmail.com
EMAIL_PASS=idgddxelkylaabjp
EMAIL_FROM=АвтоЗапчасти <sos2223kj@gmail.com>
"@ | Out-File -FilePath .\.env -Encoding utf8

# Переменная среды для явного отключения демо-режима
$env:USE_DEMO_MODE = "false"

# Запуск сервера 
npm run dev 