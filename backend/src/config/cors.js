/**
 * Конфигурация CORS для интеграции с фронтендом
 */
const corsOptions = {
  // Принимаем запросы со всех доменов в демо-режиме
  origin: function(origin, callback) {
    // Разрешить запросы без origin (например, мобильные приложения, curl и т.д.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5000',
      'http://localhost',
      'http://127.0.0.1',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5000',
      'http://127.0.0.1:5500',
      'http://localhost:5500'
    ];
    
    // В демо-режиме пропускаем любой origin
    if (global.useDemoMode) {
      console.log("[CORS] Разрешен запрос в демо-режиме от:", origin || "unknown");
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      console.warn("[CORS] Запрос отклонен от:", origin);
      callback(new Error('Запрещено CORS политикой'));
    }
  },
  // Разрешаем указанные методы
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
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
  ],
  exposedHeaders: ['Content-Disposition'],
  optionsSuccessStatus: 200, // некоторые устаревшие браузеры (IE11) зависают на 204
  preflightContinue: false   // завершаем preflight request здесь, чтобы избежать двойной обработки
};

module.exports = corsOptions; 