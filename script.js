// Плавная прокрутка для навигации
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Анимация появления элементов при прокрутке
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-in, .slide-in').forEach(element => {
    observer.observe(element);
});

// Анимация чисел в карточках достижений
function animateNumbers() {
    const numbers = document.querySelectorAll('.achievement-card .number');
    
    numbers.forEach(number => {
        const target = parseInt(number.textContent);
        let current = 0;
        const increment = target / 100;
        const duration = 2000; // 2 секунды
        const stepTime = duration / 100;
        
        const updateNumber = () => {
            current += increment;
            if (current < target) {
                number.textContent = Math.round(current);
                setTimeout(updateNumber, stepTime);
            } else {
                number.textContent = target;
            }
        };
        
        updateNumber();
    });
}

// Запуск анимации чисел при появлении секции
const achievementsSection = document.querySelector('.about-achievements');
if (achievementsSection) {
    const achievementsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateNumbers();
                achievementsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    achievementsObserver.observe(achievementsSection);
}

// Анимация кнопок при наведении и клике
document.querySelectorAll('button').forEach(button => {
    button.addEventListener('mouseenter', () => {
        button.style.transform = 'translateY(-2px)';
    });
    
    button.addEventListener('mouseleave', () => {
        button.style.transform = 'translateY(0)';
    });
    
    button.addEventListener('click', () => {
        button.classList.add('clicked');
        setTimeout(() => {
            button.classList.remove('clicked');
        }, 200);
    });
});

// Анимация форм при фокусе
document.querySelectorAll('.form-group input, .form-group textarea').forEach(input => {
    input.addEventListener('focus', () => {
        input.parentElement.classList.add('focused');
    });
    
    input.addEventListener('blur', () => {
        input.parentElement.classList.remove('focused');
    });
});

// Анимация поисковой строки
const searchBar = document.querySelector('.search-bar');
if (searchBar) {
    searchBar.addEventListener('focus', () => {
        searchBar.classList.add('focused');
    });
    
    searchBar.addEventListener('blur', () => {
        searchBar.classList.remove('focused');
    });
}

// Анимация карточек товаров при наведении
document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-5px)';
        card.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
        card.style.boxShadow = 'none';
    });
});

// Анимация социальных иконок
document.querySelectorAll('.social-links a').forEach(link => {
    link.addEventListener('mouseenter', () => {
        link.style.transform = 'translateY(-3px) scale(1.1)';
        link.style.color = '#007bff';
    });
    
    link.addEventListener('mouseleave', () => {
        link.style.transform = 'translateY(0) scale(1)';
        link.style.color = '';
    });
});

// Анимация логотипа
const logo = document.querySelector('.logo-img');
if (logo) {
    logo.addEventListener('mouseenter', () => {
        logo.style.transform = 'scale(1.05)';
    });
    
    logo.addEventListener('mouseleave', () => {
        logo.style.transform = 'scale(1)';
    });
}

// Анимация навигационных ссылок
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('mouseenter', () => {
        link.style.color = '#007bff';
    });
    
    link.addEventListener('mouseleave', () => {
        if (!link.classList.contains('active')) {
            link.style.color = '';
        }
    });
});

// Анимация иконок в карточках преимуществ
document.querySelectorAll('.advantage-card i, .contact-card i').forEach(icon => {
    icon.addEventListener('mouseenter', () => {
        icon.style.transform = 'scale(1.2)';
        icon.style.color = '#0056b3';
    });
    
    icon.addEventListener('mouseleave', () => {
        icon.style.transform = 'scale(1)';
        icon.style.color = '';
    });
});

// Функционал модальных окон
document.querySelectorAll('.category-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const category = link.getAttribute('data-category');
        const modal = document.getElementById(`${category}Modal`);
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
});

document.querySelectorAll('.modal-close').forEach(closeBtn => {
    closeBtn.addEventListener('click', () => {
        const modal = closeBtn.closest('.modal');
        modal.classList.remove('active');
        document.body.style.overflow = '';
    });
});

// Закрытие модального окна при клике вне его содержимого
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
});

// Функционал переключения темы
const themeSwitch = document.createElement('div');
themeSwitch.className = 'theme-switch';
themeSwitch.innerHTML = '<i class="fas fa-moon"></i>';
document.body.appendChild(themeSwitch);

// Проверяем сохраненную тему
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
    themeSwitch.innerHTML = '<i class="fas fa-sun"></i>';
}

// Переключение темы
themeSwitch.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    themeSwitch.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
});

// Функционал поиска товаров
const searchInput = document.querySelector('.search-bar input');
const productCards = document.querySelectorAll('.product-card');

if (searchInput) {
    // Проверяем, существует ли элемент для сообщения о ненайденных товарах
    let noResultsElement = document.querySelector('.no-results');
    
    // Если элемент не существует, создаем его
    if (!noResultsElement) {
        noResultsElement = document.createElement('div');
        noResultsElement.className = 'no-results';
        noResultsElement.innerHTML = '<p>Товары не найдены</p>';
        const productGrid = document.querySelector('.product-grid');
        if (productGrid) {
            productGrid.parentNode.insertBefore(noResultsElement, productGrid.nextSibling);
        }
    }
    
    // Функция для обновления отображения товаров
    const updateProductDisplay = () => {
        const searchTerm = searchInput.value.toLowerCase().trim();
        let hasVisibleCards = false;
        
        productCards.forEach(card => {
            const title = card.querySelector('h3').textContent.toLowerCase();
            const description = card.querySelector('p').textContent.toLowerCase();
            
            if (title.includes(searchTerm) || description.includes(searchTerm)) {
                card.style.display = 'block';
                hasVisibleCards = true;
            } else {
                card.style.display = 'none';
            }
        });
        
        // Показываем сообщение, если ничего не найдено
        if (hasVisibleCards) {
            noResultsElement.style.display = 'none';
        } else if (searchTerm !== '') {
            noResultsElement.style.display = 'block';
        } else {
            // Если поле поиска пустое, скрываем сообщение
            noResultsElement.style.display = 'none';
            // И показываем все карточки
            productCards.forEach(card => {
                card.style.display = 'block';
            });
        }
    };
    
    // Слушаем изменения в поле поиска
    searchInput.addEventListener('input', updateProductDisplay);
    
    // Добавляем кнопку очистки
    const searchButton = document.querySelector('.search-bar button');
    if (searchButton) {
        searchButton.addEventListener('click', function() {
            searchInput.value = '';
            updateProductDisplay();
        });
    }
}

// Обработка формы обратной связи
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Получаем данные формы
        const formData = new FormData(contactForm);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            message: formData.get('message')
        };

        // Здесь можно добавить отправку данных на сервер
        // Например, через fetch API:
        /*
        fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                showNotification('Сообщение успешно отправлено!', 'success');
                contactForm.reset();
            } else {
                showNotification('Произошла ошибка при отправке сообщения.', 'error');
            }
        })
        .catch(error => {
            showNotification('Произошла ошибка при отправке сообщения.', 'error');
        });
        */

        // Временное решение - показываем уведомление об успешной отправке
        showNotification('Сообщение успешно отправлено!', 'success');
        contactForm.reset();
    });
}

// Уведомления
function showNotification(message, type = 'info') {
  // Создаем элемент уведомления
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
      <span>${message}</span>
    </div>
    <button type="button" class="notification-close">
      <i class="fas fa-times"></i>
    </button>
  `;
  
  // Добавляем на страницу
  document.body.appendChild(notification);
  
  // Добавляем класс для анимации появления
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  // Удаляем через 3 секунды
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
  
  // Обработчик закрытия
  notification.querySelector('.notification-close').addEventListener('click', function() {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.remove();
    }, 300);
  });
}

// Добавляем обработчик для карточек популярных товаров
document.querySelectorAll('.featured-products .product-card').forEach(card => {
    card.addEventListener('click', () => {
        const category = card.getAttribute('data-category');
        // Сохраняем категорию в localStorage
        localStorage.setItem('selectedCategory', category);
        // Переходим на страницу каталога
        window.location.href = 'catalog.html';
    });

    // Добавляем стиль курсора, чтобы показать что карточка кликабельна
    card.style.cursor = 'pointer';
});

// Проверяем при загрузке страницы каталога, есть ли выбранная категория
document.addEventListener('DOMContentLoaded', () => {
    const selectedCategory = localStorage.getItem('selectedCategory');
    if (selectedCategory && window.location.pathname.includes('catalog.html')) {
        // Находим соответствующую категорию и открываем её
        const categoryLink = document.querySelector(`.category-link[data-category="${selectedCategory}"]`);
        if (categoryLink) {
            categoryLink.click();
        }
        // Очищаем сохраненную категорию
        localStorage.removeItem('selectedCategory');
    }
});

// Корзина покупок
document.addEventListener('DOMContentLoaded', function() {
  // Инициализация корзины
  initCart();
  
  // Функция для добавления обработчиков на кнопки "Добавить в корзину"
  function addCartButtonHandlers() {
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    
    // Сначала удаляем существующие обработчики, чтобы избежать дублирования
    addToCartButtons.forEach(button => {
      // Клонируем кнопку, чтобы удалить все обработчики событий
      const newButton = button.cloneNode(true);
      button.parentNode.replaceChild(newButton, button);
    });
    
    // Теперь добавляем новые обработчики
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
      button.addEventListener('click', function(e) {
        // Предотвращаем всплытие события, чтобы не срабатывал клик по карточке товара
        e.stopPropagation();
        
        const productCard = this.closest('.product-card');
        // Генерируем уникальный ID, если его нет
        const productId = productCard.getAttribute('data-id') || `product_${Date.now()}`;
        const productName = productCard.querySelector('h3').textContent;
        // Извлекаем цену, убираем "BYN" и пробелы
        const priceText = productCard.querySelector('.product-price').textContent;
        const productPrice = parseFloat(priceText.replace(/[^\d.]/g, ''));
        const productImage = productCard.querySelector('img').getAttribute('src');
        const productCategory = productCard.getAttribute('data-category') || 'unknown';
        
        addToCart({
          id: productId,
          name: productName,
          price: productPrice,
          image: productImage,
          category: productCategory,
          quantity: 1
        });
        
        showNotification(`${productName} добавлен в корзину`, 'success');
      });
    });
  }
  
  // Добавляем обработчики для кнопок добавления в корзину на основной странице
  addCartButtonHandlers();
  
  // Добавляем обработчики для кнопок в модальных окнах категорий
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', function(e) {
      // Предотвращаем закрытие модального окна при клике на контент
      if (e.target.closest('.modal-content') && !e.target.closest('.modal-close')) {
        e.stopPropagation();
      }
    });
  });
  
  // Обновляем обработчики при открытии/закрытии модальных окон
  document.querySelectorAll('.category-link').forEach(link => {
    link.addEventListener('click', function() {
      // Даем время для отображения модального окна
      setTimeout(() => {
        addCartButtonHandlers();
      }, 100);
    });
  });
  
  // Обработчики для страницы корзины
  if (window.location.pathname.includes('cart.html')) {
    renderCart();
    
    // Кнопка перехода к оформлению заказа
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', function() {
        window.location.href = 'checkout.html';
      });
    }
  }
  
  // Обработчики для страницы оформления заказа
  if (window.location.pathname.includes('checkout.html')) {
    renderCheckoutSummary();
    
    // Изменение метода доставки
    const deliveryOptions = document.querySelectorAll('input[name="delivery"]');
    deliveryOptions.forEach(option => {
      option.addEventListener('change', function() {
        updateCheckoutSummary();
      });
    });
    
    // Кнопка размещения заказа
    const placeOrderBtn = document.getElementById('placeOrderBtn');
    if (placeOrderBtn) {
      placeOrderBtn.addEventListener('click', function() {
        const form = document.getElementById('checkoutForm');
        if (form.checkValidity()) {
          // Размещение заказа
          placeOrder();
          window.location.href = 'order-confirmation.html';
        } else {
          form.reportValidity();
        }
      });
    }
  }
});

// Инициализация корзины
function initCart() {
  // Проверяем существование корзины в localStorage
  if (!localStorage.getItem('cart')) {
    localStorage.setItem('cart', JSON.stringify([]));
  }
  
  // Обновляем счетчик товаров в корзине
  updateCartCount();
}

// Добавление товара в корзину
function addToCart(product) {
  let cart = JSON.parse(localStorage.getItem('cart'));
  
  // Проверяем, есть ли уже такой товар в корзине
  const existingProductIndex = cart.findIndex(item => item.id === product.id);
  
  if (existingProductIndex !== -1) {
    // Если товар уже есть, увеличиваем количество
    cart[existingProductIndex].quantity += product.quantity;
  } else {
    // Если товара нет, добавляем его
    cart.push(product);
  }
  
  // Сохраняем корзину в localStorage
  localStorage.setItem('cart', JSON.stringify(cart));
  
  // Обновляем счетчик товаров
  updateCartCount();
}

// Обновление количества товаров в иконке корзины
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('cart'));
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  
  const cartCountElements = document.querySelectorAll('.cart-count');
  cartCountElements.forEach(element => {
    element.textContent = totalItems;
  });
}

// Удаление товара из корзины
function removeFromCart(productId) {
  let cart = JSON.parse(localStorage.getItem('cart'));
  cart = cart.filter(item => item.id !== productId);
  localStorage.setItem('cart', JSON.stringify(cart));
  
  // Обновляем отображение корзины
  renderCart();
  updateCartCount();
}

// Изменение количества товара в корзине
function updateQuantity(productId, change) {
  let cart = JSON.parse(localStorage.getItem('cart'));
  const index = cart.findIndex(item => item.id === productId);
  
  if (index !== -1) {
    cart[index].quantity += change;
    
    // Если количество стало 0 или меньше, удаляем товар
    if (cart[index].quantity <= 0) {
      cart.splice(index, 1);
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Обновляем отображение корзины
    renderCart();
    updateCartCount();
  }
}

// Отображение корзины на странице cart.html
function renderCart() {
  const cart = JSON.parse(localStorage.getItem('cart'));
  const emptyCartElement = document.getElementById('emptyCart');
  const filledCartElement = document.getElementById('filledCart');
  const cartItemsContainer = document.getElementById('cartItems');
  
  if (!emptyCartElement || !filledCartElement || !cartItemsContainer) return;
  
  // Показываем соответствующий блок в зависимости от наличия товаров
  if (cart.length === 0) {
    emptyCartElement.style.display = 'block';
    filledCartElement.style.display = 'none';
    return;
  } else {
    emptyCartElement.style.display = 'none';
    filledCartElement.style.display = 'block';
  }
  
  // Очищаем контейнер с товарами
  cartItemsContainer.innerHTML = '';
  
  // Заполняем таблицу товарами
  let subtotal = 0;
  
  cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;
    
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <div class="cart-product">
          <img src="${item.image}" alt="${item.name}" class="cart-product-img">
          <div class="cart-product-info">
            <h3>${item.name}</h3>
            <p>Категория: ${item.category}</p>
          </div>
        </div>
      </td>
      <td>${item.price.toFixed(2)} BYN</td>
      <td>
        <div class="cart-quantity">
          <button type="button" class="decrease-qty" data-id="${item.id}">-</button>
          <span>${item.quantity}</span>
          <button type="button" class="increase-qty" data-id="${item.id}">+</button>
        </div>
      </td>
      <td>${itemTotal.toFixed(2)} BYN</td>
      <td>
        <div class="cart-actions">
          <button type="button" class="remove-item" data-id="${item.id}">
            <i class="fas fa-trash-alt"></i> Удалить
          </button>
        </div>
      </td>
    `;
    
    cartItemsContainer.appendChild(tr);
  });
  
  // Добавляем обработчики событий для кнопок
  document.querySelectorAll('.decrease-qty').forEach(button => {
    button.addEventListener('click', function() {
      const productId = this.getAttribute('data-id');
      updateQuantity(productId, -1);
    });
  });
  
  document.querySelectorAll('.increase-qty').forEach(button => {
    button.addEventListener('click', function() {
      const productId = this.getAttribute('data-id');
      updateQuantity(productId, 1);
    });
  });
  
  document.querySelectorAll('.remove-item').forEach(button => {
    button.addEventListener('click', function() {
      const productId = this.getAttribute('data-id');
      removeFromCart(productId);
    });
  });
  
  // Обновляем итоговую сумму
  updateCartSummary(subtotal);
}

// Обновление итоговой суммы в корзине
function updateCartSummary(subtotal) {
  const subtotalElement = document.getElementById('subtotal');
  const discountElement = document.getElementById('discount');
  const shippingElement = document.getElementById('shipping');
  const totalElement = document.getElementById('total');
  
  if (!subtotalElement || !discountElement || !shippingElement || !totalElement) return;
  
  // Рассчитываем скидку и доставку
  const discount = 0; // В данном примере скидки нет
  const shipping = 0; // Доставка бесплатная (самовывоз)
  const total = subtotal - discount + shipping;
  
  // Обновляем элементы на странице
  subtotalElement.textContent = subtotal.toFixed(2) + ' BYN';
  discountElement.textContent = discount.toFixed(2) + ' BYN';
  shippingElement.textContent = shipping.toFixed(2) + ' BYN';
  totalElement.textContent = total.toFixed(2) + ' BYN';
}

// Отображение информации о заказе на странице оформления
function renderCheckoutSummary() {
  const cart = JSON.parse(localStorage.getItem('cart'));
  const checkoutProductsElement = document.getElementById('checkoutProducts');
  
  if (!checkoutProductsElement) return;
  
  // Очищаем контейнер
  checkoutProductsElement.innerHTML = '';
  
  // Заполняем товарами
  cart.forEach(item => {
    const productDiv = document.createElement('div');
    productDiv.className = 'checkout-product';
    productDiv.innerHTML = `
      <img src="${item.image}" alt="${item.name}" class="checkout-product-img">
      <div class="checkout-product-info">
        <h4>${item.name}</h4>
        <div class="checkout-product-price">${item.price.toFixed(2)} BYN</div>
        <div class="checkout-product-quantity">Количество: ${item.quantity}</div>
      </div>
    `;
    
    checkoutProductsElement.appendChild(productDiv);
  });
  
  // Обновляем итоговую сумму
  updateCheckoutSummary();
}

// Обновление итоговой суммы на странице оформления заказа
function updateCheckoutSummary() {
  const cart = JSON.parse(localStorage.getItem('cart'));
  
  // Рассчитываем сумму товаров
  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  
  // При самовывозе доставка всегда бесплатная
  const shipping = 0;
  
  // Рассчитываем скидку и итоговую сумму
  const discount = 0;
  const total = subtotal - discount + shipping;
  
  // Обновляем элементы на странице
  document.getElementById('checkoutSubtotal').textContent = subtotal.toFixed(2) + ' BYN';
  document.getElementById('checkoutDiscount').textContent = discount.toFixed(2) + ' BYN';
  document.getElementById('checkoutShipping').textContent = shipping.toFixed(2) + ' BYN';
  document.getElementById('checkoutTotal').textContent = total.toFixed(2) + ' BYN';
}

// Размещение заказа
function placeOrder() {
  const cart = JSON.parse(localStorage.getItem('cart'));
  
  // Проверяем и нормализуем элементы корзины
  const validatedCart = cart.map(item => {
    // Проверяем наличие и корректность всех обязательных полей
    return {
      id: item.id || `item_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name: item.name || 'Неизвестный товар',
      price: typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0,
      quantity: typeof item.quantity === 'number' ? item.quantity : parseInt(item.quantity) || 1,
      image: item.image || '',
      category: item.category || ''
    };
  });
  
  // Получаем данные формы
  const form = document.getElementById('checkoutForm');
  if (!form) return;
  
  const formData = new FormData(form);
  
  // Создаем объект заказа
  const order = {
    customer: {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      city: formData.get('city'),
      address: formData.get('address'),
      zipCode: formData.get('zipCode'),
      apartment: formData.get('apartment')
    },
    orderDetails: {
      items: validatedCart,
      delivery: 'pickup', // Всегда самовывоз
      payment: formData.get('payment'),
      comment: formData.get('orderComment'),
      subtotal: validatedCart.reduce((total, item) => total + (item.price * item.quantity), 0),
      shipping: 0, // Доставка всегда бесплатная при самовывозе
      discount: 0
    },
    orderDate: new Date().toISOString()
  };
  
  // ОТЛАДКА: Выводим структуру заказа
  console.log('ОТПРАВЛЯЕМЫЕ ДАННЫЕ ЗАКАЗА:');
  console.log(JSON.stringify(order, null, 2));
  console.log('Проверка структуры заказа:');
  console.log('- customer:', order.customer ? 'OK' : 'MISSING');
  console.log('  - firstName:', order.customer?.firstName ? 'OK' : 'MISSING/EMPTY');
  console.log('  - lastName:', order.customer?.lastName ? 'OK' : 'MISSING/EMPTY');
  console.log('  - email:', order.customer?.email ? 'OK' : 'MISSING/EMPTY');
  console.log('  - phone:', order.customer?.phone ? 'OK' : 'MISSING/EMPTY');
  console.log('  - city:', order.customer?.city ? 'OK' : 'MISSING/EMPTY');
  console.log('  - address:', order.customer?.address ? 'OK' : 'MISSING/EMPTY');
  console.log('- orderDetails:', order.orderDetails ? 'OK' : 'MISSING');
  console.log('  - items:', order.orderDetails?.items?.length > 0 ? 'OK' : 'EMPTY ARRAY');
  console.log('  - delivery:', order.orderDetails?.delivery ? 'OK' : 'MISSING/EMPTY');
  console.log('  - payment:', order.orderDetails?.payment ? 'OK' : 'MISSING/EMPTY');
  console.log('  - subtotal:', typeof order.orderDetails?.subtotal === 'number' ? 'OK' : 'NOT A NUMBER');
  
  // Показываем индикатор загрузки
  showNotification('Оформляем заказ...', 'info');
  
  // Отправляем заказ на сервер
  fetch('http://localhost:5000/api/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(order)
  })
  .then(response => {
    if (!response.ok) {
      // Дополнительный отладочный вывод
      console.error(`Ошибка запроса: ${response.status} ${response.statusText}`);
      return response.text().then(text => {
        try {
          // Пробуем распарсить JSON
          const errorData = JSON.parse(text);
          console.error('Детали ошибки:', errorData);
          throw new Error(`Ошибка сервера: ${errorData.message || response.statusText}`);
        } catch (e) {
          // Если не удалось распарсить как JSON, выводим как текст
          console.error('Ответ сервера (текст):', text);
          throw new Error(`HTTP error! Status: ${response.status} ${response.statusText}`);
        }
      });
    }
    return response.json();
  })
  .then(data => {
    console.log('Заказ успешно отправлен:', data);
    
    // Сохраняем ID заказа для страницы подтверждения
    localStorage.setItem('lastOrderId', data.orderId || 'ORD-' + Math.floor(100000 + Math.random() * 900000));
    
    // Очищаем корзину
    localStorage.setItem('cart', JSON.stringify([]));
    updateCartCount();
    
    // Показываем уведомление об успешном размещении заказа
    showNotification('Заказ успешно оформлен! Подтверждение отправлено на почту', 'success');
    
    // Перенаправляем на страницу подтверждения заказа
    setTimeout(() => {
      window.location.href = 'order-confirmation.html';
    }, 1500);
  })
  .catch(error => {
    console.error('Ошибка при отправке заказа:', error);
    console.error('Стек ошибки:', error.stack);
    
    // Показываем уведомление об ошибке
    showNotification('Произошла ошибка при оформлении заказа. Попробуйте еще раз позже.', 'error');
    
    // В случае ошибки, все равно перенаправляем на страницу подтверждения в демо-режиме
    localStorage.setItem('lastOrderId', 'ORD-' + Math.floor(100000 + Math.random() * 900000));
    localStorage.setItem('cart', JSON.stringify([]));
    updateCartCount();
    
    setTimeout(() => {
      window.location.href = 'order-confirmation.html';
    }, 3000);
  });
} 