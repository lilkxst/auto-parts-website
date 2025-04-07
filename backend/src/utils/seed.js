const mongoose = require('mongoose');
const User = require('../models/user.model');
const Product = require('../models/product.model');
const Setting = require('../models/setting.model');
const dotenv = require('dotenv');

// Загружаем переменные окружения
dotenv.config();

// Подключаемся к MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB подключен для сидирования'))
  .catch(err => {
    console.error('Ошибка подключения к MongoDB:', err);
    process.exit(1);
  });

// Создаем администратора по умолчанию
const createDefaultAdmin = async () => {
  try {
    // Проверяем, существует ли уже администратор
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (adminExists) {
      console.log('Администратор уже существует, пропускаем создание');
      return;
    }
    
    // Создаем нового администратора
    const admin = new User({
      username: 'admin',
      email: 'admin@auto-parts.com',
      password: 'admin123',
      firstName: 'Администратор',
      lastName: 'Системы',
      role: 'admin'
    });
    
    await admin.save();
    console.log('Администратор по умолчанию создан успешно');
  } catch (error) {
    console.error('Ошибка создания администратора:', error);
  }
};

// Создаем демо-товары
const createDemoProducts = async () => {
  try {
    // Проверяем, существуют ли уже товары
    const productsCount = await Product.countDocuments();
    
    if (productsCount > 0) {
      console.log('Товары уже существуют, пропускаем создание');
      return;
    }
    
    // Массив демо-товаров
    const demoProducts = [
      {
        name: 'Continental ContiPremiumContact 5 205/55 R16 91V',
        sku: 'TIR-CON-205-55-16',
        category: 'Шины',
        brand: 'Continental',
        description: 'Летняя шина Continental ContiPremiumContact 5 обеспечивает комфортное и безопасное вождение.',
        price: 5800,
        stock: 15,
        specifications: {
          'Сезонность': 'Летняя',
          'Размер': '205/55 R16',
          'Индекс скорости': 'V (до 240 км/ч)',
          'Индекс нагрузки': '91 (615 кг)'
        },
        featured: true
      },
      {
        name: 'Michelin X-Ice XI3 195/65 R15 95T',
        sku: 'TIR-MIC-195-65-15',
        category: 'Шины',
        brand: 'Michelin',
        description: 'Зимняя шина Michelin X-Ice XI3 обеспечивает отличное сцепление на снегу и льду.',
        price: 6200,
        stock: 8,
        specifications: {
          'Сезонность': 'Зимняя',
          'Размер': '195/65 R15',
          'Индекс скорости': 'T (до 190 км/ч)',
          'Индекс нагрузки': '95 (690 кг)'
        },
        featured: true
      },
      {
        name: 'Castrol Edge 5W-30 LL, 4л',
        sku: 'OIL-CAS-5W30-4L',
        category: 'Масла',
        brand: 'Castrol',
        description: 'Полностью синтетическое моторное масло Castrol EDGE с технологией Titanium FST™.',
        price: 3200,
        stock: 25,
        specifications: {
          'Тип': 'Синтетическое',
          'Вязкость': '5W-30',
          'Объем': '4 литра',
          'Стандарты': 'ACEA C3; API SN, API CF; BMW Longlife-04; MB-Approval 229.31/ 229.51'
        },
        featured: true
      },
      {
        name: 'MANN-FILTER W 610/3',
        sku: 'FIL-MANN-W610-3',
        category: 'Фильтры',
        brand: 'MANN-FILTER',
        description: 'Масляный фильтр высокого качества для большинства современных автомобилей.',
        price: 450,
        stock: 40,
        specifications: {
          'Тип': 'Масляный',
          'Высота': '79 мм',
          'Внешний диаметр': '66 мм',
          'Внутренний диаметр': '57 мм'
        },
        featured: false
      },
      {
        name: 'Brembo P85075',
        sku: 'BRK-BRE-P85075',
        category: 'Тормоза',
        brand: 'Brembo',
        description: 'Комплект тормозных колодок Brembo для переднего тормоза популярных моделей автомобилей.',
        price: 2800,
        stock: 12,
        specifications: {
          'Тип': 'Передние',
          'Высота': '65 мм',
          'Ширина': '131 мм',
          'Толщина': '19 мм'
        },
        featured: false
      },
      {
        name: 'Bosch S4 Silver 60 А·ч 540 А',
        sku: 'BAT-BOS-S4-60',
        category: 'Аккумуляторы',
        brand: 'Bosch',
        description: 'Аккумуляторная батарея Bosch S4 Silver с увеличенным сроком службы.',
        price: 7500,
        stock: 7,
        specifications: {
          'Емкость': '60 А·ч',
          'Пусковой ток': '540 А',
          'Полярность': 'Прямая',
          'Размеры (ДxШxВ)': '242x175x190 мм'
        },
        featured: true
      }
    ];
    
    // Создаем товары в базе данных
    await Product.insertMany(demoProducts);
    console.log(`Создано ${demoProducts.length} демо-товаров`);
  } catch (error) {
    console.error('Ошибка создания демо-товаров:', error);
  }
};

// Инициализируем настройки магазина
const initializeSettings = async () => {
  try {
    // Проверяем, существуют ли уже настройки
    const settingsCount = await Setting.countDocuments();
    
    if (settingsCount > 0) {
      console.log('Настройки уже существуют, пропускаем инициализацию');
      return;
    }
    
    // Инициализируем настройки по умолчанию
    await Setting.initializeDefaultSettings();
    console.log('Настройки магазина инициализированы успешно');
  } catch (error) {
    console.error('Ошибка инициализации настроек:', error);
  }
};

// Запускаем процесс сидирования
const seed = async () => {
  try {
    await createDefaultAdmin();
    await createDemoProducts();
    await initializeSettings();
    
    console.log('Сидирование базы данных завершено успешно');
    process.exit(0);
  } catch (error) {
    console.error('Ошибка при сидировании базы данных:', error);
    process.exit(1);
  }
};

// Запускаем сидирование
seed(); 