const nodemailer = require('nodemailer');
require('dotenv').config();

// Детальный вывод состояния отправки
console.log('Email configuration:', {
  user: process.env.EMAIL_USER || 'not_defined',
  demoMode: global.useDemoMode,
  env: process.env.NODE_ENV
});

// Создание транспорта для отправки почты
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  // Дополнительные параметры для повышения успешности отправки
  tls: {
    rejectUnauthorized: false
  }
});

// Проверка настроек email
transporter.verify()
  .then(() => {
    console.log('✅ SMTP server connection successful');
  })
  .catch(error => {
    console.error('❌ SMTP server connection error:', error);
  });

/**
 * Отправляет email с информацией о заказе
 * @param {Object} order - Объект заказа
 * @returns {Promise} - Промис с результатом отправки
 */
const sendOrderConfirmation = async (order) => {
  // Если в демо-режиме, то просто логируем действие без реальной отправки
  if (global.useDemoMode) {
    console.log('DEMO MODE: Email would be sent with order details:', order.orderDate);
    return { success: true, demo: true };
  }
  
  console.log('Attempting to send real email for order...');
  console.log('Order data:', JSON.stringify(order, null, 2));
  
  try {
    // Проверка, что транспортер создан
    if (!transporter) {
      console.error('Email transporter is not initialized');
      return { success: false, error: 'Email transporter not initialized' };
    }
    
    // Проверка данных заказа
    if (!order || !order.customer || !order.orderDetails) {
      console.error('Invalid order data format:', order);
      return { success: false, error: 'Invalid order data format' };
    }
    
    // Подготовка информации о товарах
    const itemsList = order.orderDetails.items.map(item => 
      `<tr>
        <td>${item.name}</td>
        <td>${item.quantity}</td>
        <td>${item.price.toFixed(2)} BYN</td>
        <td>${(item.price * item.quantity).toFixed(2)} BYN</td>
      </tr>`
    ).join('');

    // Расчет итоговой суммы
    const subtotal = order.orderDetails.subtotal;
    const shipping = order.orderDetails.shipping || 0;
    const discount = order.orderDetails.discount || 0;
    const total = subtotal + shipping - discount;

    // Формируем куда отправлять письмо: на адрес из настроек и копию клиенту
    const clientEmail = order.customer.email;
    const shopEmail = process.env.EMAIL_USER || 'selenurtrade@gmail.com';
    
    console.log('Preparing email with client address:', clientEmail);
    
    // Подготовка текста письма
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'АвтоЗапчасти <selenurtrade@gmail.com>',
      to: shopEmail,
      cc: clientEmail, // Отправляем копию клиенту
      subject: 'Новый заказ на сайте СеленЮр-Трейд',
      html: `
        <h2>Поступил новый заказ!</h2>
        
        <h3>Информация о клиенте:</h3>
        <p>
          <strong>Имя:</strong> ${order.customer.firstName} ${order.customer.lastName}<br>
          <strong>Email:</strong> ${order.customer.email}<br>
          <strong>Телефон:</strong> ${order.customer.phone}<br>
          <strong>Адрес:</strong> ${order.customer.city}, ${order.customer.address}, ${order.customer.apartment || ''} ${order.customer.zipCode || ''}<br>
        </p>
        
        <h3>Детали заказа:</h3>
        <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%;">
          <tr>
            <th>Товар</th>
            <th>Количество</th>
            <th>Цена за ед.</th>
            <th>Всего</th>
          </tr>
          ${itemsList}
        </table>
        
        <h3>Итого:</h3>
        <p>
          <strong>Сумма товаров:</strong> ${subtotal.toFixed(2)} BYN<br>
          <strong>Доставка:</strong> ${shipping.toFixed(2)} BYN<br>
          <strong>Скидка:</strong> ${discount.toFixed(2)} BYN<br>
          <strong>Итого к оплате:</strong> ${total.toFixed(2)} BYN<br>
        </p>
        
        <h3>Способ доставки:</h3>
        <p>${order.orderDetails.delivery === 'pickup' ? 'Самовывоз' : 'Доставка'}</p>
        
        <h3>Способ оплаты:</h3>
        <p>${order.orderDetails.payment === 'cash' ? 'Наличными' : 'Картой'}</p>
        
        <p><strong>Дата заказа:</strong> ${new Date(order.orderDate || new Date()).toLocaleString('ru-RU')}</p>
        
        ${order.orderDetails.comment ? `<h3>Комментарий к заказу:</h3><p>${order.orderDetails.comment}</p>` : ''}
      `,
      encoding: 'utf-8' // Явно указываем UTF-8 кодировку
    };

    // Отправка письма
    console.log('Sending email to:', mailOptions.to, 'CC:', mailOptions.cc);
    
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully:', info.messageId);
      
      // Убираем вызов getTestMessageUrl, который может вызывать ошибку
      return { success: true, messageId: info.messageId };
    } catch (emailError) {
      console.error('❌ Error sending email:', emailError);
      
      // В случае ошибки отправки, позволяем процессу заказа продолжиться
      // но возвращаем информацию об ошибке
      return { 
        success: false, 
        error: emailError.message,
        orderCreated: true // Заказ все равно должен создаться
      };
    }
  } catch (error) {
    console.error('❌ Error preparing email:', error);
    return { 
      success: false, 
      error: error.message,
      orderCreated: true // Продолжаем создание заказа
    };
  }
};

module.exports = {
  sendOrderConfirmation
}; 