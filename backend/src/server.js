const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Создаем директорию uploads, если её нет
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  console.log('Creating uploads directory...');
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Импортируем настройки и хелперы
const corsOptions = require('./config/cors');
const connectDB = require('./config/db');
const errorMiddleware = require('./middleware/error.middleware');

// Импортируем маршруты
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const orderRoutes = require('./routes/order.routes');
const customerRoutes = require('./routes/customer.routes');
const reviewRoutes = require('./routes/review.routes');
const settingsRoutes = require('./routes/settings.routes');

// Инициализируем приложение
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Добавляем статические файлы
app.use(express.static(path.join(__dirname, '../../')));

// Статические файлы
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Добавляем обработчики для демо-режима
app.use((req, res, next) => {
  if (global.useDemoMode) {
    console.log(`[DEMO MODE] Received request: ${req.method} ${req.originalUrl}`);

    // Если запрос к API
    if (req.originalUrl.startsWith('/api/')) {
      // Эти маршруты обрабатываются специально
      if (req.originalUrl.startsWith('/api/auth/') || 
          req.originalUrl === '/api/health-check' || 
          req.originalUrl === '/api') {
        return next();
      }

      // Для запросов GET
      if (req.method === 'GET') {
        // Если запрос имеет формат /api/xxx/:id
        const idMatch = req.originalUrl.match(/\/api\/[^\/]+\/([^\/\?]+)/);
        if (idMatch && idMatch[1]) {
          return res.json({
            success: true,
            data: {
              _id: idMatch[1],
              name: 'Демо объект',
              description: 'Это объект из демо-режима',
              createdAt: new Date().toISOString()
            }
          });
        }
        
        // Для списка объектов
        return res.json({
          success: true,
          data: [],
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalItems: 0
          }
        });
      }

      // Для запросов DELETE
      if (req.method === 'DELETE') {
        return res.json({ 
          success: true, 
          message: 'Объект успешно удален (демо-режим)'
        });
      }

      // Для запросов PUT или PATCH (обновление)
      if (req.method === 'PUT' || req.method === 'PATCH') {
        return res.json({ 
          success: true, 
          message: 'Объект успешно обновлен (демо-режим)',
          data: req.body
        });
      }

      // Для запросов POST (создание)
      if (req.method === 'POST') {
        return res.json({ 
          success: true, 
          message: 'Объект успешно создан (демо-режим)',
          data: {
            _id: 'demo_' + Date.now(),
            ...req.body,
            createdAt: new Date().toISOString()
          }
        });
      }
    }
  }

  next();
});

// API маршруты
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/settings', settingsRoutes);

// Главный маршрут для API
app.get('/api', (req, res) => {
  res.json({ 
    message: 'Добро пожаловать в API интернет-магазина автозапчастей',
    version: '1.0.0',
    status: 'online'
  });
});

// Эндпоинт для проверки работоспособности сервера
app.get('/api/health-check', (req, res) => {
  res.json({ status: 'ok' });
});

// Главный маршрут (перенаправляем на HTML-страницу)
app.get('/', (req, res) => {
  if (req.headers.accept && req.headers.accept.includes('application/json')) {
    return res.json({ 
      message: 'Добро пожаловать в API интернет-магазина автозапчастей',
      version: '1.0.0',
      status: 'online'
    });
  }
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Middleware для обработки ошибок
app.use(errorMiddleware.handleValidationErrors);
app.use(errorMiddleware.handleDuplicateKeyError);
app.use(errorMiddleware.handleCastError);
app.use(errorMiddleware.globalErrorHandler);

// Запускаем сервер
const startServer = async () => {
  try {
    // Принудительно включаем демо-режим, если указано в переменных окружения
    if (process.env.USE_DEMO_MODE === 'true') {
      console.warn('Forced DEMO MODE enabled via environment variable.');
      global.useDemoMode = true;
    } else {
      // Подключаемся к MongoDB
      const conn = await connectDB();
      
      if (conn) {
        console.log('MongoDB connection successful. Using real database.');
        global.useDemoMode = false;
      } else {
        console.warn('MongoDB connection failed. Using demo mode.');
        global.useDemoMode = true;
      }
    }
    
    // Запускаем сервер
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
      console.log(`Mode: ${global.useDemoMode ? 'DEMO' : 'PRODUCTION'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app; 