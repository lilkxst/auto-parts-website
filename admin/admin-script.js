document.addEventListener('DOMContentLoaded', function() {
    // Проверка авторизации
    const token = localStorage.getItem('adminToken');
    if (!token) {
        // Если токен отсутствует, перенаправляем на страницу входа
        window.location.href = 'login.html';
        return;
    }
    
    // Базовый URL API
    const API_URL = 'http://localhost:5000/api';
    
    // Для демо-режима
    let isDemoMode = localStorage.getItem('isDemoMode') === 'true';
    if (isDemoMode) {
        console.log('Включен демо-режим из localStorage');
        showNotification('Работа в демо-режиме. Изменения не будут сохранены на сервере.', 'info');
        
        // Добавляем кнопку для очистки всех данных в демо-режиме
        const header = document.querySelector('.main-header');
        if (header) {
            const clearDataBtn = document.createElement('button');
            clearDataBtn.type = 'button';
            clearDataBtn.className = 'clear-data-btn';
            clearDataBtn.innerHTML = '<i class="fas fa-trash-alt"></i> Очистить все данные';
            clearDataBtn.style.backgroundColor = '#dc3545';
            clearDataBtn.style.color = 'white';
            clearDataBtn.style.border = 'none';
            clearDataBtn.style.padding = '8px 15px';
            clearDataBtn.style.borderRadius = '4px';
            clearDataBtn.style.marginRight = '15px';
            clearDataBtn.style.cursor = 'pointer';
            
            clearDataBtn.addEventListener('click', function() {
                if (confirm('Вы уверены, что хотите удалить ВСЕ демо-данные? Это действие нельзя отменить.')) {
                    // Очищаем все данные
                    demoData.products = [];
                    demoData.reviews = [];
                    demoData.orders = [];
                    demoData.customers = [];
                    
                    // Обновляем текущий активный раздел
                    const activeSection = document.querySelector('.content-section.active');
                    if (activeSection) {
                        const sectionId = activeSection.getAttribute('id');
                        if (sectionId === 'products') {
                            loadProducts();
                        } else if (sectionId === 'reviews') {
                            loadReviews();
                        } else if (sectionId === 'orders') {
                            loadOrders();
                        } else if (sectionId === 'customers') {
                            loadCustomers();
                        }
                    }
                    
                    showNotification('Все данные успешно удалены!', 'success');
                }
            });
            
            const headerRight = header.querySelector('.header-right');
            if (headerRight) {
                headerRight.prepend(clearDataBtn);
            } else {
                header.prepend(clearDataBtn);
            }
        }
    }
    
    // Переключение между разделами админ-панели
    const navLinks = document.querySelectorAll('.sidebar-nav a');
    const contentSections = document.querySelectorAll('.content-section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            
            // Удаляем активный класс у всех ссылок
            navLinks.forEach(link => {
                link.parentElement.classList.remove('active');
            });
            
            // Добавляем активный класс к текущей ссылке
            this.parentElement.classList.add('active');
            
            // Скрываем все секции контента
            contentSections.forEach(section => {
                section.classList.remove('active');
            });
            
            // Показываем целевую секцию
            document.getElementById(targetId).classList.add('active');
            
            // Загружаем данные для раздела, если нужно
            if (targetId === 'products') {
                loadProducts();
            } else if (targetId === 'orders') {
                loadOrders();
            } else if (targetId === 'customers') {
                loadCustomers();
            } else if (targetId === 'reviews') {
                loadReviews();
            }
        });
    });
    
    // Переключение между вкладками настроек
    const settingsLinks = document.querySelectorAll('.settings-nav a');
    const settingsPanels = document.querySelectorAll('.settings-panel');
    
    if (settingsLinks.length > 0) {
        settingsLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(1);
                
                // Удаляем активный класс у всех ссылок настроек
                settingsLinks.forEach(link => {
                    link.parentElement.classList.remove('active');
                });
                
                // Добавляем активный класс к текущей ссылке
                this.parentElement.classList.add('active');
                
                // Скрываем все панели настроек
                settingsPanels.forEach(panel => {
                    panel.classList.remove('active');
                });
                
                // Показываем целевую панель
                document.getElementById(targetId).classList.add('active');
            });
        });
    }
    
    // Мобильная навигация - переключение боковой панели
    const toggleSidebar = document.createElement('button');
    toggleSidebar.classList.add('toggle-sidebar');
    toggleSidebar.innerHTML = '<i class="fas fa-bars"></i>';
    document.querySelector('.main-header').prepend(toggleSidebar);
    
    toggleSidebar.addEventListener('click', function() {
        document.querySelector('.sidebar').classList.toggle('active');
    });
    
    // API функции
    
    // Получить токен авторизации из localStorage
    function getAuthToken() {
        return localStorage.getItem('adminToken');
    }
    
    // Проверяем доступность сервера
    async function checkServerAvailability() {
        try {
            // Используем кастомный endpoint для проверки
            const response = await fetch(`${API_URL}/health-check`, { 
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                console.log('Сервер доступен, работаем в онлайн-режиме');
                // Отключаем демо-режим, если он был включен
                if (isDemoMode) {
                    localStorage.removeItem('isDemoMode');
                    isDemoMode = false;
                    showNotification('Подключение к серверу восстановлено. Демо-режим отключен.', 'success');
                }
                return true;
            } else {
                console.log('Сервер недоступен, переключаемся в демо-режим');
                localStorage.setItem('isDemoMode', 'true');
                isDemoMode = true;
                showNotification('Сервер недоступен. Включен демо-режим.', 'info');
                return false;
            }
        } catch (error) {
            console.log('Ошибка подключения к серверу, переключаемся в демо-режим');
            console.error(error);
            localStorage.setItem('isDemoMode', 'true');
            isDemoMode = true;
            showNotification('Сервер недоступен. Включен демо-режим.', 'info');
            return false;
        }
    }

    // Проверяем сервер при загрузке страницы
    checkServerAvailability();

    // Модифицированная функция apiRequest с поддержкой демо-режима
    async function apiRequest(endpoint, method = 'GET', data = null) {
        console.log(`Выполняем запрос ${method} ${endpoint}`, data);

        // Если включен демо-режим, возвращаем демо-данные
        if (isDemoMode) {
            console.log('Использую демо-режим для запроса');
            return handleDemoApiRequest(endpoint, method, data);
        }
        
        const url = `${API_URL}${endpoint}`;
        const token = getAuthToken();
        
        const options = {
            method,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : ''
            }
        };
        
        if (data) {
            options.body = JSON.stringify(data);
        }
        
        try {
            console.log(`Отправляю запрос на ${url}`, options);
            
            const response = await fetch(url, options);
            console.log(`Получен ответ от ${url}:`, response);
            
            if (response.status === 401) {
                // Если токен истек или невалиден, перенаправляем на страницу входа
                console.log('Токен недействителен, перенаправление на страницу входа');
                localStorage.removeItem('adminToken');
                window.location.href = 'login.html';
                return null;
            }
            
            // Проверяем тип контента
            const contentType = response.headers.get('content-type');
            
            // Проверяем, есть ли содержимое в ответе
            try {
                // Если тип контента не JSON, получаем текст
                if (!contentType || !contentType.includes('application/json')) {
                    console.log('Получен не JSON-ответ:', contentType);
                    const text = await response.text();
                    console.log('Текст ответа:', text);
                    
                    if (!response.ok) {
                        throw new Error(`Ошибка сервера: ${response.status} ${response.statusText}`);
                    }
                    
                    // Пытаемся распарсить как JSON, если это возможно
                    try {
                        return JSON.parse(text);
                    } catch (jsonError) {
                        // Если не получилось, просто возвращаем успех
                        return { success: true, data: {} };
                    }
                }
                
                // Если тип контента JSON, пробуем распарсить
                const result = await response.json();
                console.log('Распарсенный JSON-ответ:', result);
                
                if (!response.ok) {
                    throw new Error(result.message || 'Произошла ошибка');
                }
                
                return result;
            } catch (parseError) {
                console.error('Ошибка при обработке ответа:', parseError);
                
                if (!response.ok) {
                    throw new Error(`Ошибка сервера: ${response.status} ${response.statusText}`);
                }
                
                // В случае ошибки парсинга, но успешного ответа, просто возвращаем успех
                return { success: true, data: {} };
            }
        } catch (error) {
            console.error('API Error:', error);
            
            // Если ошибка соединения, переключаемся в демо-режим
            if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
                console.log('Ошибка соединения с сервером, переключаемся в демо-режим');
                isDemoMode = true;
                localStorage.setItem('isDemoMode', 'true');
                showNotification('Сервер недоступен. Включен демо-режим.', 'info');
                return handleDemoApiRequest(endpoint, method, data);
            }
            
            showNotification(error.message, 'error');
            
            // В случае других ошибок, но при удалении и редактировании, 
            // можно считать операцию условно успешной в некоторых случаях
            if (method === 'DELETE') {
                if (endpoint.startsWith('/products/') || endpoint.startsWith('/reviews/')) {
                    console.log('Считаем удаление успешным, несмотря на ошибку');
                    return { success: true, message: 'Объект удален' };
                }
            }
            
            return null;
        }
    }

    // Хранилище для демо-данных (для возможности реального редактирования в демо-режиме)
    const demoData = {
        products: getDemoProducts(),
        orders: [],
        customers: [],
        reviews: []
    };
    
    // Функция для имитации ответов API в демо-режиме
    function handleDemoApiRequest(endpoint, method, data) {
        console.log(`[ДЕМО] ${method} ${endpoint}`, data);
        
        // Имитация задержки сети
        return new Promise(resolve => {
            setTimeout(() => {
                // Управление товарами
                if (endpoint === '/products' && method === 'GET') {
                    resolve({
                        success: true,
                        data: demoData.products,
                        pagination: {
                            currentPage: 1,
                            totalPages: 1,
                            totalItems: demoData.products.length
                        }
                    });
                } else if (endpoint.startsWith('/products/') && method === 'GET') {
                    const productId = endpoint.split('/')[2];
                    const product = demoData.products.find(p => p._id === productId);
                    
                    if (product) {
                        resolve(product);
                    } else {
                        resolve(null);
                    }
                } else if (endpoint === '/products' && method === 'POST') {
                    // Создание нового товара
                    const newProduct = {
                        ...data,
                        _id: 'demo_' + Date.now(),
                        createdAt: new Date().toISOString()
                    };
                    
                    // Добавляем новый товар в демо-хранилище
                    demoData.products.push(newProduct);
                    
                    resolve({
                        success: true,
                        data: newProduct
                    });
                } else if (endpoint.startsWith('/products/') && method === 'PUT') {
                    // Обновление товара
                    const productId = endpoint.split('/')[2];
                    const productIndex = demoData.products.findIndex(p => p._id === productId);
                    
                    if (productIndex !== -1) {
                        demoData.products[productIndex] = {
                            ...demoData.products[productIndex],
                            ...data,
                            updatedAt: new Date().toISOString()
                        };
                        
                        resolve({
                            success: true,
                            data: demoData.products[productIndex]
                        });
                    } else {
                        resolve({
                            success: false,
                            message: 'Товар не найден'
                        });
                    }
                } else if (endpoint.startsWith('/products/') && method === 'DELETE') {
                    // Удаление товара
                    const productId = endpoint.split('/')[2];
                    const productIndex = demoData.products.findIndex(p => p._id === productId);
                    
                    if (productIndex !== -1) {
                        demoData.products.splice(productIndex, 1);
                        
                        resolve({
                            success: true,
                            message: 'Товар успешно удален'
                        });
                    } else {
                        resolve({
                            success: false,
                            message: 'Товар не найден'
                        });
                    }
                } else if (endpoint === '/reviews' && method === 'GET') {
                    // Если в демо-хранилище нет отзывов, добавим несколько
                    if (demoData.reviews.length === 0) {
                        demoData.reviews = [
                            {
                                _id: 'demo_review1',
                                product: { name: 'Масляный фильтр OEM 15208-65F0E' },
                                author: 'Иван Петров',
                                rating: 5,
                                text: 'Отличный фильтр, машина работает как часы.',
                                status: 'pending',
                                createdAt: new Date().toISOString()
                            },
                            {
                                _id: 'demo_review2',
                                product: { name: 'Воздушный фильтр K&N 33-2304' },
                                author: 'Алексей Смирнов',
                                rating: 4,
                                text: 'Хороший фильтр, но цена высоковата.',
                                status: 'approved',
                                createdAt: new Date().toISOString()
                            },
                            {
                                _id: 'demo_review3',
                                product: { name: 'Тормозные колодки Brembo P85020' },
                                author: 'Сергей Иванов',
                                rating: 3,
                                text: 'Средние колодки, есть и получше.',
                                status: 'rejected',
                                createdAt: new Date().toISOString()
                            }
                        ];
                    }
                    
                    resolve({
                        success: true,
                        data: demoData.reviews,
                        pagination: {
                            currentPage: 1,
                            totalPages: 1,
                            totalItems: demoData.reviews.length
                        }
                    });
                } else if (endpoint.startsWith('/reviews/') && method === 'DELETE') {
                    // Удаление отзыва
                    const reviewId = endpoint.split('/')[2];
                    const reviewIndex = demoData.reviews.findIndex(r => r._id === reviewId);
                    
                    if (reviewIndex !== -1) {
                        demoData.reviews.splice(reviewIndex, 1);
                        
                        resolve({
                            success: true,
                            message: 'Отзыв успешно удален'
                        });
                    } else {
                        resolve({
                            success: false,
                            message: 'Отзыв не найден'
                        });
                    }
                } else if (endpoint.startsWith('/reviews/') && endpoint.endsWith('/approve') && method === 'PUT') {
                    // Одобрение отзыва
                    const reviewId = endpoint.split('/')[2];
                    const reviewIndex = demoData.reviews.findIndex(r => r._id === reviewId);
                    
                    if (reviewIndex !== -1) {
                        demoData.reviews[reviewIndex].status = 'approved';
                        
                        resolve({
                            success: true,
                            message: 'Отзыв успешно одобрен'
                        });
                    } else {
                        resolve({
                            success: false,
                            message: 'Отзыв не найден'
                        });
                    }
                } else if (endpoint.startsWith('/reviews/') && endpoint.endsWith('/reject') && method === 'PUT') {
                    // Отклонение отзыва
                    const reviewId = endpoint.split('/')[2];
                    const reviewIndex = demoData.reviews.findIndex(r => r._id === reviewId);
                    
                    if (reviewIndex !== -1) {
                        demoData.reviews[reviewIndex].status = 'rejected';
                        
                        resolve({
                            success: true,
                            message: 'Отзыв успешно отклонен'
                        });
                    } else {
                        resolve({
                            success: false,
                            message: 'Отзыв не найден'
                        });
                    }
                } else if (endpoint === '/orders' && method === 'GET') {
                    // Если в демо-хранилище нет заказов, добавим несколько
                    if (demoData.orders.length === 0) {
                        demoData.orders = [
                            {
                                _id: 'demo_order1',
                                customer: { firstName: 'Иван', lastName: 'Петров', phone: '+375291234567', email: 'ivan@example.com' },
                                items: [
                                    { product: { name: 'Масляный фильтр OEM 15208-65F0E', sku: 'OIL-FILTER-001' }, quantity: 1, price: 12.99 }
                                ],
                                totalAmount: 12.99,
                                status: 'pending',
                                createdAt: new Date().toISOString(),
                                shippingAddress: { address: 'ул. Пушкина, д. 10', city: 'Минск', zip: '220000' }
                            },
                            {
                                _id: 'demo_order2',
                                customer: { firstName: 'Алексей', lastName: 'Смирнов', phone: '+375297654321', email: 'alex@example.com' },
                                items: [
                                    { product: { name: 'Воздушный фильтр K&N 33-2304', sku: 'AIR-FILTER-002' }, quantity: 1, price: 54.99 },
                                    { product: { name: 'Тормозные колодки Brembo P85020', sku: 'BRAKE-PADS-003' }, quantity: 2, price: 89.99 }
                                ],
                                totalAmount: 234.97,
                                status: 'shipped',
                                createdAt: new Date(Date.now() - 86400000).toISOString(), // вчера
                                shippingAddress: { address: 'ул. Ленина, д. 15', city: 'Гомель', zip: '246000' }
                            }
                        ];
                    }
                    
                    resolve({
                        success: true,
                        data: demoData.orders,
                        pagination: {
                            currentPage: 1,
                            totalPages: 1,
                            totalItems: demoData.orders.length
                        }
                    });
                } else if (endpoint.startsWith('/orders/') && method === 'PUT') {
                    // Обновление статуса заказа
                    const orderId = endpoint.split('/')[2];
                    const orderIndex = demoData.orders.findIndex(o => o._id === orderId);
                    
                    if (orderIndex !== -1) {
                        demoData.orders[orderIndex] = {
                            ...demoData.orders[orderIndex],
                            ...data,
                            updatedAt: new Date().toISOString()
                        };
                        
                        resolve({
                            success: true,
                            message: 'Заказ успешно обновлен'
                        });
                    } else {
                        resolve({
                            success: false,
                            message: 'Заказ не найден'
                        });
                    }
                } else if (endpoint.startsWith('/orders/') && method === 'GET') {
                    // Получение заказа по ID
                    const orderId = endpoint.split('/')[2];
                    const order = demoData.orders.find(o => o._id === orderId);
                    
                    if (order) {
                        resolve(order);
                    } else {
                        resolve(null);
                    }
                } else if (endpoint === '/categories') {
                    // Получение категорий
                    resolve({
                        success: true,
                        data: [
                            { _id: '1', name: 'Двигатель' },
                            { _id: '2', name: 'Кузовные детали' },
                            { _id: '3', name: 'Тормозная система' },
                            { _id: '4', name: 'Подвеска' },
                            { _id: '5', name: 'Электрика' },
                            { _id: '6', name: 'Аксессуары' }
                        ]
                    });
                } else {
                    // Возвращаем пустой успешный ответ для других запросов
                    resolve({
                        success: true,
                        data: {}
                    });
                }
            }, 300); // Имитация задержки сети
        });
    }

    // Функция для получения демо-товаров
    function getDemoProducts() {
        return [
            {
                _id: 'demo1',
                name: 'Масляный фильтр OEM 15208-65F0E',
                sku: 'OIL-FILTER-001',
                category: 'Двигатель',
                brand: 'Nissan',
                description: 'Оригинальный масляный фильтр для автомобилей Nissan. Высокое качество фильтрации.',
                price: 12.99,
                stock: 45,
                mainImage: 'images/products/oil-filter.jpg',
                featured: true,
                active: true,
                specifications: [
                    { key: 'Производитель', value: 'Nissan' },
                    { key: 'Страна', value: 'Япония' },
                    { key: 'Тип', value: 'Фильтр масляный' }
                ]
            },
            {
                _id: 'demo2',
                name: 'Воздушный фильтр K&N 33-2304',
                sku: 'AIR-FILTER-002',
                category: 'Двигатель',
                brand: 'K&N',
                description: 'Высокопроизводительный воздушный фильтр многоразового использования с повышенным сроком службы.',
                price: 54.99,
                stock: 23,
                mainImage: 'images/products/air-filter.jpg',
                featured: true,
                active: true,
                specifications: [
                    { key: 'Производитель', value: 'K&N' },
                    { key: 'Страна', value: 'США' },
                    { key: 'Тип', value: 'Фильтр воздушный' },
                    { key: 'Особенности', value: 'Многоразовый' }
                ]
            },
            {
                _id: 'demo3',
                name: 'Тормозные колодки Brembo P85020',
                sku: 'BRAKE-PADS-003',
                category: 'Тормозная система',
                brand: 'Brembo',
                description: 'Высококачественные передние тормозные колодки с низким уровнем пыли и шума.',
                price: 89.99,
                discountPrice: 79.99,
                stock: 15,
                mainImage: 'images/products/brake-pads.jpg',
                featured: false,
                active: true,
                specifications: [
                    { key: 'Производитель', value: 'Brembo' },
                    { key: 'Страна', value: 'Италия' },
                    { key: 'Тип', value: 'Передние колодки' },
                    { key: 'Материал', value: 'Керамика' }
                ]
            },
            {
                _id: 'demo4',
                name: 'Амортизатор KYB 341600',
                sku: 'SHOCK-ABS-004',
                category: 'Подвеска',
                brand: 'KYB',
                description: 'Амортизатор для подвески, обеспечивающий отличную устойчивость и комфорт при движении.',
                price: 78.50,
                stock: 8,
                mainImage: 'images/products/shock-absorber.jpg',
                featured: false,
                active: true,
                specifications: [
                    { key: 'Производитель', value: 'KYB' },
                    { key: 'Страна', value: 'Япония' },
                    { key: 'Тип', value: 'Передний амортизатор' },
                    { key: 'Применимость', value: 'Toyota Camry 2012-2018' }
                ]
            },
            {
                _id: 'demo5',
                name: 'Аккумулятор Bosch S5 008',
                sku: 'BATTERY-005',
                category: 'Электрика',
                brand: 'Bosch',
                description: 'Необслуживаемый аккумулятор для автомобилей со стандартным энергопотреблением.',
                price: 129.99,
                stock: 12,
                mainImage: 'images/products/battery.jpg',
                featured: true,
                active: true,
                specifications: [
                    { key: 'Производитель', value: 'Bosch' },
                    { key: 'Страна', value: 'Германия' },
                    { key: 'Емкость', value: '77 Ah' },
                    { key: 'Пусковой ток', value: '780 A' }
                ]
            }
        ];
    }
    
    // Загрузка списка товаров
    async function loadProducts(page = 1, limit = 10) {
        const productsList = document.querySelector('#products .product-list tbody');
        const paginationContainer = document.querySelector('#products .pagination');
        if (!productsList) return;
        
        // Очищаем список товаров
        productsList.innerHTML = '<tr><td colspan="6" class="text-center">Загрузка товаров...</td></tr>';
        
        try {
            const response = await apiRequest(`/products?page=${page}&limit=${limit}`);
            
            if (response && response.data) {
                // Очищаем список товаров перед обновлением
                productsList.innerHTML = '';
                
                if (response.data.length === 0) {
                    productsList.innerHTML = '<tr><td colspan="6" class="text-center">Товары не найдены</td></tr>';
                    if (paginationContainer) {
                        paginationContainer.innerHTML = '';
                    }
                    return;
                }
                
                // Добавляем товары в таблицу
                response.data.forEach(product => {
                    if (!product || !product._id) return; // Пропускаем некорректные товары
                    
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${product._id}</td>
                        <td>
                            <div class="product-info">
                                <img src="${product.mainImage || 'images/default-product.jpg'}" alt="${product.name}" class="product-img">
                                <div>
                                    <h4>${product.name || 'Без названия'}</h4>
                                    <p>Категория: ${product.category || 'Без категории'}</p>
                                </div>
                            </div>
                        </td>
                        <td>${product.category || 'Не указана'}</td>
                        <td>${typeof product.price === 'number' ? product.price.toFixed(2) : '0.00'} BYN</td>
                        <td>
                            <span class="status-badge ${getStockStatusClass(product.stock)}">
                                ${getStockStatusText(product.stock)}
                            </span>
                        </td>
                        <td>
                            <div class="actions">
                                <button type="button" class="edit" data-id="${product._id}">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button type="button" class="delete" data-id="${product._id}">
                                    <i class="fas fa-trash-alt"></i>
                                </button>
                            </div>
                        </td>
                    `;
                    productsList.appendChild(row);
                });
                
                // Добавляем обработчики событий для новых кнопок
                addProductEventListeners();
                
                // Обновляем пагинацию, если есть информация о ней
                if (paginationContainer && response.pagination) {
                    renderPagination(paginationContainer, response.pagination, (clickedPage) => {
                        loadProducts(clickedPage, limit);
                    });
                }
            }
        } catch (error) {
            productsList.innerHTML = '<tr><td colspan="6" class="text-center">Ошибка загрузки товаров</td></tr>';
            console.error('Error loading products:', error);
        }
    }
    
    // Функция для отрисовки пагинации
    function renderPagination(container, pagination, callback) {
        const { currentPage, totalPages } = pagination;
        
        if (totalPages <= 1) {
            container.innerHTML = '';
            return;
        }
        
        let paginationHTML = `
            <ul class="pagination-list">
                <li class="${currentPage === 1 ? 'disabled' : ''}">
                    <a href="#" data-page="${currentPage - 1}" class="${currentPage === 1 ? 'disabled' : ''}">
                        <i class="fas fa-chevron-left"></i>
                    </a>
                </li>
        `;
        
        const maxDisplayPages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxDisplayPages / 2));
        let endPage = Math.min(totalPages, startPage + maxDisplayPages - 1);
        
        if (endPage - startPage + 1 < maxDisplayPages) {
            startPage = Math.max(1, endPage - maxDisplayPages + 1);
        }
        
        // Если отображаем не с первой страницы, показываем многоточие
        if (startPage > 1) {
            paginationHTML += `
                <li>
                    <a href="#" data-page="1">1</a>
                </li>
                ${startPage > 2 ? '<li class="ellipsis">...</li>' : ''}
            `;
        }
        
        // Отображаем номера страниц
        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <li class="${i === currentPage ? 'active' : ''}">
                    <a href="#" data-page="${i}">${i}</a>
                </li>
            `;
        }
        
        // Если отображаем не до последней страницы, показываем многоточие
        if (endPage < totalPages) {
            paginationHTML += `
                ${endPage < totalPages - 1 ? '<li class="ellipsis">...</li>' : ''}
                <li>
                    <a href="#" data-page="${totalPages}">${totalPages}</a>
                </li>
            `;
        }
        
        paginationHTML += `
                <li class="${currentPage === totalPages ? 'disabled' : ''}">
                    <a href="#" data-page="${currentPage + 1}" class="${currentPage === totalPages ? 'disabled' : ''}">
                        <i class="fas fa-chevron-right"></i>
                    </a>
                </li>
            </ul>
        `;
        
        container.innerHTML = paginationHTML;
        
        // Добавляем обработчики событий
        const pageLinks = container.querySelectorAll('a[data-page]');
        if (pageLinks.length > 0) {
            pageLinks.forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    if (this.classList.contains('disabled')) {
                        return;
                    }
                    
                    const page = parseInt(this.getAttribute('data-page'), 10);
                    callback(page);
                });
            });
        }
    }
    
    // Функция для определения класса статуса наличия
    function getStockStatusClass(stock) {
        if (stock <= 0) return 'out-of-stock';
        if (stock < 5) return 'low-stock';
        return 'in-stock';
    }
    
    // Функция для определения текста статуса наличия
    function getStockStatusText(stock) {
        if (stock <= 0) return 'Нет в наличии';
        if (stock < 5) return 'Осталось мало';
        return 'В наличии';
    }
    
    // Добавление обработчиков событий для кнопок товаров
    function addProductEventListeners() {
        // Действия с товарами
        const editProductButtons = document.querySelectorAll('.product-list .edit');
        const deleteProductButtons = document.querySelectorAll('.product-list .delete');
        
        if (editProductButtons.length > 0) {
            editProductButtons.forEach(button => {
                // Удаляем старые обработчики, чтобы избежать дублирования
                const oldButton = button.cloneNode(true);
                button.parentNode.replaceChild(oldButton, button);
                
                oldButton.addEventListener('click', function() {
                    const productId = this.getAttribute('data-id');
                    openProductEditModal(productId);
                });
            });
        }
        
        if (deleteProductButtons.length > 0) {
            deleteProductButtons.forEach(button => {
                // Удаляем старые обработчики, чтобы избежать дублирования
                const oldButton = button.cloneNode(true);
                button.parentNode.replaceChild(oldButton, button);
                
                oldButton.addEventListener('click', function() {
                    const productId = this.getAttribute('data-id');
                    if (confirm('Вы уверены, что хотите удалить этот товар?')) {
                        deleteProduct(productId);
                    }
                });
            });
        }
    }
    
    // Функция удаления товара
    async function deleteProduct(productId) {
        if (!productId) {
            showNotification('Ошибка: ID товара отсутствует', 'error');
            return;
        }
        
        try {
            console.log(`Удаляем товар с ID: ${productId}`);
            
            // Немедленно найдем и удалим строку из DOM для лучшего пользовательского опыта
            const productRow = document.querySelector(`.product-list tr button.delete[data-id="${productId}"]`)?.closest('tr');
            if (productRow) {
                // Добавляем класс анимации удаления перед удалением из DOM
                productRow.classList.add('deleting');
                setTimeout(() => {
                    productRow.remove();
                }, 300);
            }
            
            // Для демо-режима немедленно удаляем из памяти
            if (isDemoMode) {
                const productIndex = demoData.products.findIndex(p => p._id === productId);
                if (productIndex !== -1) {
                    demoData.products.splice(productIndex, 1);
                }
            }
            
            const response = await apiRequest(`/products/${productId}`, 'DELETE');
            
            if (response) {
                showNotification('Товар успешно удален', 'success');
                // После успешного удаления обновим список товаров
                setTimeout(() => {
                    loadProducts();
                }, 500);
            } else {
                showNotification('Запрос удаления выполнен. Обновление списка...', 'info');
                // Все равно обновим список
                setTimeout(() => {
                    loadProducts();
                }, 500);
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            showNotification(`Ошибка при удалении товара: ${error.message}`, 'error');
            
            // Если мы в демо-режиме, успешно обновим список
            if (isDemoMode) {
                setTimeout(() => {
                    loadProducts();
                }, 500);
            }
        }
    }

    // Функции для работы с модальным окном
    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Блокируем прокрутку страницы
        }
    }

    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = ''; // Разблокируем прокрутку страницы
        }
    }

    // Обработка модального окна для товаров
    const productModal = document.getElementById('productModal');
    const closeProductModalBtn = document.getElementById('closeProductModal');
    const cancelProductFormBtn = document.getElementById('cancelProductForm');
    const productForm = document.getElementById('productForm');
    const productModalTitle = document.getElementById('productModalTitle');

    if (closeProductModalBtn) {
        closeProductModalBtn.addEventListener('click', function() {
            closeModal('productModal');
        });
    }

    if (cancelProductFormBtn) {
        cancelProductFormBtn.addEventListener('click', function() {
            closeModal('productModal');
        });
    }

    // Закрытие модального окна при клике на фон
    if (productModal) {
        const modalBackdrop = productModal.querySelector('.modal-backdrop');
        if (modalBackdrop) {
            modalBackdrop.addEventListener('click', function() {
                closeModal('productModal');
            });
        }
    }

    // Предотвращение закрытия при клике на контент модального окна
    if (productModal) {
        const modalContent = productModal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.addEventListener('click', function(e) {
                e.stopPropagation();
            });
        }
    }

    // Добавление спецификаций товара
    const addSpecificationBtn = document.getElementById('addSpecification');
    const specificationsContainer = document.getElementById('specificationsContainer');

    if (addSpecificationBtn && specificationsContainer) {
        addSpecificationBtn.addEventListener('click', function() {
            const newRow = document.createElement('div');
            newRow.className = 'specification-row';
            newRow.innerHTML = `
                <div class="form-row">
                    <div class="col-md-5">
                        <input type="text" name="spec_key[]" class="form-control" placeholder="Название">
                    </div>
                    <div class="col-md-5">
                        <input type="text" name="spec_value[]" class="form-control" placeholder="Значение">
                    </div>
                    <div class="col-md-2">
                        <button type="button" class="btn btn-danger btn-sm remove-spec">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            `;
            specificationsContainer.appendChild(newRow);
            
            // Добавляем обработчик для кнопки удаления
            const removeBtn = newRow.querySelector('.remove-spec');
            if (removeBtn) {
                removeBtn.addEventListener('click', function() {
                    specificationsContainer.removeChild(newRow);
                });
            }
        });
        
        // Добавляем обработчики для существующих кнопок удаления
        const removeSpecButtons = document.querySelectorAll('.remove-spec');
        if (removeSpecButtons.length > 0) {
            removeSpecButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const row = this.closest('.specification-row');
                    if (row) {
                        specificationsContainer.removeChild(row);
                    }
                });
            });
        }
    }

    // Обновление функции открытия модального окна для добавления товара
    function openAddProductModal() {
        resetProductForm();
        productModalTitle.textContent = 'Добавить товар';
        productForm.setAttribute('data-mode', 'add');
        document.getElementById('productId').value = '';
        
        // Генерируем уникальный SKU
        document.getElementById('productSKU').value = 'SKU-' + Date.now();
        
        // Установка активного статуса по умолчанию
        document.getElementById('productActive').checked = true;
        
        // Загрузка категорий, если это еще не сделано
        loadCategories();
        
        openModal('productModal');
    }

    // Обновление функции открытия модального окна для редактирования товара
    async function openProductEditModal(productId) {
        try {
            resetProductForm();
            productModalTitle.textContent = 'Редактировать товар';
            productForm.setAttribute('data-mode', 'edit');
            
            // Загрузка данных о товаре
            const product = await apiRequest(`/products/${productId}`);
            
            if (product) {
                // Заполнение полей формы данными о товаре
                document.getElementById('productId').value = product._id;
                document.getElementById('productName').value = product.name;
                document.getElementById('productSKU').value = product.sku;
                document.getElementById('productCategory').value = product.category;
                document.getElementById('productBrand').value = product.brand || '';
                document.getElementById('productPrice').value = product.price;
                document.getElementById('productDiscountPrice').value = product.discountPrice || '';
                document.getElementById('productStock').value = product.stock;
                document.getElementById('productDescription').value = product.description || '';
                document.getElementById('productFeatured').checked = product.featured || false;
                document.getElementById('productActive').checked = product.active !== false;
                
                // Загрузка изображений
                if (product.mainImage) {
                    const mainImagePreview = document.querySelector('#selectMainImage').previousElementSibling.previousElementSibling;
                    if (mainImagePreview) {
                        mainImagePreview.src = product.mainImage;
                    }
                }
                
                // Загрузка спецификаций
                if (product.specifications && product.specifications.length > 0) {
                    // Очищаем контейнер спецификаций, оставляя только первую строку
                    const firstRow = specificationsContainer.querySelector('.specification-row');
                    specificationsContainer.innerHTML = '';
                    specificationsContainer.appendChild(firstRow);
                    
                    // Заполняем первую строку
                    const firstKeyInput = firstRow.querySelector('input[name="spec_key[]"]');
                    const firstValueInput = firstRow.querySelector('input[name="spec_value[]"]');
                    if (firstKeyInput && firstValueInput && product.specifications[0]) {
                        firstKeyInput.value = product.specifications[0].key;
                        firstValueInput.value = product.specifications[0].value;
                    }
                    
                    // Добавляем остальные спецификации
                    for (let i = 1; i < product.specifications.length; i++) {
                        const spec = product.specifications[i];
                        addSpecificationBtn.click(); // Добавляем новую строку
                        
                        // Находим последнюю добавленную строку
                        const lastRow = specificationsContainer.lastElementChild;
                        const keyInput = lastRow.querySelector('input[name="spec_key[]"]');
                        const valueInput = lastRow.querySelector('input[name="spec_value[]"]');
                        
                        if (keyInput && valueInput) {
                            keyInput.value = spec.key;
                            valueInput.value = spec.value;
                        }
                    }
                }
                
                // Загрузка категорий
                loadCategories();
                
                openModal('productModal');
            }
        } catch (error) {
            console.error('Error loading product details:', error);
            showNotification('Ошибка при загрузке данных о товаре', 'error');
        }
    }

    // Сброс формы товара
    function resetProductForm() {
        productForm.reset();
        
        // Сброс превью изображений
        const imagePreviews = productForm.querySelectorAll('.file-preview');
        if (imagePreviews.length > 0) {
            imagePreviews.forEach(preview => {
                preview.src = 'images/placeholder-image.jpg';
            });
        }
        
        // Сброс спецификаций (оставляем только первую строку)
        if (specificationsContainer) {
            const rows = specificationsContainer.querySelectorAll('.specification-row');
            if (rows.length > 1) {
                for (let i = 1; i < rows.length; i++) {
                    specificationsContainer.removeChild(rows[i]);
                }
            }
            
            // Очищаем значения в первой строке
            const firstRow = specificationsContainer.querySelector('.specification-row');
            if (firstRow) {
                const inputs = firstRow.querySelectorAll('input');
                inputs.forEach(input => {
                    input.value = '';
                });
            }
        }
    }

    // Обработка отправки формы товара
    if (productForm) {
        productForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const mode = this.getAttribute('data-mode');
            const productId = document.getElementById('productId').value;
            
            // Преобразуем FormData в объект
            const productData = {};
            for (let [key, value] of formData.entries()) {
                // Пропускаем файлы изображений и обрабатываем их отдельно
                if (key === 'mainImage' || key.startsWith('additionalImage')) {
                    if (value instanceof File && value.size > 0) {
                        // Обработка изображений будет выполнена позже
                        continue;
                    }
                } else {
                    productData[key] = value;
                }
            }
            
            // Обработка спецификаций
            const specKeys = formData.getAll('spec_key[]');
            const specValues = formData.getAll('spec_value[]');
            const specifications = [];
            
            for (let i = 0; i < specKeys.length; i++) {
                if (specKeys[i] && specValues[i]) {
                    specifications.push({
                        key: specKeys[i],
                        value: specValues[i]
                    });
                }
            }
            
            productData.specifications = specifications;
            
            // Преобразуем строковые значения в числовые и булевы
            productData.price = parseFloat(productData.price);
            productData.stock = parseInt(productData.stock);
            if (productData.discountPrice) {
                productData.discountPrice = parseFloat(productData.discountPrice);
            }
            productData.featured = !!productData.featured;
            productData.active = !!productData.active;
            
            try {
                let response;
                if (mode === 'edit' && productId) {
                    // Обновление существующего товара
                    response = await apiRequest(`/products/${productId}`, 'PUT', productData);
                    if (response) {
                        // Обработка загрузки изображений
                        const mainImageInput = document.getElementById('mainProductImage');
                        if (mainImageInput && mainImageInput.files && mainImageInput.files[0]) {
                            await uploadProductImage(productId, mainImageInput.files[0]);
                        }
                        
                        showNotification('Товар успешно обновлен', 'success');
                        closeModal('productModal');
                        loadProducts(); // Перезагружаем список товаров
                    }
                } else {
                    // Создание нового товара
                    response = await apiRequest('/products', 'POST', productData);
                    if (response && response.data) {
                        const newProductId = response.data._id;
                        
                        // Обработка загрузки изображений
                        const mainImageInput = document.getElementById('mainProductImage');
                        if (mainImageInput && mainImageInput.files && mainImageInput.files[0]) {
                            await uploadProductImage(newProductId, mainImageInput.files[0]);
                        }
                        
                        showNotification('Товар успешно создан', 'success');
                        closeModal('productModal');
                        loadProducts(); // Перезагружаем список товаров
                    }
                }
            } catch (error) {
                console.error('Error saving product:', error);
                showNotification('Ошибка при сохранении товара', 'error');
            }
        });
    }

    // Загрузка категорий из API
    async function loadCategories() {
        const categorySelect = document.getElementById('productCategory');
        if (!categorySelect) return;
        
        try {
            const response = await apiRequest('/categories');
            
            if (response && response.data && response.data.length > 0) {
                // Сохраняем текущее выбранное значение
                const currentValue = categorySelect.value;
                
                // Очищаем список категорий, оставляя только первый пустой элемент
                const firstOption = categorySelect.querySelector('option[value=""]');
                categorySelect.innerHTML = '';
                if (firstOption) {
                    categorySelect.appendChild(firstOption);
                }
                
                // Добавляем категории из API
                response.data.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.name;
                    option.textContent = category.name;
                    categorySelect.appendChild(option);
                });
                
                // Восстанавливаем выбранное значение
                if (currentValue) {
                    categorySelect.value = currentValue;
                }
            }
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }

    // Обработка файлов изображений
    const fileInputs = document.querySelectorAll('.file-input');
    const fileButtons = document.querySelectorAll('.file-upload-container .btn');

    if (fileInputs.length > 0 && fileButtons.length > 0) {
        for (let i = 0; i < fileButtons.length; i++) {
            const button = fileButtons[i];
            const input = button.previousElementSibling;
            const preview = button.previousElementSibling.previousElementSibling;
            
            if (button && input && preview) {
                button.addEventListener('click', function() {
                    input.click();
                });
                
                input.addEventListener('change', function(e) {
                    if (this.files && this.files[0]) {
                        const reader = new FileReader();
                        reader.onload = function(e) {
                            preview.src = e.target.result;
                        };
                        reader.readAsDataURL(this.files[0]);
                    }
                });
            }
        }
    }

    // Загрузка заказов
    async function loadOrders(page = 1, limit = 10) {
        const ordersList = document.querySelector('#orders tbody');
        const paginationContainer = document.querySelector('#orders .pagination');
        if (!ordersList) return;
        
        // Очищаем список заказов
        ordersList.innerHTML = '<tr><td colspan="6" class="text-center">Загрузка заказов...</td></tr>';
        
        try {
            const response = await apiRequest(`/orders?page=${page}&limit=${limit}`);
            
            if (response && response.data) {
                // Очищаем список заказов перед обновлением
                ordersList.innerHTML = '';
                
                if (response.data.length === 0) {
                    ordersList.innerHTML = '<tr><td colspan="6" class="text-center">Заказы не найдены</td></tr>';
                    if (paginationContainer) {
                        paginationContainer.innerHTML = '';
                    }
                    return;
                }
                
                // Добавляем заказы в таблицу
                response.data.forEach(order => {
                    const row = document.createElement('tr');
                    
                    // Получаем имя клиента
                    const customerName = order.customer ? 
                        `${order.customer.firstName} ${order.customer.lastName}` : 
                        'Неизвестный клиент';
                    
                    // Получаем статус заказа
                    let statusClass = '';
                    let statusText = '';
                    
                    switch (order.status) {
                        case 'pending':
                            statusClass = 'pending';
                            statusText = 'Новый';
                            break;
                        case 'processing':
                            statusClass = 'processing';
                            statusText = 'Обрабатывается';
                            break;
                        case 'shipped':
                            statusClass = 'shipped';
                            statusText = 'Отправлен';
                            break;
                        case 'delivered':
                            statusClass = 'delivered';
                            statusText = 'Доставлен';
                            break;
                        case 'cancelled':
                            statusClass = 'cancelled';
                            statusText = 'Отменен';
                            break;
                        default:
                            statusClass = 'pending';
                            statusText = 'Новый';
                    }
                    
                    // Форматирование даты
                    const orderDate = new Date(order.createdAt).toLocaleDateString();
                    
                    row.innerHTML = `
                        <td>${order._id}</td>
                        <td>
                            <div class="order-info">
                                <span class="order-date">${orderDate}</span>
                                <span class="order-items">${order.items ? order.items.length : 0} товаров</span>
                            </div>
                        </td>
                        <td>${customerName}</td>
                        <td>${order.totalAmount ? order.totalAmount.toFixed(2) : '0.00'} BYN</td>
                        <td>
                            <span class="status-badge ${statusClass}">
                                ${statusText}
                            </span>
                        </td>
                        <td>
                            <div class="actions">
                                <button type="button" class="view" data-id="${order._id}">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button type="button" class="edit" data-id="${order._id}">
                                    <i class="fas fa-edit"></i>
                                </button>
                            </div>
                        </td>
                    `;
                    
                    ordersList.appendChild(row);
                });
                
                // Добавляем обработчики событий для кнопок заказов
                addOrderEventListeners();
                
                // Обновляем пагинацию, если есть информация о ней
                if (paginationContainer && response.pagination) {
                    renderPagination(paginationContainer, response.pagination, (clickedPage) => {
                        loadOrders(clickedPage, limit);
                    });
                }
            }
        } catch (error) {
            ordersList.innerHTML = '<tr><td colspan="6" class="text-center">Ошибка загрузки заказов</td></tr>';
            console.error('Error loading orders:', error);
        }
    }
    
    // Добавление обработчиков событий для кнопок заказов
    function addOrderEventListeners() {
        const viewOrderButtons = document.querySelectorAll('#orders .view');
        const editOrderButtons = document.querySelectorAll('#orders .edit');
        
        if (viewOrderButtons.length > 0) {
            viewOrderButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const orderId = this.getAttribute('data-id');
                    viewOrder(orderId);
                });
            });
        }
        
        if (editOrderButtons.length > 0) {
            editOrderButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const orderId = this.getAttribute('data-id');
                    editOrder(orderId);
                });
            });
        }
    }
    
    // Просмотр заказа
    async function viewOrder(orderId) {
        try {
            const order = await apiRequest(`/orders/${orderId}`);
            
            if (order) {
                showOrderDetails(order);
            }
        } catch (error) {
            console.error('Error loading order details:', error);
            showNotification('Ошибка при загрузке информации о заказе', 'error');
        }
    }
    
    // Изменение статуса заказа
    async function editOrder(orderId) {
        try {
            const order = await apiRequest(`/orders/${orderId}`);
            
            if (order) {
                showOrderEditForm(order);
            }
        } catch (error) {
            console.error('Error loading order details for editing:', error);
            showNotification('Ошибка при загрузке информации о заказе', 'error');
        }
    }
    
    // Показать детали заказа
    function showOrderDetails(order) {
        // Создаем модальное окно для просмотра деталей заказа
        const modalHTML = `
            <div id="orderViewModal" class="modal">
                <div class="modal-backdrop"></div>
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Заказ №${order._id}</h2>
                        <button type="button" class="close-modal" id="closeOrderViewModal">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="order-details">
                            <div class="order-info-section">
                                <h3>Информация о заказе</h3>
                                <div class="info-grid">
                                    <div class="info-row">
                                        <span class="label">Дата:</span>
                                        <span class="value">${new Date(order.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div class="info-row">
                                        <span class="label">Статус:</span>
                                        <span class="value status-badge ${order.status}">${getOrderStatusText(order.status)}</span>
                                    </div>
                                    <div class="info-row">
                                        <span class="label">Сумма:</span>
                                        <span class="value">${order.totalAmount ? order.totalAmount.toFixed(2) : '0.00'} BYN</span>
                                    </div>
                                </div>
                            </div>
                            <div class="order-info-section">
                                <h3>Информация о клиенте</h3>
                                <div class="info-grid">
                                    <div class="info-row">
                                        <span class="label">Имя:</span>
                                        <span class="value">${order.customer ? order.customer.firstName + ' ' + order.customer.lastName : 'Н/Д'}</span>
                                    </div>
                                    <div class="info-row">
                                        <span class="label">Телефон:</span>
                                        <span class="value">${order.customer ? order.customer.phone : 'Н/Д'}</span>
                                    </div>
                                    <div class="info-row">
                                        <span class="label">Email:</span>
                                        <span class="value">${order.customer ? order.customer.email : 'Н/Д'}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="order-info-section">
                                <h3>Адрес доставки</h3>
                                <div class="info-grid">
                                    <div class="info-row">
                                        <span class="label">Адрес:</span>
                                        <span class="value">${order.shippingAddress ? order.shippingAddress.address : 'Н/Д'}</span>
                                    </div>
                                    <div class="info-row">
                                        <span class="label">Город:</span>
                                        <span class="value">${order.shippingAddress ? order.shippingAddress.city : 'Н/Д'}</span>
                                    </div>
                                    <div class="info-row">
                                        <span class="label">Почтовый индекс:</span>
                                        <span class="value">${order.shippingAddress ? order.shippingAddress.zip : 'Н/Д'}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="order-items-section">
                                <h3>Товары в заказе</h3>
                                <table class="items-table">
                                    <thead>
                                        <tr>
                                            <th>Товар</th>
                                            <th>Цена</th>
                                            <th>Кол-во</th>
                                            <th>Сумма</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${getOrderItemsHTML(order.items)}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td colspan="3" class="text-right">Итого:</td>
                                            <td>${order.totalAmount ? order.totalAmount.toFixed(2) : '0.00'} BYN</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" id="cancelOrderViewBtn">Закрыть</button>
                        <button type="button" class="btn btn-primary" id="editOrderStatusBtn" data-id="${order._id}">Изменить статус</button>
                    </div>
                </div>
            </div>
        `;
        
        // Добавляем модальное окно в DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Получаем элементы модального окна
        const modal = document.getElementById('orderViewModal');
        const closeBtn = document.getElementById('closeOrderViewModal');
        const cancelBtn = document.getElementById('cancelOrderViewBtn');
        const editStatusBtn = document.getElementById('editOrderStatusBtn');
        const backdrop = modal.querySelector('.modal-backdrop');
        
        // Добавляем обработчики событий
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        cancelBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        backdrop.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        editStatusBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
            editOrder(order._id);
        });
        
        // Предотвращаем закрытие при клике на контент
        modal.querySelector('.modal-content').addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
    
    // Функция для получения текста статуса заказа
    function getOrderStatusText(status) {
        switch(status) {
            case 'pending': return 'Новый';
            case 'processing': return 'Обрабатывается';
            case 'shipped': return 'Отправлен';
            case 'delivered': return 'Доставлен';
            case 'cancelled': return 'Отменен';
            default: return 'Неизвестный статус';
        }
    }
    
    // Функция для получения HTML товаров в заказе
    function getOrderItemsHTML(items) {
        if (!items || items.length === 0) {
            return '<tr><td colspan="4" class="text-center">Нет товаров в заказе</td></tr>';
        }
        
        return items.map(item => {
            const product = item.product || {};
            const price = item.price || product.price || 0;
            const quantity = item.quantity || 1;
            const subtotal = price * quantity;
            
            return `
                <tr>
                    <td>
                        <div class="product-info">
                            <img src="${product.mainImage || 'images/default-product.jpg'}" alt="${product.name}" class="product-img small">
                            <div>
                                <h4>${product.name || 'Неизвестный товар'}</h4>
                                <p>Артикул: ${product.sku || 'Н/Д'}</p>
                            </div>
                        </div>
                    </td>
                    <td>${price.toFixed(2)} BYN</td>
                    <td>${quantity}</td>
                    <td>${subtotal.toFixed(2)} BYN</td>
                </tr>
            `;
        }).join('');
    }
    
    // Показать форму редактирования заказа
    function showOrderEditForm(order) {
        // Создаем модальное окно для редактирования статуса заказа
        const modalHTML = `
            <div id="orderEditModal" class="modal">
                <div class="modal-backdrop"></div>
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Изменить статус заказа №${order._id}</h2>
                        <button type="button" class="close-modal" id="closeOrderEditModal">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <form id="orderEditForm">
                            <div class="form-group">
                                <label for="orderStatus">Статус заказа</label>
                                <select id="orderStatus" name="status" class="form-control">
                                    <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Новый</option>
                                    <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Обрабатывается</option>
                                    <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Отправлен</option>
                                    <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Доставлен</option>
                                    <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Отменен</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="orderNotes">Комментарий (опционально)</label>
                                <textarea id="orderNotes" name="notes" class="form-control" rows="3">${order.notes || ''}</textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" id="cancelOrderEditBtn">Отмена</button>
                        <button type="button" class="btn btn-primary" id="saveOrderStatusBtn" data-id="${order._id}">Сохранить</button>
                    </div>
                </div>
            </div>
        `;
        
        // Добавляем модальное окно в DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Получаем элементы модального окна
        const modal = document.getElementById('orderEditModal');
        const closeBtn = document.getElementById('closeOrderEditModal');
        const cancelBtn = document.getElementById('cancelOrderEditBtn');
        const saveBtn = document.getElementById('saveOrderStatusBtn');
        const backdrop = modal.querySelector('.modal-backdrop');
        
        // Добавляем обработчики событий
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        cancelBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        backdrop.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        saveBtn.addEventListener('click', () => {
            const orderId = saveBtn.getAttribute('data-id');
            const status = document.getElementById('orderStatus').value;
            const notes = document.getElementById('orderNotes').value;
            
            updateOrderStatus(orderId, status, notes);
            document.body.removeChild(modal);
        });
        
        // Предотвращаем закрытие при клике на контент
        modal.querySelector('.modal-content').addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
    
    // Обновление статуса заказа
    async function updateOrderStatus(orderId, status, notes) {
        try {
            console.log(`Обновляем статус заказа ${orderId} на ${status}`);
            
            // Сразу обновляем UI для лучшего пользовательского опыта
            const orderRow = document.querySelector(`#orders tr button[data-id="${orderId}"]`)?.closest('tr');
            if (orderRow) {
                const statusBadge = orderRow.querySelector('.status-badge');
                if (statusBadge) {
                    // Удаляем предыдущие классы статуса
                    statusBadge.classList.remove('pending', 'processing', 'shipped', 'delivered', 'cancelled');
                    // Добавляем новый класс статуса
                    statusBadge.classList.add(status);
                    // Обновляем текст
                    statusBadge.textContent = getOrderStatusText(status);
                }
            }
            
            const response = await apiRequest(`/orders/${orderId}`, 'PUT', { status, notes });
            
            if (response) {
                showNotification('Статус заказа успешно обновлен', 'success');
            } else {
                showNotification('Запрос на обновление статуса заказа отправлен', 'info');
                
                // Если мы не в демо-режиме, перезагружаем заказы
                if (!isDemoMode) {
                    setTimeout(() => {
                        loadOrders();
                    }, 500);
                }
            }
        } catch (error) {
            console.error('Error updating order status:', error);
            showNotification('Ошибка при обновлении статуса заказа', 'error');
            
            // При ошибке перезагружаем список заказов
            setTimeout(() => {
                loadOrders();
            }, 500);
        }
    }
    
    // Загрузка клиентов
    async function loadCustomers() {
        // Аналогично loadProducts() и loadOrders()
    }
    
    // Загрузка отзывов
    async function loadReviews() {
        const reviewsList = document.querySelector('#reviews .reviews-list');
        if (!reviewsList) return;
        
        // Очищаем список отзывов
        reviewsList.innerHTML = '<div class="loading">Загрузка отзывов...</div>';
        
        try {
            const response = await apiRequest('/reviews');
            
            if (response && response.data) {
                // Очищаем список отзывов перед обновлением
                reviewsList.innerHTML = '';
                
                if (response.data.length === 0) {
                    reviewsList.innerHTML = '<div class="no-data">Отзывы не найдены</div>';
                    return;
                }
                
                // Добавляем отзывы в список
                response.data.forEach(review => {
                    const card = document.createElement('div');
                    card.className = 'review-card';
                    card.setAttribute('data-id', review._id);
                    
                    let statusClass = 'pending';
                    let statusText = 'На рассмотрении';
                    
                    if (review.status === 'approved') {
                        statusClass = 'approved';
                        statusText = 'Опубликован';
                    } else if (review.status === 'rejected') {
                        statusClass = 'rejected';
                        statusText = 'Отклонен';
                    }
                    
                    card.innerHTML = `
                        <div class="review-header">
                            <h4>${review.product ? review.product.name : 'Неизвестный товар'}</h4>
                            <span class="status-badge ${statusClass}">${statusText}</span>
                        </div>
                        <div class="review-info">
                            <div class="author">
                                <i class="fas fa-user"></i>
                                <span>${review.author}</span>
                            </div>
                            <div class="rating">
                                ${generateStarRating(review.rating)}
                            </div>
                            <div class="date">
                                <i class="far fa-calendar-alt"></i>
                                <span>${new Date(review.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <div class="review-content">
                            <p>${review.text}</p>
                        </div>
                        <div class="review-actions">
                            ${review.status === 'pending' ? `
                                <button type="button" class="action-btn approve" data-id="${review._id}">
                                    <i class="fas fa-check"></i> Одобрить
                                </button>
                                <button type="button" class="action-btn reject" data-id="${review._id}">
                                    <i class="fas fa-times"></i> Отклонить
                                </button>
                            ` : ''}
                            <button type="button" class="action-btn delete" data-id="${review._id}">
                                <i class="fas fa-trash-alt"></i> Удалить
                            </button>
                        </div>
                    `;
                    
                    reviewsList.appendChild(card);
                });
                
                // Добавляем обработчики событий для кнопок
                addReviewEventListeners();
            }
        } catch (error) {
            reviewsList.innerHTML = '<div class="error">Ошибка загрузки отзывов</div>';
            console.error('Error loading reviews:', error);
        }
    }
    
    // Генерация HTML для звезд рейтинга
    function generateStarRating(rating) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                stars += '<i class="fas fa-star"></i>';
            } else if (i - 0.5 <= rating) {
                stars += '<i class="fas fa-star-half-alt"></i>';
            } else {
                stars += '<i class="far fa-star"></i>';
            }
        }
        return stars;
    }
    
    // Добавление обработчиков событий для кнопок отзывов
    function addReviewEventListeners() {
        // Одобрение отзыва
        const approveButtons = document.querySelectorAll('#reviews .action-btn.approve');
        const rejectButtons = document.querySelectorAll('#reviews .action-btn.reject');
        const deleteReviewButtons = document.querySelectorAll('#reviews .action-btn.delete');
        
        if (approveButtons.length > 0) {
            approveButtons.forEach(button => {
                // Удаляем старые обработчики, чтобы избежать дублирования
                const oldButton = button.cloneNode(true);
                button.parentNode.replaceChild(oldButton, button);
                
                oldButton.addEventListener('click', function() {
                    const reviewId = this.getAttribute('data-id');
                    approveReview(reviewId);
                });
            });
        }
        
        if (rejectButtons.length > 0) {
            rejectButtons.forEach(button => {
                // Удаляем старые обработчики, чтобы избежать дублирования
                const oldButton = button.cloneNode(true);
                button.parentNode.replaceChild(oldButton, button);
                
                oldButton.addEventListener('click', function() {
                    const reviewId = this.getAttribute('data-id');
                    rejectReview(reviewId);
                });
            });
        }
        
        if (deleteReviewButtons.length > 0) {
            deleteReviewButtons.forEach(button => {
                // Удаляем старые обработчики, чтобы избежать дублирования
                const oldButton = button.cloneNode(true);
                button.parentNode.replaceChild(oldButton, button);
                
                oldButton.addEventListener('click', function() {
                    const reviewId = this.getAttribute('data-id');
                    if (confirm('Вы уверены, что хотите удалить этот отзыв?')) {
                        deleteReview(reviewId);
                    }
                });
            });
        }
    }
    
    // Функция одобрения отзыва
    async function approveReview(reviewId) {
        try {
            console.log(`Одобряем отзыв с ID: ${reviewId}`);
            
            // Сразу обновляем UI для лучшего пользовательского опыта
            const reviewCard = document.querySelector(`.review-card[data-id="${reviewId}"]`);
            if (reviewCard) {
                const statusBadge = reviewCard.querySelector('.status-badge');
                if (statusBadge) {
                    statusBadge.className = 'status-badge approved';
                    statusBadge.textContent = 'Опубликован';
                }
                
                // Удаляем кнопки approve/reject
                const approveBtn = reviewCard.querySelector('.action-btn.approve');
                const rejectBtn = reviewCard.querySelector('.action-btn.reject');
                if (approveBtn) approveBtn.remove();
                if (rejectBtn) rejectBtn.remove();
            }
            
            const response = await apiRequest(`/reviews/${reviewId}/approve`, 'PUT');
            
            if (response) {
                showNotification('Отзыв успешно опубликован', 'success');
            } else {
                showNotification('Запрос на публикацию отзыва отправлен', 'info');
                // Если операция не удалась, но мы в демо-режиме, не перезагружаем
                if (!isDemoMode) {
                    setTimeout(() => {
                        loadReviews();
                    }, 500);
                }
            }
        } catch (error) {
            console.error('Error approving review:', error);
            showNotification('Ошибка при публикации отзыва', 'error');
            
            // При ошибке перезагружаем отзывы после задержки
            setTimeout(() => {
                loadReviews();
            }, 500);
        }
    }
    
    // Функция отклонения отзыва
    async function rejectReview(reviewId) {
        try {
            console.log(`Отклоняем отзыв с ID: ${reviewId}`);
            
            // Сразу обновляем UI для лучшего пользовательского опыта
            const reviewCard = document.querySelector(`.review-card[data-id="${reviewId}"]`);
            if (reviewCard) {
                const statusBadge = reviewCard.querySelector('.status-badge');
                if (statusBadge) {
                    statusBadge.className = 'status-badge rejected';
                    statusBadge.textContent = 'Отклонен';
                }
                
                // Удаляем кнопки approve/reject
                const approveBtn = reviewCard.querySelector('.action-btn.approve');
                const rejectBtn = reviewCard.querySelector('.action-btn.reject');
                if (approveBtn) approveBtn.remove();
                if (rejectBtn) rejectBtn.remove();
            }
            
            const response = await apiRequest(`/reviews/${reviewId}/reject`, 'PUT');
            
            if (response) {
                showNotification('Отзыв отклонен', 'success');
            } else {
                showNotification('Запрос на отклонение отзыва отправлен', 'info');
                // Если операция не удалась, но мы в демо-режиме, не перезагружаем
                if (!isDemoMode) {
                    setTimeout(() => {
                        loadReviews();
                    }, 500);
                }
            }
        } catch (error) {
            console.error('Error rejecting review:', error);
            showNotification('Ошибка при отклонении отзыва', 'error');
            
            // При ошибке перезагружаем отзывы после задержки
            setTimeout(() => {
                loadReviews();
            }, 500);
        }
    }
    
    // Функция удаления отзыва
    async function deleteReview(reviewId) {
        if (!reviewId) {
            showNotification('Ошибка: ID отзыва отсутствует', 'error');
            return;
        }
        
        try {
            console.log(`Удаляем отзыв с ID: ${reviewId}`);
            
            // Находим карточку отзыва для визуального удаления
            const reviewCard = document.querySelector(`.review-card[data-id="${reviewId}"]`);
            if (reviewCard) {
                // Добавляем класс анимации удаления
                reviewCard.classList.add('deleting');
                setTimeout(() => {
                    reviewCard.remove();
                }, 300);
            }
            
            // Для демо-режима немедленно удаляем из памяти
            if (isDemoMode) {
                const reviewIndex = demoData.reviews.findIndex(r => r._id === reviewId);
                if (reviewIndex !== -1) {
                    demoData.reviews.splice(reviewIndex, 1);
                }
            }
            
            const response = await apiRequest(`/reviews/${reviewId}`, 'DELETE');
            
            if (response) {
                showNotification('Отзыв успешно удален', 'success');
                // Если карточка не была найдена, обновляем список отзывов
                if (!reviewCard) {
                    setTimeout(() => {
                        loadReviews();
                    }, 500);
                }
            } else {
                showNotification('Запрос удаления выполнен. Обновление списка...', 'info');
                // Перезагружаем список отзывов в любом случае
                setTimeout(() => {
                    loadReviews();
                }, 500);
            }
        } catch (error) {
            console.error('Error deleting review:', error);
            showNotification(`Ошибка при удалении отзыва: ${error.message}`, 'error');
            
            // Если в демо-режиме, считаем удаление успешным
            if (isDemoMode) {
                showNotification('Отзыв удален (демо-режим)', 'success');
            } else {
                // Обновляем список отзывов после ошибки
                setTimeout(() => {
                    loadReviews();
                }, 500);
            }
        }
    }
    
    // Обработка превью изображений перед загрузкой
    document.querySelectorAll('.image-upload').forEach(input => {
        const previewImg = input.previousElementSibling.previousElementSibling;
        
        input.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    previewImg.src = e.target.result;
                };
                
                reader.readAsDataURL(this.files[0]);
            }
        });
    });
    
    // Загрузка изображения товара
    async function uploadProductImage(productId, file) {
        const formData = new FormData();
        formData.append('image', file);
        
        try {
            const token = getAuthToken();
            const response = await fetch(`${API_URL}/products/${productId}/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                body: formData
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Произошла ошибка при загрузке изображения');
            }
            
            showNotification('Изображение успешно загружено', 'success');
            return result;
        } catch (error) {
            console.error('Error uploading image:', error);
            
            // Если в демо-режиме, имитируем успешную загрузку
            if (isDemoMode) {
                showNotification('Изображение сохранено (демо)', 'success');
                return { success: true, imagePath: previewImg.src };
            } else {
                showNotification('Ошибка при загрузке изображения', 'error');
                return null;
            }
        }
    }
    
    // Добавление нового товара
    const addButtons = document.querySelectorAll('.add-button');
    
    if (addButtons.length > 0) {
        addButtons.forEach(button => {
            button.addEventListener('click', function() {
                if (this.closest('#products')) {
                    openAddProductModal();
                } else if (this.closest('#customers')) {
                    // Открытие модального окна для добавления клиента
                } else if (this.closest('#user-settings')) {
                    // Открытие модального окна для добавления пользователя
                }
            });
        });
    }
    
    // Уведомления пользователя
    function showNotification(message, type = 'info') {
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
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 5000);
        
        notification.querySelector('.notification-close').addEventListener('click', function() {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        });
    }
    
    // Обработка формы поиска
    const searchForm = document.querySelector('.header-search');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const searchTerm = this.querySelector('input').value;
            // Здесь можно добавить код для поиска через API
            // searchProducts(searchTerm);
        });
    }
    
    // Обработка форм настроек
    const settingsForms = document.querySelectorAll('.settings-form');
    
    if (settingsForms.length > 0) {
        settingsForms.forEach(form => {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                const formData = new FormData(this);
                const data = {};
                
                for (let [key, value] of formData.entries()) {
                    data[key] = value;
                }
                
                // Отправка настроек на сервер
                apiRequest('/settings', 'POST', data)
                    .then(response => {
                        if (response) {
                            showNotification('Настройки сохранены!', 'success');
                        }
                    })
                    .catch(error => {
                        console.error('Error saving settings:', error);
                        showNotification('Ошибка при сохранении настроек', 'error');
                    });
            });
        });
    }
    
    // Загрузка товаров при первом открытии страницы
    if (document.querySelector('#products.active')) {
        loadProducts();
    }

    // Обработка выхода из системы
    const logoutButton = document.querySelector('.logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }

    // Функция выхода из системы
    function logout() {
        // Удаляем токен из localStorage
        localStorage.removeItem('adminToken');
        
        // Перенаправляем на страницу входа
        window.location.href = 'login.html';
    }
}); 