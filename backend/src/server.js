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

// Если в демо-режиме, добавляем обработчики для всех API запросов
if (global.useDemoMode) {
  app.use((req, res, next) => {
    const isDemoMode = global.useDemoMode;
    if (!isDemoMode) return next();

    // Глобально логируем все запросы в демо-режиме
    console.log(`[ДЕМО] ${req.method} ${req.url}`);

    // Пропускаем запросы к публичным ресурсам или серверным маршрутам
    if (
      req.url.startsWith('/api/auth') || 
      req.url.startsWith('/api/health-check') ||
      !req.url.startsWith('/api/')
    ) {
      return next();
    }

    // В демо-режиме открываем полный доступ к CORS
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Access-Token');
    
    // Обрабатываем OPTIONS запросы для preflight
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    // Обрабатываем DELETE, PUT, PATCH запросы
    if (['DELETE', 'PUT', 'PATCH'].includes(req.method)) {
      res.json({
        success: true,
        message: 'Операция выполнена успешно (демо-режим)',
        data: {id: req.params.id || '123456789012'}
      });
      return;
    }
    
    // Обрабатываем POST запросы
    if (req.method === 'POST') {
      console.log('[ДЕМО] POST запрос:', req.url, req.body);
      // Создаем объект с полями из req.body
      const createdObject = {
        ...req.body,
        _id: `demo_${Date.now()}`,
        createdAt: new Date().toISOString()
      };
      
      // Добавляем специфичные поля для разных типов объектов
      if (req.url.includes('/products')) {
        createdObject.mainImage = createdObject.mainImage || '/images/products/default.jpg';
        createdObject.active = true;
        createdObject.featured = createdObject.featured || false;
        
        // В демо-режиме возвращаем созданный объект с полным набором полей
        console.log('[ДЕМО] Создан новый продукт:', createdObject);
      }
      
      if (req.url.includes('/reviews')) {
        createdObject.status = 'pending';
        console.log('[ДЕМО] Создан новый отзыв:', createdObject);
      }
      
      res.json({
        success: true,
        message: 'Объект создан успешно (демо-режим)',
        data: createdObject
      });
      return;
    }
    
    // Обрабатываем GET запросы
    if (req.method === 'GET') {
      // Проверяем, запрашивается ли конкретный объект по ID
      const urlParts = req.url.split('/');
      const isGetById = urlParts.length > 3 && urlParts[3].length > 0 && !urlParts[3].includes('?');
      
      if (isGetById) {
        // Возвращаем демо-объект для запроса по ID
        const id = urlParts[3];
        let demoObject = {
          _id: id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // Для разных типов запросов формируем разные объекты
        if (req.url.includes('/products/')) {
          demoObject = {
            ...demoObject,
            name: 'Демо продукт',
            sku: `SKU-${id.substring(0, 6)}`,
            category: 'Категория',
            brand: 'Бренд',
            description: 'Описание демо продукта',
            price: 99.99,
            stock: 10,
            mainImage: '/images/products/default.jpg',
            specifications: [
              { key: 'Вес', value: '1.5 кг' },
              { key: 'Размер', value: '30x20x10 см' }
            ]
          };
        } else if (req.url.includes('/reviews/')) {
          demoObject = {
            ...demoObject,
            product: { _id: 'demo_product1', name: 'Демо продукт' },
            author: 'Иван Петров',
            rating: 4,
            text: 'Это демонстрационный отзыв.',
            status: 'pending'
          };
        } else if (req.url.includes('/orders/')) {
          demoObject = {
            ...demoObject,
            customer: { firstName: 'Иван', lastName: 'Петров', email: 'ivan@example.com' },
            status: 'pending',
            totalAmount: 199.98,
            items: [
              { product: { name: 'Демо продукт 1' }, quantity: 2, price: 99.99 }
            ]
          };
        }
        
        res.json(demoObject);
        return;
      } else {
        // Возвращаем список объектов
        let demoList = [];
        
        // Для разных типов запросов формируем разные списки
        if (req.url.includes('/products')) {
          demoList = Array(10).fill().map((_, i) => ({
            _id: `demo_product${i+1}`,
            name: `Демо продукт ${i+1}`,
            sku: `SKU-${1000+i}`,
            category: i % 2 === 0 ? 'Запчасти двигателя' : 'Тормозная система',
            brand: i % 3 === 0 ? 'Toyota' : i % 3 === 1 ? 'Nissan' : 'Honda',
            description: `Описание демо продукта ${i+1}`,
            price: 50 + i * 10,
            stock: 5 + i,
            mainImage: '/images/products/default.jpg',
            createdAt: new Date().toISOString()
          }));
        } else if (req.url.includes('/reviews')) {
          demoList = Array(5).fill().map((_, i) => ({
            _id: `demo_review${i+1}`,
            product: { _id: `demo_product${i+1}`, name: `Демо продукт ${i+1}` },
            author: `Пользователь ${i+1}`,
            rating: Math.floor(Math.random() * 5) + 1,
            text: `Это демонстрационный отзыв №${i+1}.`,
            status: i % 3 === 0 ? 'pending' : i % 3 === 1 ? 'approved' : 'rejected',
            createdAt: new Date().toISOString()
          }));
        } else if (req.url.includes('/orders')) {
          demoList = Array(3).fill().map((_, i) => ({
            _id: `demo_order${i+1}`,
            customer: { 
              firstName: `Имя${i+1}`, 
              lastName: `Фамилия${i+1}`, 
              email: `user${i+1}@example.com` 
            },
            status: i % 2 === 0 ? 'pending' : 'completed',
            totalAmount: 100 + i * 50,
            items: [
              { product: { name: `Демо продукт ${i*2+1}` }, quantity: 1, price: 50 + i * 25 },
              { product: { name: `Демо продукт ${i*2+2}` }, quantity: 1, price: 50 + i * 25 }
            ],
            createdAt: new Date().toISOString()
          }));
        }
        
        res.json({
          success: true,
          data: demoList,
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalItems: demoList.length
          }
        });
        return;
      }
    }
    
    // Для всех остальных случаев, просто пропускаем запрос дальше
    next();
  });
}

// API маршруты
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/settings', settingsRoutes);

// Специальная обработка демо-авторизации
app.post('/api/auth/login', (req, res, next) => {
  if (global.useDemoMode) {
    const { username, password } = req.body;
    console.log('[ДЕМО] Попытка входа:', username);
    
    // Проверяем демо-учетные данные
    if (username === 'admin' && password === 'admin123') {
      console.log('[ДЕМО] Успешный вход в демо-режиме');
      return res.json({
        success: true,
        token: 'demo_jwt_token_' + Date.now(),
        user: {
          _id: 'demo_admin',
          username: 'admin',
          firstName: 'Демо',
          lastName: 'Администратор',
          role: 'admin'
        },
        message: 'Вход выполнен успешно (демо-режим)'
      });
    } else {
      console.log('[ДЕМО] Неверные учетные данные:', username);
      return res.status(401).json({
        success: false,
        message: 'Неверное имя пользователя или пароль (Демо: admin/admin123)'
      });
    }
  }
  
  // Если не демо-режим или другие маршруты, передаем управление дальше
  next();
});

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