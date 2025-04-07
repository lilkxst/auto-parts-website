const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

/**
 * Middleware для проверки JWT-токена
 */
exports.authenticate = async (req, res, next) => {
  try {
    // Получаем токен из заголовка
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Не авторизован. Отсутствует токен доступа.'
      });
    }
    
    // Извлекаем токен
    const token = authHeader.split(' ')[1];
    
    // Верифицируем токен
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Находим пользователя
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Не найден пользователь с данным токеном'
      });
    }
    
    if (!user.active) {
      return res.status(401).json({
        success: false,
        message: 'Пользователь деактивирован'
      });
    }
    
    // Добавляем пользователя к запросу
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Невалидный токен'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Токен просрочен'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Ошибка сервера при аутентификации',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Middleware для проверки прав доступа
 * @param {string[]} roles - Массив ролей, которым разрешен доступ
 */
exports.authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Не авторизован. Пожалуйста, войдите в систему.'
      });
    }
    
    // Конвертируем roles в массив, если передана одна роль как строка
    if (typeof roles === 'string') {
      roles = [roles];
    }
    
    // Проверяем, есть ли у пользователя нужная роль
    if (roles.length > 0 && !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'У вас нет прав для этого действия'
      });
    }
    
    next();
  };
}; 