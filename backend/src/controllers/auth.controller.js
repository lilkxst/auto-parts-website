const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { validationResult } = require('express-validator');

/**
 * @desc    Регистрация нового пользователя
 * @route   POST /api/auth/register
 * @access  Private (admin only)
 */
exports.registerUser = async (req, res) => {
  try {
    // Проверяем ошибки валидации
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { username, email, password, firstName, lastName, role } = req.body;

    // Проверяем, не существует ли уже пользователь с таким email или username
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: existingUser.email === email 
          ? 'Пользователь с таким email уже существует' 
          : 'Имя пользователя уже занято'
      });
    }

    // Создаем нового пользователя
    const user = new User({
      username,
      email,
      password,
      firstName,
      lastName,
      role: role || 'employee'
    });

    await user.save();

    // Возвращаем данные о созданном пользователе без пароля
    res.status(201).json({
      success: true,
      message: 'Пользователь успешно зарегистрирован',
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Ошибка регистрации пользователя:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при регистрации',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Авторизация пользователя
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.loginUser = async (req, res) => {
  try {
    // Проверка демо-режима
    if (global.useDemoMode) {
      const { username, password } = req.body;
      
      // Проверяем демо-пользователя
      if (username === 'admin' && password === 'admin123') {
        // Возвращаем демо-токен
        return res.status(200).json({
          success: true,
          message: 'Авторизация успешна (Демо-режим)',
          token: 'demo_token_' + Date.now(),
          data: {
            _id: 'demo_user_id',
            username: 'admin',
            email: 'admin@example.com',
            firstName: 'Admin',
            lastName: 'User',
            role: 'admin',
            lastLogin: new Date()
          }
        });
      } else {
        return res.status(401).json({
          success: false,
          message: 'Неверное имя пользователя или пароль (Демо: admin/admin123)'
        });
      }
    }
    
    // Стандартная обработка для реального режима
    // Проверяем ошибки валидации
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { username, password } = req.body;

    // Находим пользователя по username и включаем поле password
    const user = await User.findOne({ username }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Неверное имя пользователя или пароль'
      });
    }

    // Проверяем, активен ли пользователь
    if (!user.active) {
      return res.status(401).json({
        success: false,
        message: 'Аккаунт деактивирован. Обратитесь к администратору.'
      });
    }

    // Проверяем пароль
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Неверное имя пользователя или пароль'
      });
    }

    // Обновляем дату последнего входа
    user.lastLogin = new Date();
    await user.save();

    // Создаем JWT токен
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(200).json({
      success: true,
      message: 'Авторизация успешна',
      token,
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Ошибка авторизации:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при авторизации',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Получение данных текущего пользователя
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Ошибка получения данных пользователя:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при получении данных',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Обновление данных пользователя
 * @route   PUT /api/auth/me
 * @access  Private
 */
exports.updateMe = async (req, res) => {
  try {
    // Проверяем ошибки валидации
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { firstName, lastName, email } = req.body;
    
    // Находим и обновляем пользователя
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { firstName, lastName, email },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Данные пользователя обновлены',
      data: {
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        role: updatedUser.role
      }
    });
  } catch (error) {
    console.error('Ошибка обновления данных пользователя:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при обновлении данных',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Смена пароля
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
exports.changePassword = async (req, res) => {
  try {
    // Проверяем ошибки валидации
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Находим пользователя и включаем поле password
    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }

    // Проверяем текущий пароль
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Текущий пароль неверен'
      });
    }

    // Обновляем пароль
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Пароль успешно изменен'
    });
  } catch (error) {
    console.error('Ошибка смены пароля:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при смене пароля',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}; 