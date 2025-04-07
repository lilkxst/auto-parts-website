const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Создаем директорию для загрузки файлов, если она не существует
const createUploadsDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Настройка хранилища для multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = path.join(__dirname, '../../uploads');
    
    // Определяем тип загружаемого файла
    const fileType = req.query.type || 'misc';
    
    // Создаем отдельную директорию в зависимости от типа файла
    switch (fileType) {
      case 'product':
        uploadPath = path.join(uploadPath, 'products');
        break;
      case 'review':
        uploadPath = path.join(uploadPath, 'reviews');
        break;
      case 'avatar':
        uploadPath = path.join(uploadPath, 'avatars');
        break;
      case 'logo':
        uploadPath = path.join(uploadPath, 'site');
        break;
      default:
        uploadPath = path.join(uploadPath, 'misc');
    }
    
    // Создаем директорию, если она не существует
    createUploadsDir(uploadPath);
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Генерируем уникальное имя файла
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// Фильтр файлов - разрешаем только изображения
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Разрешены только файлы изображений (jpeg, jpg, png, webp, gif)'), false);
  }
};

// Настройка multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB макс размер файла
  }
});

// Middleware для обработки ошибок загрузки
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Файл слишком большой. Максимальный размер 5MB.'
      });
    }
    return res.status(400).json({
      success: false,
      message: `Ошибка загрузки: ${err.message}`
    });
  }
  
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  next();
};

module.exports = {
  upload,
  handleUploadError
}; 