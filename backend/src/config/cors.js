/**
 * Конфигурация CORS для интеграции с фронтендом
 */
const corsOptions = {
  // Разрешаем запросы с основного домена и локальных адресов для разработки
  origin: [
    'http://localhost:3000',
    'http://localhost:5000',
    'http://localhost',
    'http://127.0.0.1',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5000'
  ],
  // Разрешаем указанные методы
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  // Разрешаем передачу кук и заголовков авторизации
  credentials: true,
  // Разрешаем указанные заголовки
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-Access-Token'
  ]
};

module.exports = corsOptions; 