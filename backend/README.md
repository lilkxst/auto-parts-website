# Бэкенд Интернет-магазина Автозапчастей

API-сервер для интернет-магазина автозапчастей, построенный на Node.js, Express и MongoDB.
 GitHub Pages: https://triganus.github.io/auto-parts-website/

## Технологии

- **Node.js & Express**: Серверный фреймворк
- **MongoDB & Mongoose**: База данных и ODM
- **JWT**: Аутентификация и авторизация
- **bcryptjs**: Хеширование паролей
- **express-validator**: Валидация данных
- **Multer**: Загрузка файлов
- **CORS**: Для безопасных межсайтовых запросов

## Требования

- Node.js 14+ 
- MongoDB 4.4+

## Установка

### 1. Клонирование репозитория

```bash
git clone <repository-url>
cd auto-parts-website/backend
```

### 2. Установка зависимостей

```bash
npm install
```

### 3. Настройка переменных окружения

Создайте файл `.env` в корне проекта и добавьте следующие переменные:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/auto_parts_db
JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### 4. Запуск MongoDB

Если у вас еще не установлен MongoDB, вы можете:
- Установить локально: [MongoDB Installation Guide](https://docs.mongodb.com/manual/installation/)
- Использовать MongoDB Atlas: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

### 5. Инициализация базы данных

```bash
npm run seed
```

Эта команда создаст:
- Пользователя-администратора (логин: `admin`, пароль: `admin123`)
- Демо-товары
- Базовые настройки магазина

## Запуск

### Для разработки

```bash
npm run dev
```

Сервер будет запущен на http://localhost:5000 с активным режимом наблюдения за изменениями файлов.

### Для продакшена

```bash
npm start
```

## API Endpoints

### Аутентификация

- `POST /api/auth/login` - Вход в систему
- `POST /api/auth/register` - Регистрация нового пользователя (только для админов)
- `GET /api/auth/me` - Получение данных текущего пользователя
- `PUT /api/auth/me` - Обновление данных пользователя
- `PUT /api/auth/change-password` - Смена пароля

### Товары

- `GET /api/products` - Получение всех товаров с фильтрацией и пагинацией
- `GET /api/products/:id` - Получение товара по ID
- `POST /api/products` - Создание нового товара
- `PUT /api/products/:id` - Обновление товара
- `DELETE /api/products/:id` - Удаление товара
- `POST /api/products/:id/upload` - Загрузка изображения товара
- `PUT /api/products/:id/main-image` - Установка главного изображения
- `GET /api/products/brands` - Получение списка брендов

### Заказы

- `GET /api/orders` - Получение всех заказов
- `GET /api/orders/:id` - Получение заказа по ID
- `POST /api/orders` - Создание нового заказа
- `PUT /api/orders/:id` - Обновление заказа
- `PUT /api/orders/:id/status` - Изменение статуса заказа

### Клиенты

- `GET /api/customers` - Получение всех клиентов
- `GET /api/customers/:id` - Получение клиента по ID
- `POST /api/customers` - Создание нового клиента
- `PUT /api/customers/:id` - Обновление клиента
- `DELETE /api/customers/:id` - Удаление клиента

### Отзывы

- `GET /api/reviews` - Получение всех отзывов
- `GET /api/reviews/:id` - Получение отзыва по ID
- `POST /api/reviews` - Создание нового отзыва
- `PUT /api/reviews/:id` - Обновление отзыва
- `PUT /api/reviews/:id/status` - Изменение статуса отзыва (одобрен/отклонен)
- `DELETE /api/reviews/:id` - Удаление отзыва

### Настройки

- `GET /api/settings` - Получение всех настроек
- `GET /api/settings/public` - Получение публичных настроек
- `GET /api/settings/:key` - Получение значения настройки по ключу
- `PUT /api/settings/:key` - Обновление настройки

## Роли и разрешения

В системе предусмотрены следующие роли:

- **Администратор (admin)**: Полный доступ ко всем функциям
- **Менеджер (manager)**: Может управлять товарами, заказами, клиентами и отзывами
- **Сотрудник (employee)**: Может просматривать и обрабатывать заказы

## Структура проекта

```
backend/
├── src/
│   ├── config/     - Конфигурация приложения
│   ├── controllers/ - Контроллеры API
│   ├── middleware/ - Middleware функции
│   ├── models/     - Mongoose модели
│   ├── routes/     - API маршруты
│   ├── utils/      - Вспомогательные функции
│   └── server.js   - Точка входа в приложение
├── uploads/        - Директория для загружаемых файлов
├── .env            - Переменные окружения
├── package.json
└── README.md
```

## Лицензия

MIT 