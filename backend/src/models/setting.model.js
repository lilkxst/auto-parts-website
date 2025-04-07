const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  group: {
    type: String,
    enum: ['general', 'store', 'payment', 'delivery', 'email', 'appearance'],
    default: 'general'
  },
  description: {
    type: String,
    trim: true
  },
  isPublic: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Индекс для быстрого доступа по ключу
settingSchema.index({ key: 1 });
settingSchema.index({ group: 1 });

// Статические методы для быстрого доступа к настройкам
settingSchema.statics.getSetting = async function(key) {
  const setting = await this.findOne({ key });
  return setting ? setting.value : null;
};

settingSchema.statics.setSetting = async function(key, value, group = 'general', description = '', isPublic = false) {
  return await this.findOneAndUpdate(
    { key },
    { key, value, group, description, isPublic },
    { upsert: true, new: true }
  );
};

settingSchema.statics.getSettingsByGroup = async function(group) {
  return await this.find({ group });
};

settingSchema.statics.getPublicSettings = async function() {
  return await this.find({ isPublic: true });
};

// Инициализация настроек по умолчанию
settingSchema.statics.initializeDefaultSettings = async function() {
  const defaults = [
    {
      key: 'site_name',
      value: 'Интернет-магазин автозапчастей',
      group: 'general',
      description: 'Название сайта',
      isPublic: true
    },
    {
      key: 'site_description',
      value: 'Магазин автомобильных запчастей и аксессуаров',
      group: 'general',
      description: 'Описание сайта',
      isPublic: true
    },
    {
      key: 'contact_email',
      value: 'info@auto-parts.com',
      group: 'store',
      description: 'Контактный email магазина',
      isPublic: true
    },
    {
      key: 'contact_phone',
      value: '+7 (123) 456-78-90',
      group: 'store',
      description: 'Контактный телефон магазина',
      isPublic: true
    },
    {
      key: 'store_address',
      value: 'г. Москва, ул. Примерная, д. 123',
      group: 'store',
      description: 'Адрес магазина',
      isPublic: true
    },
    {
      key: 'currency',
      value: 'руб.',
      group: 'store',
      description: 'Валюта магазина',
      isPublic: true
    },
    {
      key: 'working_hours',
      value: 'Пн-Пт: 9:00-18:00, Сб: 10:00-16:00, Вс: выходной',
      group: 'store',
      description: 'Часы работы магазина',
      isPublic: true
    },
    {
      key: 'payment_methods',
      value: ['Наличные', 'Банковская карта', 'Онлайн-оплата'],
      group: 'payment',
      description: 'Доступные способы оплаты',
      isPublic: true
    },
    {
      key: 'delivery_methods',
      value: ['Самовывоз', 'Курьер', 'Почта'],
      group: 'delivery',
      description: 'Доступные способы доставки',
      isPublic: true
    },
    {
      key: 'email_notifications',
      value: {
        new_order: true,
        order_status_change: true,
        new_review: true
      },
      group: 'email',
      description: 'Настройки email-уведомлений',
      isPublic: false
    }
  ];

  for (const setting of defaults) {
    await this.setSetting(
      setting.key,
      setting.value,
      setting.group,
      setting.description,
      setting.isPublic
    );
  }
};

const Setting = mongoose.model('Setting', settingSchema);

module.exports = Setting; 