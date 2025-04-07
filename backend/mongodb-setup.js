/**
 * Инструкции по установке и настройке MongoDB для API интернет-магазина автозапчастей
 */

console.log(`
================================================================================
                     УСТАНОВКА И НАСТРОЙКА MONGODB
================================================================================

Для работы API требуется MongoDB версии 4.4 или выше. Следуйте инструкциям ниже
для установки и настройки базы данных.

1. УСТАНОВКА MONGODB COMMUNITY EDITION
--------------------------------------

A. Для Windows:
   1. Скачайте установщик с официального сайта: https://www.mongodb.com/try/download/community
   2. Запустите установщик и следуйте инструкциям мастера установки
   3. Выберите опцию "Complete" для полной установки
   4. Отметьте пункт "Install MongoDB as a Service"
   5. Завершите установку

B. Для MacOS (с Homebrew):
   1. Откройте терминал
   2. Установите MongoDB: brew tap mongodb/brew && brew install mongodb-community
   3. Запустите сервис: brew services start mongodb-community

C. Для Linux (Ubuntu):
   1. Импортируйте публичный ключ: 
      wget -qO - https://www.mongodb.org/static/pgp/server-4.4.asc | sudo apt-key add -
   2. Создайте список источников:
      echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/4.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.4.list
   3. Обновите пакеты: sudo apt-get update
   4. Установите MongoDB: sudo apt-get install -y mongodb-org
   5. Запустите сервис: sudo systemctl start mongod

2. ПРОВЕРКА УСТАНОВКИ
---------------------

Выполните следующую команду в терминале или командной строке:
> mongod --version

Вы должны увидеть информацию о версии MongoDB.

3. ПОДКЛЮЧЕНИЕ К MONGODB
------------------------

По умолчанию MongoDB запускается на localhost:27017

Вы можете использовать MongoDB Compass (графический интерфейс) для управления базой данных:
https://www.mongodb.com/try/download/compass

4. НАСТРОЙКА БАЗЫ ДАННЫХ ДЛЯ ПРОЕКТА
------------------------------------

После установки MongoDB и запуска сервера:

1. Создайте .env файл в корневой директории backend с настройками:
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/auto_parts_db
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRES_IN=7d
   NODE_ENV=development

2. Запустите скрипт инициализации для создания начальных данных:
   > npm run seed

5. ПРОБЛЕМЫ И РЕШЕНИЯ
---------------------

Если MongoDB не запускается:
- Проверьте, что порт 27017 не занят другим приложением
- Убедитесь, что у вас есть права на создание директории данных (/data/db)
- Проверьте логи MongoDB: 
  - Windows: C:\\Program Files\\MongoDB\\Server\\4.4\\log\\mongod.log
  - MacOS/Linux: /var/log/mongodb/mongod.log

6. ДОПОЛНИТЕЛЬНАЯ ИНФОРМАЦИЯ
----------------------------

Официальная документация: https://docs.mongodb.com/
Драйвер MongoDB для Node.js: https://mongodb.github.io/node-mongodb-native/
Mongoose ODM: https://mongoosejs.com/

================================================================================
`);

console.log('Для продолжения установите MongoDB и настройте подключение в файле .env'); 