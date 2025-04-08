const mongoose = require('mongoose');

/**
 * Connect to MongoDB with improved settings
 */
const connectDB = async () => {
  try {
    // Настройки подключения
    const options = {
      serverSelectionTimeoutMS: 10000, // Увеличиваем тайм-аут до 10 секунд
      socketTimeoutMS: 45000, // Close sockets после 45 секунд неактивности
      family: 4, // Используем IPv4, избегаем проблем с IPv6
      autoIndex: true, // Автоматически создаем индексы
      retryWrites: true // Повторять операции записи при ошибках
    };

    // Пробуем подключиться с таймаутом
    console.log(`Connecting to MongoDB: ${process.env.MONGODB_URI}`);
    const conn = await mongoose.connect(process.env.MONGODB_URI, options);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Устанавливаем обработчики ошибок подключения
    mongoose.connection.on('error', err => {
      console.error(`MongoDB connection error: ${err.message}`);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected - trying to reconnect...');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });
    
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    // Вместо завершения процесса, возвращаем null и продолжаем работу
    console.warn('Server will continue without MongoDB. Data operations will be simulated.');
    return null;
  }
};

module.exports = connectDB; 