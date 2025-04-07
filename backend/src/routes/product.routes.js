const express = require('express');
const { check } = require('express-validator');
const productController = require('../controllers/product.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { upload, handleUploadError } = require('../middleware/upload.middleware');

const router = express.Router();

// Публичные маршруты
// Получение всех товаров с фильтрацией и пагинацией
router.get('/', productController.getProducts);

// Получение товара по ID
router.get('/:id', productController.getProductById);

// Получение уникальных брендов
router.get('/brands', productController.getBrands);

// Защищенные маршруты (требуется авторизация)
// Создание нового товара
router.post(
  '/',
  [
    authenticate,
    authorize(['admin', 'manager']),
    check('name', 'Название товара обязательно').notEmpty(),
    check('name', 'Название товара не должно превышать 100 символов').isLength({ max: 100 }),
    check('sku', 'Артикул товара обязателен').notEmpty(),
    check('category', 'Выберите категорию из списка').isIn(['Шины', 'Масла', 'Фильтры', 'Тормоза', 'Аккумуляторы', 'Аксессуары', 'Электроника', 'Прочее']),
    check('brand', 'Бренд товара обязателен').notEmpty(),
    check('price', 'Укажите корректную цену товара').isFloat({ min: 0 }),
    check('stock', 'Количество на складе должно быть целым числом').isInt({ min: 0 })
  ],
  productController.createProduct
);

// Обновление товара
router.put(
  '/:id',
  [
    authenticate,
    authorize(['admin', 'manager']),
    check('name', 'Название товара не должно превышать 100 символов').optional().isLength({ max: 100 }),
    check('category', 'Выберите категорию из списка').optional().isIn(['Шины', 'Масла', 'Фильтры', 'Тормоза', 'Аккумуляторы', 'Аксессуары', 'Электроника', 'Прочее']),
    check('price', 'Укажите корректную цену товара').optional().isFloat({ min: 0 }),
    check('discountPrice', 'Цена со скидкой должна быть корректной').optional().isFloat({ min: 0 }),
    check('stock', 'Количество на складе должно быть целым числом').optional().isInt({ min: 0 })
  ],
  productController.updateProduct
);

// Удаление товара
router.delete(
  '/:id',
  [authenticate, authorize('admin')],
  productController.deleteProduct
);

// Загрузка изображения товара
router.post(
  '/:id/upload',
  [authenticate, authorize(['admin', 'manager']), upload.single('image')],
  handleUploadError,
  productController.uploadProductImage
);

// Установка главного изображения
router.put(
  '/:id/main-image',
  [
    authenticate,
    authorize(['admin', 'manager']),
    check('imageUrl', 'URL изображения обязателен').notEmpty()
  ],
  productController.setMainImage
);

module.exports = router; 