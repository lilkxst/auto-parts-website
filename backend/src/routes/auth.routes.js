const express = require('express');
const { check } = require('express-validator');
const authController = require('../controllers/auth.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// Маршрут для регистрации пользователя (только для админов)
router.post(
  '/register',
  [
    authenticate,
    authorize('admin'),
    check('username', 'Имя пользователя обязательно').notEmpty(),
    check('username', 'Имя пользователя должно содержать минимум 3 символа').isLength({ min: 3 }),
    check('email', 'Пожалуйста, укажите корректный email').isEmail(),
    check('password', 'Пароль должен содержать минимум 6 символов').isLength({ min: 6 }),
    check('role', 'Роль должна быть admin, manager или employee').optional().isIn(['admin', 'manager', 'employee'])
  ],
  authController.registerUser
);

// Маршрут для входа в систему
router.post(
  '/login',
  [
    check('username', 'Имя пользователя обязательно').notEmpty(),
    check('password', 'Пароль обязателен').notEmpty()
  ],
  authController.loginUser
);

// Маршрут для проверки токена (поддержка демо-режима)
router.get('/verify', (req, res) => {
  // Для демо-режима всегда возвращает успех
  if (global.useDemoMode) {
    return res.json({ 
      success: true, 
      message: 'Token is valid (Demo Mode)',
      user: {
        id: 'demo_user_id',
        username: 'admin',
        role: 'admin'
      }
    });
  }
  
  // В реальном режиме используем контроллер аутентификации
  authenticate(req, res, () => {
    res.json({ 
      success: true, 
      message: 'Token is valid',
      user: req.user
    });
  });
});

// Маршрут для получения данных текущего пользователя
router.get('/me', authenticate, authController.getMe);

// Маршрут для обновления данных пользователя
router.put(
  '/me',
  [
    authenticate,
    check('email', 'Пожалуйста, укажите корректный email').optional().isEmail(),
    check('firstName', 'Имя не может превышать 50 символов').optional().isLength({ max: 50 }),
    check('lastName', 'Фамилия не может превышать 50 символов').optional().isLength({ max: 50 })
  ],
  authController.updateMe
);

// Маршрут для смены пароля
router.put(
  '/change-password',
  [
    authenticate,
    check('currentPassword', 'Текущий пароль обязателен').notEmpty(),
    check('newPassword', 'Новый пароль должен содержать минимум 6 символов').isLength({ min: 6 })
  ],
  authController.changePassword
);

module.exports = router; 