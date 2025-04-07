/**
 * Обработчик ошибок валидации данных
 */
exports.handleValidationErrors = (err, req, res, next) => {
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(error => error.message);
    return res.status(400).json({
      success: false,
      message: 'Ошибка валидации',
      errors
    });
  }
  
  next(err);
};

/**
 * Обработчик ошибок дублирования уникальных полей
 */
exports.handleDuplicateKeyError = (err, req, res, next) => {
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    
    return res.status(409).json({
      success: false,
      message: `${field} '${value}' уже используется`
    });
  }
  
  next(err);
};

/**
 * Обработчик ошибок кастомизации типов данных MongoDB
 */
exports.handleCastError = (err, req, res, next) => {
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Невалидный ${err.path}: ${err.value}`
    });
  }
  
  next(err);
};

/**
 * Глобальный обработчик ошибок
 */
exports.globalErrorHandler = (err, req, res, next) => {
  console.error('Ошибка:', err);
  
  // Определяем статус и сообщение по умолчанию
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Внутренняя ошибка сервера';
  
  // В продакшене не отправляем детали ошибки клиенту
  const error = process.env.NODE_ENV === 'production' 
    ? undefined 
    : {
        stack: err.stack,
        ...err
      };
  
  res.status(statusCode).json({
    success: false,
    message,
    error
  });
}; 